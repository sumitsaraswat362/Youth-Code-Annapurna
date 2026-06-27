const fs = require('fs');
const files = ['src/app/fleet/page.tsx', 'src/app/wholesaler/page.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Layout and card backgrounds
  content = content.replace(/bg-\[#F2F2F7\]/g, 'bg-[var(--bg-primary)]');
  content = content.replace(/bg-\[#FFFFFF\]/g, 'bg-[var(--bg-secondary)]');
  
  // Borders
  content = content.replace(/border-\[#E5E5EA\]/g, 'border-[var(--separator)]');
  content = content.replace(/border-\[#C6C6C8\]/g, 'border-[var(--separator-opaque)]');
  
  // Text colors
  content = content.replace(/text-\[#000000\]/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-\[#3C3C43\]/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-\[#8E8E93\]/g, 'text-[var(--text-tertiary)]');
  
  // Other backgrounds
  content = content.replace(/bg-\[#E5E5EA\]/g, 'bg-[var(--fill-secondary)]');
  content = content.replace(/bg-\[#C6C6C8\]/g, 'bg-[var(--separator)]');
  
  // Custom tweaks for UI feel
  content = content.replace(/text-black/g, 'text-[var(--text-primary)]');
  
  fs.writeFileSync(file, content);
  console.log('Converted to semantic tokens', file);
});
