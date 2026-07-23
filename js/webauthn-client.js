/**
 * js/webauthn-client.js
 * ──────────────────────────────────────────────────────────────────
 * Browser-side WebAuthn helpers.
 * Encapsulates navigator.credentials.create() and .get() calls,
 * base64url encoding/decoding, and JSON serialisation for the wire format.
 *
 * Usage:
 *   const { startRegistration, startAuthentication, isBiometricAvailable } = window.WebAuthnClient;
 */

(function (global) {
  'use strict';

  // ── Base64url helpers ─────────────────────────────────────────────────────

  /**
   * Convert an ArrayBuffer (or Uint8Array) to a base64url string.
   * @param {ArrayBuffer|Uint8Array} buffer
   * @returns {string}
   */
  function bufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Convert a base64url string to a Uint8Array.
   * @param {string} base64url
   * @returns {Uint8Array}
   */
  function base64urlToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary  = atob(padded);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // ── Feature detection ─────────────────────────────────────────────────────

  /**
   * Returns true if the browser supports WebAuthn platform authenticators
   * (i.e., device-level biometrics like fingerprint or face unlock).
   * @returns {Promise<boolean>}
   */
  async function isBiometricAvailable() {
    try {
      if (!window.PublicKeyCredential) return false;
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') return false;
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  // ── Registration ──────────────────────────────────────────────────────────

  /**
   * Transforms server-side PublicKeyCredentialCreationOptions (base64url-encoded)
   * into the browser's expected ArrayBuffer format, calls navigator.credentials.create(),
   * and returns a serialisable credential object to send back to the server.
   *
   * @param {object} options — options from POST /api/webauthn/register-options
   * @returns {Promise<object>} — credential to POST to /api/webauthn/register-verify
   */
  async function startRegistration(options) {
    const publicKey = {
      ...options,
      // Decode server's base64url strings → ArrayBuffers for the browser API
      challenge:   base64urlToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64urlToBuffer(options.user.id),
      },
      excludeCredentials: (options.excludeCredentials || []).map(c => ({
        ...c,
        id: base64urlToBuffer(c.id),
      })),
    };

    const credential = await navigator.credentials.create({ publicKey });
    if (!credential) throw new Error('Registration cancelled or failed.');

    // Serialise the credential back to base64url for the server
    return {
      id:    credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type:  credential.type,
      response: {
        attestationObject: bufferToBase64url(credential.response.attestationObject),
        clientDataJSON:    bufferToBase64url(credential.response.clientDataJSON),
        transports:        credential.response.getTransports?.() || [],
      },
    };
  }

  // ── Authentication ────────────────────────────────────────────────────────

  /**
   * Transforms server-side PublicKeyCredentialRequestOptions into browser format,
   * calls navigator.credentials.get() (triggers fingerprint scanner),
   * and returns a serialisable assertion to send back to the server.
   *
   * @param {object} options — options from POST /api/webauthn/auth-options
   * @returns {Promise<object>} — assertion to POST to /api/webauthn/auth-verify
   */
  async function startAuthentication(options) {
    if (!options.challenge) throw new Error('No challenge provided by server.');

    const publicKey = {
      ...options,
      challenge: base64urlToBuffer(options.challenge),
      allowCredentials: (options.allowCredentials || []).map(c => ({
        ...c,
        id: base64urlToBuffer(c.id),
      })),
    };

    const assertion = await navigator.credentials.get({ publicKey });
    if (!assertion) throw new Error('Authentication cancelled or failed.');

    return {
      id:    assertion.id,
      rawId: bufferToBase64url(assertion.rawId),
      type:  assertion.type,
      response: {
        authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
        clientDataJSON:    bufferToBase64url(assertion.response.clientDataJSON),
        signature:         bufferToBase64url(assertion.response.signature),
        userHandle:        assertion.response.userHandle
          ? bufferToBase64url(assertion.response.userHandle)
          : undefined,
      },
    };
  }

  // ── Local credential store ────────────────────────────────────────────────

  const STORAGE_KEY = 'mqlc_biometric';

  /**
   * Persist the enrolled credential metadata for this device.
   * @param {string} email
   * @param {string} credentialId
   */
  function saveEnrolledCredential(email, credentialId) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, credentialId }));
    } catch { /* storage unavailable — silently ignore */ }
  }

  /**
   * Retrieve enrolled credential metadata, or null if not enrolled.
   * @returns {{ email: string, credentialId: string }|null}
   */
  function getEnrolledCredential() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove the enrolled credential metadata (e.g., on "Remove biometric" action).
   */
  function clearEnrolledCredential() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // ── Export ────────────────────────────────────────────────────────────────

  global.WebAuthnClient = {
    isBiometricAvailable,
    startRegistration,
    startAuthentication,
    saveEnrolledCredential,
    getEnrolledCredential,
    clearEnrolledCredential,
  };
})(window);
