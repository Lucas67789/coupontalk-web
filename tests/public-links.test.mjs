import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { safeNavigationUrl } from '../src/lib/affiliate.ts';

// Static JSX bypasses the Markdown/HTML link sanitizer. Check it separately.
test('public store components cannot introduce ordinary external links', () => {
  function scan(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'admin') continue;
      const path = new URL(e.name + (e.isDirectory() ? '/' : ''), dir);
      if (e.isDirectory()) { scan(path); continue; }
      if (!e.name.endsWith('.tsx')) continue;
      const source = ts.createSourceFile(path.pathname, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const literals = new Map();
      function collect(n) {
        if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && ts.isStringLiteral(n.initializer)) literals.set(n.name.text, n.initializer.text);
        ts.forEachChild(n, collect);
      }
      collect(source);
      function check(n) {
        if (ts.isJsxAttribute(n) && n.name.getText(source) === 'href' && n.initializer) {
          const value = ts.isJsxExpression(n.initializer) ? n.initializer.expression : n.initializer;
          const href = value && (ts.isStringLiteral(value) ? value.text : ts.isIdentifier(value) ? literals.get(value.text) : undefined);
          if (href && /^https?:\/\//.test(href)) assert.ok(safeNavigationUrl(href), `${path.pathname}: unapproved external link ${href}`);
        }
        ts.forEachChild(n, check);
      }
      check(source);
    }
  }
  for (const dir of ['../src/components/', '../src/app/store/', '../src/app/subscriptions/']) scan(new URL(dir, import.meta.url));
});
