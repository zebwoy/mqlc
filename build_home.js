const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject Features between About and Updates
const featuresHTML = `
  <!-- ═══════════════════════════════════════════════════════════
       FEATURES
  ════════════════════════════════════════════════════════════ -->
  <section class="features-section" id="features" aria-label="Our Facilities">
    <div class="container">
      <div class="features-header reveal">
        <span class="section-label" data-en="Why Choose Us" data-mr="आम्हाला का निवडावे" data-ur="ہمیں کیوں منتخب کریں" data-hi="हमें क्यों चुनें">Why Choose Us</span>
        <h2 data-en="Our Facilities & Features" data-mr="आमच्या सुविधा आणि वैशिष्ट्ये" data-ur="ہماری سہولیات اور خصوصیات" data-hi="हमारी सुविधाएँ और विशेषताएँ">Our Facilities & Features</h2>
        <div class="gold-divider center"></div>
      </div>

      <div class="features-grid reveal">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <h4 data-en="Experienced Teachers" data-mr="अनुभवी शिक्षक" data-ur="تجربہ کار اساتذہ" data-hi="अनुभवी शिक्षक">Experienced Teachers</h4>
        </div>
        <!-- 5 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 1 0 4 13v7h7z"></path><path d="M11 13a7 7 0 1 0-7-7v7h7z"></path></svg>
          </div>
          <h4 data-en="Air Conditioned" data-mr="वातानुकूलित" data-ur="ایئر کنڈیشنڈ" data-hi="वातानुकूलित">Air Conditioned</h4>
        </div>
        <!-- 6 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
          </div>
          <h4 data-en="Spacious Carpeted Rooms" data-mr="हवेशीर कार्पेट रूम्स" data-ur="کشادہ اور کارپٹ والے کمرے" data-hi="विशाल कालीन वाले कमरे">Spacious Carpeted Rooms</h4>
        </div>
        <!-- 7 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </div>
          <h4 data-en="Washroom Facility" data-mr="स्वच्छतागृह सुविधा" data-ur="واش روم کی سہولت" data-hi="शौचालय की सुविधा">Washroom Facility</h4>
        </div>
        <!-- 8 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h4 data-en="CCTV Surveillance" data-mr="सीसीटीव्ही निरीक्षण" data-ur="سی سی ٹی وی نگرانی" data-hi="सीसीटीवी निगरानी">CCTV Surveillance</h4>
        </div>
        <!-- 9 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M3.5 3.5l1.4 1.4"></path><path d="M19.1 19.1l1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M3.5 20.5l1.4-1.4"></path><path d="M19.1 4.9l1.4-1.4"></path><circle cx="12" cy="12" r="4"></circle></svg>
          </div>
          <h4 data-en="Ample Illumination" data-mr="भरपूर प्रकाश" data-ur="کافی روشنی" data-hi="पर्याप्त रोशनी">Ample Illumination</h4>
        </div>
        <!-- 10 -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <h4 data-en="Gender Segregation" data-mr="मुले आणि मुलींसाठी वेगळी व्यवस्था" data-ur="لڑکوں اور لڑکیوں کے درمیان علیحدگی" data-hi="लड़कों और लड़कियों के लिए अलग व्यवस्था">Gender Segregation</h4>
        </div>
      </div>
    </div>
  </section>

  <!-- UPDATES CAROUSEL SECTION -->`;

html = html.replace('<!-- UPDATES CAROUSEL SECTION -->', featuresHTML);


