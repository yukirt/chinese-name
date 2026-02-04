const fs = require('fs');
const { performance } = require('perf_hooks');

const data = JSON.parse(fs.readFileSync('ChineseCharacters.json', 'utf8'));
const $chineseCharacters = data;

// --- Old Logic ---
function findCharOld(char) {
    for (var key in $chineseCharacters) {
        if ($chineseCharacters[key].chars.indexOf(char) != -1) {
            return $chineseCharacters[key];
        }
    }
    return null;
}

// --- New Logic ---
// Build Map
const startBuild = performance.now();
const $charMap = {};
for (var i = 0; i < $chineseCharacters.length; i++) {
    var item = $chineseCharacters[i];
    var chars = item.chars;
    for (var j = 0; j < chars.length; j++) {
        $charMap[chars[j]] = item;
    }
}
const endBuild = performance.now();
console.log(`Map build time: ${(endBuild - startBuild).toFixed(4)} ms`);

function findCharNew(char) {
    return $charMap[char] || null;
}

// --- Verification ---
const testChars = ['王', '李', '張', '劉', '陳', '楊', '黃', '趙', '吳', '周'];
for (const char of testChars) {
    const oldRes = findCharOld(char);
    const newRes = findCharNew(char);

    if (oldRes !== newRes) {
        console.error(`Mismatch for ${char}`);
        process.exit(1);
    }
}
console.log('Verification passed!');

// --- Benchmark ---
const iterations = 10000;
// Create a random list of chars to search
const searchList = [];
const allChars = [];
for (const item of $chineseCharacters) {
    allChars.push(...item.chars.split(''));
}
for (let i = 0; i < iterations; i++) {
    const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
    searchList.push(randomChar);
}

// Test Old
const startOld = performance.now();
for (const char of searchList) {
    findCharOld(char);
}
const endOld = performance.now();

// Test New
const startNew = performance.now();
for (const char of searchList) {
    findCharNew(char);
}
const endNew = performance.now();

console.log(`Old Logic (${iterations} lookups): ${(endOld - startOld).toFixed(4)} ms`);
console.log(`New Logic (${iterations} lookups): ${(endNew - startNew).toFixed(4)} ms`);
console.log(`Speedup: ${((endOld - startOld) / (endNew - startNew)).toFixed(2)}x`);
