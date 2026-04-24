const fs = require('node:fs');
const path = require('node:path');

const versionFilePath = path.join(process.cwd(), 'VERSION');
const packageJsonPath = path.join(process.cwd(), 'package.json');

const versionFromFile = fs.readFileSync(versionFilePath, 'utf8').trim();
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const versionFromPackage = packageJson.version;

if (versionFromFile !== versionFromPackage) {
  console.error(
    `[version-sync] mismatch detected: VERSION=${versionFromFile}, package.json=${versionFromPackage}`,
  );
  process.exit(1);
}

console.log(`[version-sync] ok: ${versionFromFile}`);