// 2. Replace the Programs Placeholder
const programsHTML = `
  <!-- ═══════════════════════════════════════════════════════════
       PROGRAMS / SYLLABUS
  ════════════════════════════════════════════════════════════ -->
  <section class="programs-section" id="programs" aria-label="Our Syllabus">
    <div class="container">
      <div class="programs-header reveal">
        <span class="section-label" data-en="Our Syllabus" data-mr="आमचा अभ्यासक्रम" data-ur="ہمارا نصاب" data-hi="हमारा पाठ्यक्रम">Our Syllabus</span>
        <h2 data-en="Comprehensive Learning Paths" data-mr="सर्वसमावेशक शिक्षण मार्ग" data-ur="جامع تعلیم کے راستے" data-hi="व्यापक शिक्षण मार्ग">Comprehensive Learning Paths</h2>
        <div class="gold-divider center"></div>
        <p data-en="A structured and progressive curriculum designed to build a profound connection with the Qur'an." data-mr="कुराणाशी सखोल संबंध प्रस्थापित करण्यासाठी तयार केलेला एक संरचित आणि पुरोगामी अभ्यासक्रम." data-ur="قرآن کے ساتھ گہرا تعلق قائم کرنے کے لیے تیار کیا گیا ایک منظم اور ترقی پسند نصاب۔" data-hi="कुरआन के साथ गहरा संबंध बनाने के लिए डिज़ाइन किया गया एक संरचित और प्रगतिशील पाठ्यक्रम।">A structured and progressive curriculum designed to build a profound connection with the Qur'an.</p>
      </div>

      <div class="programs-grid reveal">
        <!-- 1 -->
        <div class="program-card">
          <div class="program-number">01</div>
          <h3 data-en="Noorani Qaida" data-mr="नूरानी कायदा" data-ur="نورانی قاعدہ" data-hi="नूरानी कायदा">Noorani Qaida</h3>
          <p data-en="The foundational stepping stone for beginners to master Arabic alphabets, pronunciation, and basic word formations." data-mr="नवशिक्यांसाठी अरबी मुळाक्षरे, उच्चार आणि मूलभूत शब्द रचना शिकण्याची पायाभूत पायरी." data-ur="مبتدیوں کے لیے عربی حروف تہجی، تلفظ، اور بنیادی الفاظ کی تشکیل سیکھنے کا بنیادی قدم۔" data-hi="शुरुआती लोगों के लिए अरबी वर्णमाला, उच्चारण और बुनियादी शब्द निर्माण सीखने का पहला कदम।">The foundational stepping stone for beginners to master Arabic alphabets, pronunciation, and basic word formations.</p>
        </div>
        <!-- 2 -->
        <div class="program-card">
          <div class="program-number">02</div>
          <h3 data-en="Nazira Quran" data-mr="नाजिरा कुराण" data-ur="ناظرہ قرآن" data-hi="नाज़िरा कुरआन">Nazira Quran</h3>
          <p data-en="Fluid reading directly from the Mushaf with accuracy, pacing, and profound reverence for the divine text." data-mr="अचूकता, गती आणि पवित्र ग्रंथाबद्दल सखोल आदर बाळगून मुशफमधून थेट अस्खलित वाचन." data-ur="درستگی، رفتار، اور مقدس متن کے لیے گہری عقیدت کے ساتھ مصحف سے براہ راست روانی سے پڑھنا۔" data-hi="सटीकता, गति और पवित्र ग्रंथ के प्रति गहरे सम्मान के साथ सीधे मुशफ से धाराप्रवाह पढ़ना।">Fluid reading directly from the Mushaf with accuracy, pacing, and profound reverence for the divine text.</p>
        </div>
        <!-- 3 -->
        <div class="program-card">
          <div class="program-number">03</div>
          <h3 data-en="Hifz" data-mr="हिफ्ज" data-ur="حفظ" data-hi="हिफ्ज़">Hifz</h3>
          <p data-en="Dedicated memorization of the Noble Qur'an through structured daily repetition, review, and rigorous retention techniques." data-mr="नियमित दैनंदिन उजळणी आणि कठोर स्मरण तंत्रांद्वारे पवित्र कुराणाचे समर्पित पाठांतर." data-ur="منظم روزانہ دہرائی، جائزے، اور سخت یادداشت کی تکنیکوں کے ذریعے قرآن مجید کا سرشار حفظ۔" data-hi="संरचित दैनिक पुनरावृत्ति, समीक्षा और कठोर याद रखने की तकनीकों के माध्यम से पवित्र कुरआन का समर्पित संस्मरण।">Dedicated memorization of the Noble Qur'an through structured daily repetition, review, and rigorous retention techniques.</p>
        </div>
        <!-- 4 -->
        <div class="program-card">
          <div class="program-number">04</div>
          <h3 data-en="Makhraj" data-mr="मखरज" data-ur="مخرج" data-hi="मखरज">Makhraj</h3>
          <p data-en="Scientific articulation of Arabic letters from their exact points of origin in the throat, tongue, and lips." data-mr="घसा, जीभ आणि ओठांमधील त्यांच्या मूळ स्थानांवरून अरबी अक्षरांचा वैज्ञानिक उच्चार." data-ur="گلے، زبان اور ہونٹوں میں ان کے اصل مقامات سے عربی حروف کی سائنسی ادائیگی۔" data-hi="गले, जीभ और होठों में उनके मूल बिंदुओं से अरबी अक्षरों का वैज्ञानिक उच्चारण।">Scientific articulation of Arabic letters from their exact points of origin in the throat, tongue, and lips.</p>
        </div>
        <!-- 5 -->
        <div class="program-card">
          <div class="program-number">05</div>
          <h3 data-en="Tajweed" data-mr="तजवीद" data-ur="تجوید" data-hi="तजवीद">Tajweed</h3>
          <p data-en="The intricate rules governing the prolonged, merged, and distinct recitation styles reflecting the exact methodology of the Prophet ﷺ." data-mr="प्रेषित ﷺ यांच्या नेमक्या पद्धतीचे प्रतिबिंबित करणारी लांबवलेली, विलीन आणि भिन्न वाचन शैली नियंत्रित करणारे गुंतागुंतीचे नियम." data-ur="نبی کریم ﷺ کے عین طریقے کی عکاسی کرنے والی طویل، ضم شدہ، اور الگ تلاوت کی طرزوں کو کنٹرول کرنے والے پیچیدہ اصول۔" data-hi="पैगंबर ﷺ की सटीक पद्धति को दर्शाने वाली लंबी, विलीन और विशिष्ट पाठ शैलियों को नियंत्रित करने वाले जटिल नियम।">The intricate rules governing the prolonged, merged, and distinct recitation styles reflecting the exact methodology of the Prophet ﷺ.</p>
        </div>
        <!-- 6 -->
        <div class="program-card">
          <div class="program-number">06</div>
          <h3 data-en="Deeniyat" data-mr="दीनियत" data-ur="دینیات" data-hi="दीनियत">Deeniyat</h3>
          <p data-en="Essential Islamic studies covering daily supplications (Du'as), Akhlaq (manners), and fundamental jurisprudence (Fiqh) for everyday life." data-mr="दैनंदिन जीवनासाठी आवश्यक असलेल्या दैनंदिन प्रार्थना (दुआ), अखलाक (शिष्टाचार) आणि मूलभूत न्यायशास्त्र (फिकह) समाविष्ट करणारा आवश्यक इस्लामिक अभ्यास." data-ur="روزمرہ کی زندگی کے لیے ضروری دعاؤں، اخلاق، اور بنیادی فقہ کا احاطہ کرنے والا ضروری اسلامی مطالعہ۔" data-hi="रोजमर्रा की जिंदगी के लिए आवश्यक प्रार्थनाओं (दुआ), अखलाक (शिष्टाचार), और बुनियादी न्यायशास्त्र (फिकह) को कवर करने वाला आवश्यक इस्लामी अध्ययन।">Essential Islamic studies covering daily supplications (Du'as), Akhlaq (manners), and fundamental jurisprudence (Fiqh) for everyday life.</p>
        </div>
      </div>
    </div>
  </section>`;

