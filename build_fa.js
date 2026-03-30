const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject FontAwesome
if (!html.includes('font-awesome')) {
  html = html.replace('<!-- CSS -->', '<!-- FontAwesome -->\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />\n  <!-- CSS -->');
}

// 2. Replace Affordable Fee SVG
const feeSvgRegex = /<!-- Stacked Coins for Affordable Fee -->.*?<\/svg>/s;
if (html.match(feeSvgRegex)) {
  html = html.replace(feeSvgRegex, '<i class="fa-solid fa-indian-rupee-sign"></i>');
}

// Also check if SVG wrapper still exists if feeSvgRegex failed due to the wrapper
const feeFullRegex = /<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\s*<!-- Stacked Coins for Affordable Fee -->.*?<\/svg>/s;
if (html.match(feeFullRegex)) {
  html = html.replace(feeFullRegex, '<i class="fa-solid fa-indian-rupee-sign"></i>');
}

// 3. Replace Gender Segregation SVG
const segFullRegex = /<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\s*<!-- Dividing line -->.*?<\/svg>/s;
if (html.match(segFullRegex)) {
  html = html.replace(segFullRegex, '<i class="fa-solid fa-people-arrows"></i>');
}

fs.writeFileSync('index.html', html);

// 4. Update CSS if needed
let css = fs.readFileSync('css/sections.css', 'utf8');
if (!css.includes('.feature-icon i')) {
  css = css.replace('.feature-icon svg {', '.feature-icon i,\n.feature-icon svg {');
}
fs.writeFileSync('css/sections.css', css);

console.log('Successfully applied FontAwesome icons.');
