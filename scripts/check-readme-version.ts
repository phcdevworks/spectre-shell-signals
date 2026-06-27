import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');

const pkgPath = process.env.README_VERSION_PKG_PATH ?? 'package.json';
const pkg = JSON.parse(readFileSync(resolve(repoRoot, pkgPath), 'utf-8')) as { version: string };
const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf-8');

const match = readme.match(/\|\s*Current version\/status\s*\|\s*([^\s|]+)\s*\|/i);

if (!match) {
  throw new Error(
    'README.md is missing the "Current version/status" row in the Repository Snapshot table.',
  );
}

const readmeVersion = match[1];

if (readmeVersion !== pkg.version) {
  throw new Error(
    `README.md "Current version/status" is "${readmeVersion}" but ${pkgPath} version is "${pkg.version}". Update README.md to match.`,
  );
}

console.log(`README version parity: OK (${pkg.version})`);
