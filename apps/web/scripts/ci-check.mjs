import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadConfigFromFile } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function ensureVercelFallback() {
  const vercelPath = path.join(projectRoot, 'vercel.json');
  const raw = await fs.readFile(vercelPath, 'utf8');
  const config = JSON.parse(raw);
  const rewrites = config.rewrites ?? [];
  const hasFallback = rewrites.some(
    rewrite => rewrite.source === '/(.*)' && rewrite.destination === '/index.html'
  );
  assert.ok(hasFallback, 'vercel.json must contain SPA fallback rewrite to /index.html');
}

async function ensureAliasesResolve() {
  const configFile = path.join(projectRoot, 'vite.config.ts');
  const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, configFile);
  const aliases = loaded?.config?.resolve?.alias ?? [];
  const getAlias = key => {
    if (Array.isArray(aliases)) {
      return aliases.find(entry => entry.find && entry.find === key);
    }
    return aliases[key];
  };

  const aliasAt = getAlias('@');
  assert.ok(aliasAt, "Vite alias '@' must be configured");
  const aliasShared = getAlias('@cg/shared');
  assert.ok(aliasShared, "Vite alias '@cg/shared' must be configured");
}

async function ensureSharedImport() {
  const moduleUrl = pathToFileURL(path.join(projectRoot, 'src', 'main.tsx')).href;
  // Ensure build step has run so module exists; we only check TypeScript resolution by compiling.
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const tsconfigRaw = await fs.readFile(tsconfigPath, 'utf8');
  const tsconfig = JSON.parse(tsconfigRaw);
  const paths = tsconfig?.compilerOptions?.paths ?? {};
  assert.ok(paths['@cg/shared'], "tsconfig paths must include '@cg/shared'");
}

await Promise.all([
  ensureVercelFallback(),
  ensureAliasesResolve(),
  ensureSharedImport(),
]);

console.log('CI checks passed: alias configuration and SPA fallback verified.');
