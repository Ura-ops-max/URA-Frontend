// Every icon-only button or link in the app must have an aria-label (and so a
// name for screen readers). Reads the source with the TypeScript parser:
// a button/link whose only content is a Lucide icon (or the WhatsApp icon)
// and has no visible text must carry aria-label.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const CLICKABLE = new Set(['button', 'Button', 'a', 'Link', 'NavLink', 'SidebarMenuButton', 'DropdownMenuTrigger']);

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return files(p);
    return p.endsWith('.tsx') && !p.endsWith('.test.tsx') ? [p] : [];
  });
}

/** Names of components imported from lucide-react (icons) in this file. */
function iconNames(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>(['WhatsAppIcon', 'Icon']);
  sf.forEachChild((n) => {
    if (ts.isImportDeclaration(n) && (n.moduleSpecifier as ts.StringLiteral).text === 'lucide-react') {
      const b = n.importClause?.namedBindings;
      if (b && ts.isNamedImports(b)) b.elements.forEach((e) => names.add(e.name.text));
    }
  });
  return names;
}

const tagName = (n: ts.JsxOpeningLikeElement) => n.tagName.getText();

interface Content {
  icon: boolean;
  text: boolean;
}

/** What a JSX child shows: an icon, and/or something that may be text. */
function look(node: ts.Node, icons: Set<string>, acc: Content): void {
  if (ts.isJsxText(node)) {
    if (/[A-Za-z0-9]/.test(node.text)) acc.text = true;
    return;
  }
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node)) {
    const open = ts.isJsxElement(node) ? node.openingElement : node;
    const name = tagName(open);
    if (icons.has(name) || /^item\.icon$|\.icon$/.test(name)) acc.icon = true;
    // sr-only text counts as a name.
    if (ts.isJsxElement(node)) node.children.forEach((c) => look(c, icons, acc));
    return;
  }
  if (ts.isJsxExpression(node)) {
    if (!node.expression) return;
    // Strings, numbers, template strings and plain values ({label}, {count})
    // may be visible text; JSX inside is looked at too.
    const walk = (e: ts.Node): void => {
      if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isTemplateExpression(e) || ts.isNumericLiteral(e)) {
        acc.text = true;
      } else if (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e) || ts.isCallExpression(e) || ts.isElementAccessExpression(e)) {
        acc.text = true;
      } else if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e)) {
        if (ts.isJsxFragment(e)) e.children.forEach((c) => look(c, icons, acc));
        else look(e, icons, acc);
      } else {
        e.forEachChild(walk);
      }
    };
    // `cond && <X/>`: only the right side shows.
    walk(node.expression);
    return;
  }
  if (ts.isJsxFragment(node)) node.children.forEach((c) => look(c, icons, acc));
}

function hasAttr(open: ts.JsxOpeningLikeElement, names: string[]): boolean {
  return open.attributes.properties.some(
    (p) => ts.isJsxSpreadAttribute(p) || (ts.isJsxAttribute(p) && names.includes(p.name.getText())),
  );
}

export function findUnlabelled(): string[] {
  const out: string[] = [];
  for (const file of files(SRC)) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const icons = iconNames(sf);
    const visit = (n: ts.Node) => {
      if (ts.isJsxElement(n) && CLICKABLE.has(tagName(n.openingElement))) {
        const acc: Content = { icon: false, text: false };
        n.children.forEach((c) => look(c, icons, acc));
        if (acc.icon && !acc.text && !hasAttr(n.openingElement, ['aria-label', 'aria-labelledby'])) {
          const { line } = sf.getLineAndCharacterOfPosition(n.getStart());
          out.push(`${path.relative(SRC, file)}:${line + 1} <${tagName(n.openingElement)}>`);
        }
      }
      n.forEachChild(visit);
    };
    visit(sf);
  }
  return out;
}

describe('icons explain themselves', () => {
  it('every icon-only button and link has an aria-label', () => {
    expect(findUnlabelled()).toEqual([]);
  });
});
