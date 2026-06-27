const fs = require('fs');
const files = ['src/app/fleet/page.tsx', 'src/app/wholesaler/page.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Layout and card backgrounds
  content = content.replace(/bg-\[#F2F2F7\]/g, 'bg-[#050505]');
  content = content.replace(/bg-\[#FFFFFF\]/g, 'bg-black/40');
  content = content.replace(/bg-white/g, 'bg-[#141414]');
  content = content.replace(/ios-card/g, 'glass-card');
  
  // Borders
  content = content.replace(/border-\[#E5E5EA\]/g, 'border-white/10');
  content = content.replace(/border-\[#C6C6C8\]/g, 'border-white/20');
  
  // Text colors
  content = content.replace(/text-\[#000000\]/g, 'text-white');
  content = content.replace(/text-black/g, 'text-white');
  content = content.replace(/text-\[#3C3C43\]/g, 'text-white/90');
  content = content.replace(/text-\[#8E8E93\]/g, 'text-white/50');
  
  // Other backgrounds
  content = content.replace(/bg-\[#E5E5EA\]/g, 'bg-white/10');
  content = content.replace(/bg-\[#C6C6C8\]/g, 'bg-white/20');
  
  // App specific layout containers for Fleet and Wholesaler
  content = content.replace(/bg-\[#F2F2F7\]/g, 'bg-[#050505]');
  
  fs.writeFileSync(file, content);
  console.log('Converted', file);
});
