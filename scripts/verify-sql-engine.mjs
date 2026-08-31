import { readFileSync } from 'node:fs';

const pkgPath = new URL('../node_modules/sql.js/package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

if (!pkg || !pkg.name || pkg.name !== 'sql.js') {
  console.error('sql.js is not installed.');
  process.exit(1);
}

if (pkg.license !== 'MIT') {
  console.error(`sql.js license check failed: expected MIT, got ${pkg.license ?? 'unknown'}.`);
  process.exit(1);
}

console.log(`Verified sql.js ${pkg.version} with license ${pkg.license}.`);
