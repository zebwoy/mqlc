# Millat Qur'an Learning Center — MQLC Website

## Project Structure

```
mqlc/
├── index.html              Main HTML file
├── css/
│   ├── main.css            Variables, reset, typography, utilities
│   ├── navbar.css          Sticky navbar + language switcher
│   ├── hero.css            Hero section with parallax
│   ├── sections.css        (coming — shared section styles)
│   ├── timeline.css        (coming — construction timeline)
│   ├── programs.css        (coming — program cards)
│   ├── donate.css          (coming — donation section)
│   └── footer.css          (coming — footer)
├── js/
│   ├── main.js             Scroll animations, parallax, navbar, counters
│   └── donate.js           (coming — donation toggle logic)
├── images/
│   └── (add your images here — see naming guide below)
└── README.md
```

## Image Naming Guide

Replace placeholders by dropping images into `/images/` with these names:

| File name              | Used in              |
|------------------------|----------------------|
| `hero.jpg`             | Hero background      |
| `classroom-1.jpg`      | Parallax break #1    |
| `quran-outdoor.jpg`    | Parallax break #2    |
| `founder.jpg`          | Who We Are section   |
| `built-masonry.jpg`    | Timeline stage 1     |
| `built-plumbing.jpg`   | Timeline stage 2     |
| `built-tiling.jpg`     | Timeline stage 3     |
| `built-painting.jpg`   | Timeline stage 4     |
| `built-electrical.jpg` | Timeline stage 5     |
| `built-carpet.jpg`     | Timeline stage 6     |
| `built-complete.jpg`   | Timeline final stage |
| `testimonial-1.jpg`    | Voices section       |
| `testimonial-2.jpg`    | Voices section       |
| `qr-donate.png`        | Donation QR code     |

## To swap in hero image, update in `index.html`:
Change the `hero-bg-placeholder` div to:
```html
<div class="hero-bg" data-parallax="0.3"
     style="background-image: url('images/hero.jpg')"></div>
```

## Deployment (Netlify + GitHub)

1. Push this folder to a GitHub repo
2. Log in to Netlify → New site from Git → select repo
3. Build settings: leave blank (static site)
4. Deploy — done!

## Languages supported
- English (en) — primary
- Marathi (mr)
- Urdu (ur)
- Hindi (hi)

Add translations by updating `data-en`, `data-mr`, `data-ur`, `data-hi` attributes on any text element.

## Colors
| Name         | Hex       | Usage                        |
|--------------|-----------|------------------------------|
| Emerald green| #2D6A4F   | Primary, nav, buttons        |
| Golden amber | #D4A017   | CTAs, highlights, donate     |
| Warm cream   | #F5ECD7   | Page background              |
| Earthy brown | #8B4513   | Overlays, accents            |
| Deep midnight| #1A1A2E   | Footer, hero overlay, navbar |
