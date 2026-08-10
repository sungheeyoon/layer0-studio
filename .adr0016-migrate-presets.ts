/**
 * ADR-0016 §8 step 3 — one-shot codemod turning preset `Field` objects into Values.
 *
 * Works on the TypeScript AST and splices text, so hand-authored presets keep
 * their helper constants (`IMG.heroHome`, `u(...)`) and comments; only the
 * `{type,label,value}` wrappers are rewritten.
 *
 *   { "type": "text",  "label": "…", "value": X }        → X
 *   { "type": "image", "label": "…", "value": X }        → { "url": X }
 *   { "type": "array", "label": "…", "items": [ … ] }    → [ { "id": …, "fields": { … } } ]
 *
 * Array item ids are readable and deterministic (`<fieldKey>-<n>`) rather than
 * UUIDs: a preset is committed code, the validator only demands uniqueness
 * within one array, and a 7,000-line diff of UUIDs is unreviewable. Runtime
 * creation (editor, DB migration) still uses `crypto.randomUUID()` per §4-4.
 */
import ts from 'typescript';
import fs from 'node:fs';

const FIELD_TYPES = new Set([
  'text', 'textarea', 'image', 'url', 'color', 'number', 'select', 'array',
]);

interface Edit { start: number; end: number; text: string; }

function propOf(obj: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | undefined {
  return obj.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
      p.name.text === name,
  );
}

/** A legacy Field object: a string-literal `type` from the known set, plus `label`. */
function fieldTypeOf(node: ts.Node): string | null {
  if (!ts.isObjectLiteralExpression(node)) return null;
  const typeProp = propOf(node, 'type');
  if (!typeProp || !ts.isStringLiteral(typeProp.initializer)) return null;
  if (!FIELD_TYPES.has(typeProp.initializer.text)) return null;
  if (!propOf(node, 'label')) return null;
  return typeProp.initializer.text;
}

function run(file: string): { changed: boolean; fields: number; items: number } {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits: Edit[] = [];
  let fields = 0;
  let items = 0;

  const text = (n: ts.Node) => source.slice(n.getStart(sf), n.getEnd());
  const indentAt = (n: ts.Node) => {
    const lineStart = source.lastIndexOf('\n', n.getStart(sf)) + 1;
    return source.slice(lineStart, n.getStart(sf)).match(/^\s*/)![0];
  };

  /** The Value literal one Field object becomes. `key` names it, for array item ids. */
  function valueText(fieldObj: ts.ObjectLiteralExpression, key: string, indent: string): string {
    const type = fieldTypeOf(fieldObj)!;
    fields++;

    if (type === 'array') {
      const itemsProp = propOf(fieldObj, 'items');
      if (!itemsProp || !ts.isArrayLiteralExpression(itemsProp.initializer)) {
        throw new Error(`${file}: array field "${key}" has no items array`);
      }
      const inner = indent + '  ';
      const rendered = itemsProp.initializer.elements.map((el, i) => {
        if (!ts.isObjectLiteralExpression(el)) {
          throw new Error(`${file}: array field "${key}" item ${i} is not an object`);
        }
        items++;
        const subIndent = inner + '  ';
        const subFields = el.properties.map((p) => {
          if (!ts.isPropertyAssignment(p)) {
            throw new Error(`${file}: array item property is not a plain assignment`);
          }
          const subKey = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : text(p.name);
          if (!fieldTypeOf(p.initializer)) {
            throw new Error(`${file}: array item key "${subKey}" is not a Field object`);
          }
          const v = valueText(p.initializer as ts.ObjectLiteralExpression, subKey, subIndent + '  ');
          return `${subIndent}  ${JSON.stringify(subKey)}: ${v}`;
        });
        return (
          `${inner}{\n` +
          `${subIndent}"id": ${JSON.stringify(`${key}-${i + 1}`)},\n` +
          `${subIndent}"fields": {\n${subFields.join(',\n')}\n${subIndent}}\n` +
          `${inner}}`
        );
      });
      return rendered.length === 0 ? '[]' : `[\n${rendered.join(',\n')}\n${indent}]`;
    }

    const valueProp = propOf(fieldObj, 'value');
    if (!valueProp) throw new Error(`${file}: field "${key}" has no value`);
    const v = text(valueProp.initializer);

    if (type === 'image') {
      // ImageValue stays an object — `assetId` is content ADR-0003 reads (§4-3).
      // No preset carries one (they are external CDN URLs), so only `url` is emitted.
      const assetId = propOf(fieldObj, 'assetId');
      return assetId
        ? `{ "url": ${v}, "assetId": ${text(assetId.initializer)} }`
        : `{ "url": ${v} }`;
    }
    return v;
  }

  /** Replace whole Field objects; never descend into one (its array items are rendered with it). */
  function visit(node: ts.Node, keyOfParent: string) {
    if (fieldTypeOf(node)) {
      const obj = node as ts.ObjectLiteralExpression;
      edits.push({
        start: obj.getStart(sf),
        end: obj.getEnd(),
        text: valueText(obj, keyOfParent, indentAt(obj)),
      });
      return;
    }
    node.forEachChild((child) => {
      const key =
        ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
          ? node.name.text
          : keyOfParent;
      visit(child, key);
    });
  }

  visit(sf, '');

  if (edits.length === 0) return { changed: false, fields: 0, items: 0 };

  let out = source;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  fs.writeFileSync(file, out);
  return { changed: true, fields, items };
}

for (const file of process.argv.slice(2)) {
  const r = run(file);
  console.log(`${r.changed ? '✔' : '·'} ${file}  fields=${r.fields} items=${r.items}`);
}
