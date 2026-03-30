const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace the Marquee Contact Info
const oldMarquee = /<div class="accreditation-bar" id="contact">.*?<\/div>\s*<\/div>\s*<\/div>/s;
const newMarquee = `  <div class="accreditation-bar" id="contact">
    <div class="marquee-wrapper">
      <div class="marquee-content">
        <span>
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <span aria-hidden="true">
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
          A project under the guidance of <a href="https://www.ahlehadeesmumbai.com/" target="_blank" rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai 
          &nbsp;&nbsp;&nbsp;&nbsp;◈&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>
  </div>`;

html = html.replace(oldMarquee, newMarquee);

// 2. Replace the SVG icons in Features Grid
const oldFeatures = /<div class="features-grid reveal">.*?<\/div>\s*<\/div>\s*<\/section>/s;
const newFeatures = `<div class="features-grid reveal">
        <!-- 1 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h4 data-en="Multiple Batches" data-mr="अनेक बॅचेस" data-ur="متعدد بیچز" data-hi="कई बैच">Multiple Batches</h4>
        </div>
        <!-- 2 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-1 1H18"/><path d="M13.08 8C13.5 9 14 10 14 11s-.5 2-1 3"/><path d="M6 13h8a4 4 0 0 0 0-8"/></svg>
          </div>
          <h4 data-en="Affordable Fee" data-mr="परवडणारे शुल्क" data-ur="سستی فیس" data-hi="किफायती शुल्क">Affordable Fee</h4>
        </div>
        <!-- 3 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h4 data-en="Flexible Timings" data-mr="लवचिक वेळा" data-ur="لچکدار اوقات" data-hi="लचीला समय">Flexible Timings</h4>
        </div>
        <!-- 4 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5L2 10zM6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h4 data-en="Experienced Teachers" data-mr="अनुभवी शिक्षक" data-ur="تجربہ کار اساتذہ" data-hi="अनुभवी शिक्षक">Experienced Teachers</h4>
        </div>
        <!-- 5 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
          </div>
          <h4 data-en="Air Conditioned" data-mr="वातानुकूलित" data-ur="ایئر کنڈیشنڈ" data-hi="वातानुकूलित">Air Conditioned</h4>
        </div>
        <!-- 6 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
          <h4 data-en="Spacious Carpeted Rooms" data-mr="हवेशीर कार्पेट रूम्स" data-ur="کشادہ اور کارپٹ والے کمرے" data-hi="विशाल कालीन वाले कमरे">Spacious Carpeted Rooms</h4>
        </div>
        <!-- 7 -->
        <div class="feature-card">
          <div class="feature-icon">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
          </div>
          <h4 data-en="Washroom Facility" data-mr="स्वच्छतागृह सुविधा" data-ur="واش روم کی سہولت" data-hi="शौचालय की सुविधा">Washroom Facility</h4>
        </div>
        <!-- 8 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <h4 data-en="CCTV Surveillance" data-mr="सीसीटीव्ही निरीक्षण" data-ur="سی سی ٹی وی نگرانی" data-hi="सीसीटीवी निगरानी">CCTV Surveillance</h4>
        </div>
        <!-- 9 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </div>
          <h4 data-en="Ample Illumination" data-mr="भरपूर प्रकाश" data-ur="کافی روشنی" data-hi="पर्याप्त रोशनी">Ample Illumination</h4>
        </div>
        <!-- 10 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 21v-2a4 4 0 0 0-4-4"/><circle cx="17" cy="7" r="4"/><path d="M7 21v-2a4 4 0 0 1 4-4"/><circle cx="7" cy="7" r="4"/></svg>
          </div>
          <h4 data-en="Gender Segregation" data-mr="मुले आणि मुलींसाठी वेगळी व्यवस्था" data-ur="لڑکوں اور لڑکیوں کے درمیان علیحدگی" data-hi="लड़कों और लड़कियों के लिए अलग व्यवस्था">Gender Segregation</h4>
        </div>
      </div>
    </div>
  </section>`;

html = html.replace(oldFeatures, newFeatures);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated icons and marquee.');
