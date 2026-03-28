document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById('updates-carousel');
  if (!carousel) return;

  // Fetch Cloudinary updates from our Vercel Serverless Function
  async function fetchUpdates() {
    try {
      const response = await fetch('/api/get-updates');
      
      if (!response.ok) {
        throw new Error("Failed to fetch updates or API not running.");
      }
      
      const data = await response.json();
      
      if (data.success && data.resources && data.resources.length > 0) {
        renderUpdates(data.resources);
      } else {
        showEmptyState();
      }
    } catch (error) {
      console.warn("Updates API Warning:", error);
      // If we are running locally via Live Server (not Vercel Dev), the /api route will 404.
      // We render a fallback placeholder state for development aesthetics.
      renderFallbackState();
    }
  }

  function renderUpdates(resources) {
    // Clear Skeletons
    carousel.innerHTML = '';
    
    // Cloudinary automatically returns secure_url and resource_type
    resources.forEach(item => {
      const card = document.createElement('div');
      card.className = 'update-card';
      
      // Parse a readable date from Cloudinary created_at (e.g., "Oct 24")
      const date = new Date(item.created_at);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let mediaStr = '';
      if (item.resource_type === 'video') {
        mediaStr = `<video src="${item.secure_url}" class="update-media" controls muted playsinline></video>`;
      } else {
        mediaStr = `<img src="${item.secure_url}" class="update-media" alt="MQLC Update" loading="lazy">`;
      }

      card.innerHTML = `
        <div class="update-date">${dateString}</div>
        ${mediaStr}
      `;
      
      carousel.appendChild(card);
    });
  }

  function renderFallbackState() {
    carousel.innerHTML = `
      <div class="update-card" style="display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
        <div>
          <h4 style="color:var(--gold);">Local Dev Mode</h4>
          <p style="font-size:0.9rem;color:var(--text-mid);margin-top:0.5rem;">Run 'npx vercel dev' to see live Cloudinary updates!</p>
        </div>
      </div>
    `;
  }

  function showEmptyState() {
    carousel.innerHTML = `
       <div class="update-card" style="display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
        <div>
          <h4 style="color:var(--midnight);">No Updates Yet</h4>
          <p style="font-size:0.9rem;color:var(--text-mid);margin-top:0.5rem;">Check back soon for new photos after the inauguration!</p>
        </div>
      </div>
    `;
  }

  // Initialize
  fetchUpdates();
});
