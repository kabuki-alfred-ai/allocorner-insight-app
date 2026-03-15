const fs = require('fs');
const path = require('path');

const replacements = {
  'adl-card-flat': 'bg-muted/50 rounded-lg p-6',
  'adl-card': 'rounded-lg border bg-card text-card-foreground shadow-sm',
  'premium-card': 'rounded-lg border bg-card text-card-foreground shadow-sm',
  'premium-gradient': 'bg-primary text-primary-foreground',
  'gloss-effect': '',
  'border-noir': 'border',
  'border-orange': 'border-primary',
  'label-uppercase': 'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
  'glass-header': 'sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b',
  'bg-gradient-soft': 'bg-muted/30',
  'bg-gradient-primary': 'bg-primary text-primary-foreground',
  'verbatim-card-dark': 'bg-card text-card-foreground border rounded-lg',
  'verbatim-card-light': 'bg-card text-card-foreground border rounded-lg',
  'premium-capsule': 'h-7 px-3 rounded-full flex items-center justify-center text-xs font-medium border bg-card text-card-foreground hover:bg-muted',
  'shadow-card': 'shadow-sm',
  'shadow-elevated': 'shadow-md',
  'premium-border': 'border-primary',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      content = content.replace(regex, value);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
