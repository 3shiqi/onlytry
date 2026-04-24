const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.join(process.cwd(), 'node_modules', 'rollup', 'dist', 'native.js');

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

const source = fs.readFileSync(targetPath, 'utf8');

if (source.includes("@rollup/wasm-node/dist/native.js")) {
  process.exit(0);
}

const originalBlock = `const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = requireWithFriendlyError(
\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
);`;

const fallbackBlock = `const getBindings = () => {
\ttry {
\t\treturn requireWithFriendlyError(
\t\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
\t\t);
\t} catch (error) {
\t\ttry {
\t\t\treturn require('@rollup/wasm-node/dist/native.js');
\t\t} catch {
\t\t\tthrow error;
\t\t}
\t}
};

const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = getBindings();`;

if (!source.includes(originalBlock)) {
  console.warn('[patch-rollup-native] Expected Rollup native loader block not found, skipping.');
  process.exit(0);
}

fs.writeFileSync(targetPath, source.replace(originalBlock, fallbackBlock));
console.log('[patch-rollup-native] Applied Rollup WASM fallback.');