html = html.replace(/<section id="programs".*?Programs — Sprint 4<\/section>/s, programsHTML);

// 3. Replace Impact Placeholder
const impactHTML = `
  <!-- ═══════════════════════════════════════════════════════════
       IMPACT PARALLAX
  ════════════════════════════════════════════════════════════ -->
  <section class="impact-section" id="impact" aria-label="Our Vision">
    <div class="impact-bg"></div>
    <div class="impact-overlay"></div>
    <div class="container impact-content reveal">
      <svg class="quote-icon" viewBox="0 0 24 24" fill="var(--gold)" width="48" height="48"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
      <h2 data-en="The best among you are those who learn the Qur'an and teach it." data-mr="तुमच्यापैकी सर्वोत्कृष्ट ते आहेत जे कुराण शिकतात आणि शिकवतात." data-ur="تم میں سے بہترین وہ ہیں جو قرآن سیکھیں اور سکھائیں۔" data-hi="तुम में से बेहतरीन वो हैं जो कुरआन सीखते हैं और उसे सिखाते हैं।">The best among you are those who learn the Qur'an and teach it.</h2>
      <p class="impact-cite" data-en="— Prophet Muhammad ﷺ (Sahih Al-Bukhari)" data-mr="— प्रेषित मुहम्मद ﷺ (सही अल-बुखारी)" data-ur="— نبی کریم ﷺ (صحیح بخاری)" data-hi="— पैगंबर मुहम्मद ﷺ (सहीह अल-बुखारी)">— Prophet Muhammad ﷺ (Sahih Al-Bukhari)</p>
    </div>
  </section>`;

