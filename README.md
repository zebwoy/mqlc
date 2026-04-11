<div align="center">
  <h1>Millat Qur'an Learning Center (MQLC) Platform</h1>
  <p>A high-performance, multi-lingual, serverless platform for Madrasa operations.</p>
  
  [![Tech Stack: Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)](#)
  [![Database: Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](#)
  [![UI: Custom CSS](https://img.shields.io/badge/CSS3-Custom-blue.svg)](#)
  [![Deployment: Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black.svg)](#)
</div>

<br />

## 📖 Overview
The **MQLC Web Platform** is designed to digitize and streamline the operations of the Millat Qur'an Learning Center. It features a stunning public-facing landing page, a real-time multi-step student admission portal, and a secure backend Command Center for administration. 

This project was built from the ground up focusing on **zero-latency performance**, **complex typography localization**, and modern **serverless infrastructure**.

---

## ✨ Key Technical Achievements

- **🌍 Zero-Dependency Localization Engine:** Custom-built DOM parsing instantly translates the site between English, Hindi, Marathi, and Urdu. Dynamically handles bi-directional reading rules (LTR/RTL) and strict Nastaliq/Arabic typography scaling without heavy i18n libraries.
- **⚡ Serverless Backend (Supabase):** Full database integrations (CRUD) running natively over Postgres with Row Level Security (RLS) policies, entirely eliminating the need for a bloated middle-tier node server. 
- **📈 Real-Time Analytics Dashboard:** Administrative command center featuring dynamic Key Performance Indicators (KPIs) and animated data visualizations powered by `Chart.js`.
- **☁️ Integrated Media Architecture:** Allows secure administrative uploading of live updates, quiz files, and PDF bulletins directly to a Cloudinary CDN edge bucket.
- **🕌 Autonomous API Synchronization:** The frontend intercepts manual database configurations to autonomously hot-swap specific geometric sunset parameters (Maghrib prayer timings) dynamically via the global Aladhan REST API.

---

## 🏗️ Architecture & Tech Stack

Instead of defaulting to large abstracted frameworks, MQLC is powered by a hyper-optimized **JAMstack architecture** to achieve maximum speed and extremely lightweight frontend asset loading.

### Frontend
- **HTML5 & CSS3:** Completely custom styling matrix utilizing advanced CSS Grid, Flexbox, dynamic custom properties (`var()`), and CSS-native Parallax (`background-attachment: fixed`).
- **Vanilla JavaScript (ES6+):** Pure, native JS engine managing asynchronous fetching, component rendering, and intersection observers for scroll animations.
- **Chart.js:** Robust client-side rendering for administrative demographic reports.

### Backend & APIs
- **Supabase (PostgreSQL):** Serverless Backend-as-a-Service handling authentication, student registration payloads, and global configurations natively via the `@supabase/supabase-js` SDK.
- **Cloudinary Widget API:** Edge-optimized media intake pipeline seamlessly interacting via secure JS.
- **Aladhan Global API:** Third-party REST endpoint injected to compute dynamic prayer synchronizations contextually tied to geographic zones.

---

## 📂 Core Structure

```text
mqlc/
├── index.html              # Public Landing Page & Live Bulletin
├── register.html           # Multi-step OTP Student Registration Portal
├── admin.html              # Secured Administrative Operations Dashboard
├── css/
│   ├── main.css            # Root variables, Typography rules, & Globals
│   ├── admin.css           # Admin GUI layout matrix
│   └── hero.css            # Dynamic responsive hero blocks
├── js/
│   ├── main.js             # External API requests, Observers, Live Counters
│   ├── lang.js             # State retention & recursive translation engine
│   ├── admin.js            # Dashboard logic, Chart.js mapping & CRUD 
│   └── register.js         # OTP Verification & Database insertion gates
```

---

## 🚀 Local Development

1. **Clone the repository.**
2. Initialize the development sandbox:  
   ```bash
   npx vercel dev
   ```
   *(You can also securely run it on any standard local HTTP server environment).*
3. **Environment Setup:** Ensure you provide a valid `js/supabase-config.js` containing your provisioned Supabase public parameters.

> **Note:** The application expects a modern Chromium/WebKit compliant browser environment to natively execute ES6 asynchronous payload routing and JavaScript animations.

---
<div align="center">
  <i>Developed with precision for community impact.</i>
</div>
