const fs = require('fs');

let tip = fs.readFileSync('src/components/admin/TiptapEditor.tsx', 'utf-8');
tip = tip.replace(/"hotel-images"/g, '"images"');
tip = tip.replace(/"post-images\//g, '"editor_images/');
fs.writeFileSync('src/components/admin/TiptapEditor.tsx', tip);

let img = fs.readFileSync('src/components/admin/ImagePairExtension.tsx', 'utf-8');
img = img.replace(/"hotel-images"/g, '"images"');
img = img.replace(/"post-images\//g, '"editor_images/');
fs.writeFileSync('src/components/admin/ImagePairExtension.tsx', img);