html = html.replace(/<section id="impact".*?Impact Numbers — Sprint 5<\/section>/s, impactHTML);

// 4. Replace Donate Placeholder
const donateHTML = `
  <!-- ═══════════════════════════════════════════════════════════
       DONATE
  ════════════════════════════════════════════════════════════ -->
  <section class="donate-section" id="donate" aria-label="Donate">
    <div class="container">
      <div class="donate-header reveal">
        <span class="section-label" data-en="Support Our Mission" data-mr="आमच्या मोहिमेला पाठिंबा द्या" data-ur="ہمارے مشن کی حمایت کریں" data-hi="हमारे मिशन का समर्थन करें">Support Our Mission</span>
        <h2 data-en="Invest in the Hereafter" data-mr="परलोकात गुंतवणूक करा" data-ur="آخرت میں سرمایہ کاری کریں" data-hi="आखिरत में निवेश करें">Invest in the Hereafter</h2>
        <div class="gold-divider center"></div>
        <p data-en="MQLC runs purely on the generosity of the community. Your Sadaqah Jariyah ensures the continuous teaching of the Qur'an to generations to come." data-mr="MQLC पूर्णपणे समाजाच्या औदार्यावर चालते. तुमची सदका जारीया येणाऱ्या पिढ्यांना कुराण शिकवणे सुरू राहण्याची खात्री देते." data-ur="ایم کیو ایل سی مکمل طور پر کمیونٹی کی سخاوت پر چلتی ہے۔ آپ کا صدقہ جاریہ آنے والی نسلوں کو قرآن کی مسلسل تعلیم کو یقینی بناتا ہے۔" data-hi="MQLC पूरी तरह से समुदाय की उदारता पर चलता है। आपका सदक़ा जारिया आने वाली पीढ़ियों को कुरआन की निरंतर शिक्षा सुनिश्चित करता है।">MQLC runs purely on the generosity of the community. Your Sadaqah Jariyah ensures the continuous teaching of the Qur'an to generations to come.</p>
      </div>

      <div class="donate-panels reveal">
        
        <!-- QR Code Left Pane -->
        <div class="donate-card qr-card">
          <h3 data-en="Scan & Contribute" data-mr="स्कॅन करा आणि योगदान द्या" data-ur="اسکین کریں اور تعاون کریں" data-hi="स्कैन करें और योगदान दें">Scan & Contribute</h3>
          <p class="text-muted" data-en="Use any UPI app (GPay, PhonePe, Paytm)" data-mr="कोणतेही UPI ॲप वापरा (GPay, PhonePe, Paytm)" data-ur="کوئی بھی UPI ایپ استعمال کریں (GPay, PhonePe, Paytm)" data-hi="किसी भी UPI ऐप का उपयोग करें (GPay, PhonePe, Paytm)">Use any UPI app (GPay, PhonePe, Paytm)</p>
          <div class="qr-wrapper">
            <!-- Replace this placeholder image with your real QR Code on Cloudinary! -->
            <img src="https://res.cloudinary.com/dlcowjk3q/image/upload/v1/home/mqlc/qr_placeholder.png" alt="MQLC Donation QR Code" class="qr-image" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 400 400\\'><rect width=\\'400\\' height=\\'400\\' fill=\\'%23F5ECD7\\'/><text x=\\'50%\\' y=\\'50%\\' font-size=\\'18\\' font-family=\\'sans-serif\\' text-anchor=\\'middle\\' fill=\\'%231A1A2E\\'>QR Code Placeholder</text><text x=\\'50%\\' y=\\'55%\\' font-size=\\'12\\' font-family=\\'sans-serif\\' text-anchor=\\'middle\\' fill=\\'%23666\\'>Upload to Cloudinary (Folder: mqlc/)</text></svg>'">
          </div>
        </div>

        <!-- Bank Details Right Pane -->
        <div class="donate-card bank-card">
          <div class="bank-icon">
             <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="10" rx="2" ry="2"></rect><path d="M2 22h20"></path><path d="M7 10V6a2 2 0 012-2h6a2 2 0 012 2v4"></path></svg>
          </div>
          <h3 data-en="Bank Transfer" data-mr="बँक ट्रान्सफर" data-ur="بینک ٹرانسفر" data-hi="बैंक ट्रांसफर">Bank Transfer</h3>
          <p class="text-muted text-center" style="margin-bottom: 2rem;" data-en="Direct NEFT / RTGS transfers" data-mr="थेट NEFT / RTGS ट्रान्सफर" data-ur="براہ راست NEFT / RTGS ٹرانسفر" data-hi="सीधे NEFT / RTGS ट्रांसफर">Direct NEFT / RTGS transfers</p>
          
          <ul class="bank-list">
            <li>
              <span>Account Name</span>
              <strong>MQLC Trust (Placeholder)</strong>
            </li>
            <li>
              <span>Account Number</span>
              <strong>01234567891011</strong>
            </li>
            <li>
              <span>IFSC Code</span>
              <strong>HDFC0001234</strong>
            </li>
            <li>
              <span>Bank Name</span>
              <strong>HDFC Bank, Mumbai Branch</strong>
            </li>
            <li>
              <span>Account Type</span>
              <strong>Current Account</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>`;

