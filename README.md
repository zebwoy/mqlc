<div align="center">
  <img src="assets/logo.png" alt="MQLC Logo" width="100" />
  <h1>Millat Qur'an Learning Center (MQLC)</h1>
  <p><i>Digitizing traditional education with modern engineering.</i></p>
  
  [![Tech Stack: Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)](#)
  [![Database: Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](#)
  [![UI: Premium CSS](https://img.shields.io/badge/Design-Glassmorphism-emerald.svg)](#)
  [![Deployment: Vercel](https://img.shields.io/badge/Platform-JAMstack-black.svg)](#)
</div>

---

## 🚀 The Mission: Why MQLC?

Traditional educational institutions often struggle with **Paper Friction**—manual registers, lost enrollment forms, and zero analytical insight into student demographics. 

**MQLC** was born to solve this. It transitions a Madrasa from offline chaos to a professional **Cloud-Native Platform**. It isn't just a website; it’s a lifecycle management tool that bridges the gap between traditional values and modern administrative efficiency.

---

## 💡 The Journey: From Idea to Reality

### 1. Ideation Phase
The goal was simple: **Professionalism at first glance.** We wanted a platform that felt as premium as a high-end SaaS but remained accessible to a diverse, multi-lingual community.

### 2. Development Phases (The Agile Sprint)
The project was brought from a blank canvas to a fully operational administrative suite in approximately **30 hours** of focused engineering.

*   **Phase I: Resonance & Reach** – Building the multi-lingual landing page with RTL (Urdu) support.
*   **Phase II: The Gateway** – Developing the 3-step registration portal with Aadhar validation and secure PIN generation.
*   **Phase III: The Command Center** – Creating the Admin Dashboard with real-time student matrix and lifecycle tracking (Edit/Delete).
*   **Phase IV: Intelligence** – Integrating Chart.js for data-driven insights and professional export tools.

---

## 🛠️ Feature Timeline (Project Chronology)

- [x] **Smart Multi-lingual Engine:** Custom Zero-dependency switcher for English, Hindi, Marathi, and Urdu.
- [x] **Validated Enrollment:** 3-Step registration form with real-time Aadhar auto-formatting (`XXXX-XXXX-XXXX`).
- [x] **Secure PIN System:** Instant OTP generation for parent-registration verification.
- [x] **Dynamic Admin Matrix:** A searchable, filterable student database with automated "Approved" default views.
- [x] **Visual Analytics:** Real-time donut, pie, and bar charts tracking Gender ratios, Batch distribution, and Course enrollment.
- [x] **Lifecycle Tracking:** Specialized student status management (Active, Pending, Left).
- [x] **Professional Data Portability:** 
    - **Excel:** Native `.xlsx` exports with frozen headers and auto-filters.
    - **PDF:** Portrait-oriented, institution-branded directories with audit timestamps.

---

## 🏗️ Technical Architecture

### The Engine
- **Frontend:** Vanilla HTML5/CSS3/ES6+ (No heavy frameworks for 0ms hydration latency).
- **Backend-as-a-Service:** **Supabase** (Postgres) managing secure student records and authentication.
- **Data Ops:** **SheetJS** for XLSX generation and institutional **CSS Media Queries** for PDF layout.
- **Analytics:** **Chart.js** for high-performance client-side rendering.

### Static vs. Dynamic
| Component | Type | Technology |
| :--- | :--- | :--- |
| **Hero & Info Sections** | Static | Content-Optimized HTML |
| **Prayer Synchronization** | Dynamic | Aladhan API (Real-time sync) |
| **Student Matrix** | Dynamic | Supabase Real-time Queries |
| **Admin Analytics** | Dynamic | Chart.js Data Mapping |

---

## 📂 Project Structure

```text
mqlc/
├── index.html              # Public Landing Page & Multilingual Router
├── register.html           # 3-Step Secure Enrollment Portal
├── admin.html              # The Command Center (Dashboard + Analytics)
├── css/
│   ├── main.css            # Design System & Root Variables
│   ├── admin.css           # Premium Dashboard Layout & Print Engine
│   └── hero.css            # Mobile-first Responsive Hero Blocks
├── js/
│   ├── admin.js            # Dashboard CRUD, Analytics & Export Logic
│   ├── lang.js             # The Localization Engine
│   └── register.js         # OTP & Registration State Machine
```

---

## 🚀 Deployment & Local Setup
Managed via **Vercel** for global edge performance.

1. **Clone & Install:** `git clone ...`
2. **Environment:** Setup `js/supabase-config.js` with your parameters.
3. **Run:** `npx vercel dev`

---
<div align="center">
  <i>"Efficiency in management, Excellence in education."</i>
</div>
