const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

function fixInlineScripts(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixInlineScripts(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let replaced = content;

            // Manifest V3 does not allow inline scripts. Extract them to inline.js
            let inlineScripts = '';
            replaced = replaced.replace(/<script(?![^>]*src=)[^>]*>(.*?)<\/script>/gs, (match, p1) => {
                inlineScripts += p1 + '\n';
                return '';
            });

            if (inlineScripts.trim().length > 0) {
                fs.writeFileSync(path.join(path.dirname(fullPath), 'inline.js'), inlineScripts, 'utf8');
                replaced = replaced.replace('</body>', '<script src="/inline.js"></script></body>');
                console.log(`Extracted inline scripts from ${file} to inline.js`);
            }

            if (content !== replaced) {
                fs.writeFileSync(fullPath, replaced, 'utf8');
            }
        }
    }
}

console.log('Fixing inline scripts for Chrome Extension...');
fixInlineScripts(outDir);
console.log('Extension build fix complete.');
