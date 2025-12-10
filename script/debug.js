import fs from 'fs';
import path from 'path';

console.log("=== DEBUG: FILE STRUCTURE ===");
const clientDir = path.resolve(process.cwd(), 'client');
console.log("Looking in:", clientDir);

try {
    if (fs.existsSync(clientDir)) {
        const files = fs.readdirSync(clientDir);
        console.log("Files in client/:", files);

        if (files.includes('index.html')) {
            console.log("SUCCESS: index.html found!");
        } else {
            console.error("ERROR: index.html is MISSING!");
        }
    } else {
        console.error("ERROR: client directory does not exist!");
    }
} catch (e) {
    console.error("Error listing files:", e);
}
console.log("=============================");
