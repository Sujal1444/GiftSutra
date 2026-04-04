const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    if (file === 'node_modules' || file === '.git') continue;
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const backendDir = 'd:/Project/GiftSutra/backend';
const files = walkSync(backendDir);

files.forEach(file => {
  if (file.includes('cjs_script.js')) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // import X from 'Y' -> const X = require('Y')
  content = content.replace(/import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require("$2");');
  
  // import { X, Y } from 'Z' -> const { X, Y } = require('Z')
  content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/g, 'const {$1} = require("$2");');

  // export const X = ... -> exports.X = ...
  content = content.replace(/export\s+const\s+([a-zA-Z0-9_]+)\s*=/g, 'exports.$1 =');

  // export default X -> module.exports = X
  content = content.replace(/export\s+default\s+([a-zA-Z0-9_]+);?/g, 'module.exports = $1;');

  // Handle server.js top level await connectDB() in else block
  if (file.endsWith('server.js')) {
    content = content.replace(/await\s+connectDB\(\);?/g, 'connectDB().catch(console.error);');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Converted ${file}`);
  }
});