html = html.replace(/<section id="donate".*?Donate — Sprint 6<\/section>/s, donateHTML);


// 5. Update Accreditation and Footer
const footerHTML = `
  <!-- ═══════════════════════════════════════════════════════════
       FOOTER
  ════════════════════════════════════════════════════════════ -->
  <div class="accreditation-bar" id="contact">
    <div class="marquee-wrapper">
      <div class="marquee-content">
        <span>A project under the guidance of <a href="https://www.ahlehadeesbhiwandi.com/" target="_blank"
            rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai
          &nbsp;&nbsp;◈&nbsp;&nbsp; Email: mqlcinfo@gmail.com &nbsp;&nbsp;◈&nbsp;&nbsp; Phone: +91 92223 15006 | +91 99206 96189
          &nbsp;&nbsp;◈&nbsp;&nbsp; Location: Mumbai, India &nbsp;&nbsp;◈&nbsp;&nbsp;</span>
        <span aria-hidden="true">A project under the guidance of <a href="https://www.ahlehadeesbhiwandi.com/" target="_blank"
            rel="noopener noreferrer" class="accreditation-link">Subai Jamiat Ahle Hadees</a> Mumbai
          &nbsp;&nbsp;◈&nbsp;&nbsp; Email: mqlcinfo@gmail.com &nbsp;&nbsp;◈&nbsp;&nbsp; Phone: +91 77739 05451
          &nbsp;&nbsp;◈&nbsp;&nbsp; Location: Mumbai, India &nbsp;&nbsp;◈&nbsp;&nbsp;</span>
      </div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="logo-circle">م</div>
        <div class="nav-logo-text">
          <span class="nav-logo-name" style="color:var(--white);">Millat Qur'an Learning Center</span>
          <span class="nav-logo-short" style="color:var(--gold);">MQLC · Est. 2023</span>
        </div>
        <p class="footer-desc text-muted">A dedicated center for empowering the youth with the profound knowledge and recitation of the Noble Qur'an.</p>
      </div>

      <div class="footer-links">
        <h4 style="color:var(--white);margin-bottom:1rem;">Quick Links</h4>
        <ul>
          <li><a href="#about">Our Mission</a></li>
          <li><a href="#features">Facilities</a></li>
          <li><a href="#programs">Syllabus</a></li>
          <li><a href="timeline.html">Our Story</a></li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4 style="color:var(--white);margin-bottom:1rem;">Contact Us</h4>
        <p class="text-muted"><svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 92223 15006 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;99206 96189 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;77739 05451</p>
        <p class="text-muted"><svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> mqlcinfo@gmail.com</p>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container" style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:1.5rem;">
        <p class="text-muted" style="font-size:0.85rem;">&copy; 2023 Millat Qur'an Learning Center. All rights reserved.</p>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.4);">Mumbai, India</div>
      </div>
    </div>
  </footer>`;

html = html.replace(/<!-- Accreditation \+ footer placeholder -->.*?<\/section>/s, footerHTML);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully injected Phase 3 Sprints HTML components');
