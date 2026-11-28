import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const slash = value => value.replaceAll('\\', '/');
const relative = file => slash(path.relative(src, file));
const isTest = file => /(?:\.test\.[cm]?[jt]sx?$|\/tests\/|\/__tests__\/)/.test(slash(file));

function resolveImport(file, specifier) {
  const base = specifier.startsWith('@/') ? path.join(src, specifier.slice(2))
    : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
  if (!base) return null;
  return [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]
    .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function owner(file) {
  const parts = relative(file).split('/');
  return parts[0] === 'apps' || parts[0] === 'features' ? parts.slice(0, 2).join('/') : parts[0];
}

export function boundaryViolation(file, target) {
  if (isTest(file)) return null;
  const from = owner(file), to = owner(target);
  if (from === to || to === 'shared') return null;
  const entry = relative(target) === `${to}/index.ts`;
  if (from === 'bootstrap' && (to === 'shell' || entry)) return null;
  if (from.startsWith('apps/') && to === 'features/investigation' && entry) return null;
  if (from === 'features/play-session' && to.startsWith('features/') && entry) return null;
  if (from === 'features/case-runtime' && to === 'data') return null;
  if (!['shared', 'shell', 'bootstrap', 'data'].includes(from) && !from.startsWith('apps/') && !from.startsWith('features/')) return null;
  return `${relative(file)} cannot depend on ${relative(target)}; use the owning slice's declared public API.`;
}

export const architecturePlugin = {
  rules: {
    boundaries: {
      meta: { type: 'problem', schema: [], messages: { boundary: '{{message}}' } },
      create(context) {
        const file = context.filename;
        return {
          'ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration'(node) {
            if (!node.source || typeof node.source.value !== 'string') return;
            const target = resolveImport(file, node.source.value);
            if (!target) return;
            const message = boundaryViolation(file, target);
            if (message) context.report({ node, messageId: 'boundary', data: { message } });
            if (!isTest(file) && owner(file).startsWith('apps/') && node.specifiers?.some(specifier =>
              ['CaseConfig', 'GroundTruth', 'LockChallenge'].includes(specifier.imported?.name))) {
              context.report({ node, messageId: 'boundary', data: { message: 'App views must use public app context, not authoritative case/answer types.' } });
            }
          },
          CallExpression(node) {
            if (isTest(file) || !owner(file).startsWith('apps/')) return;
            const name = node.callee?.name;
            if (name === 'useMotionState') {
              const modeArg = node.arguments?.[1];
              if (!modeArg || (modeArg.type === 'Literal' && modeArg.value === 'navigation')) {
                context.report({
                  node,
                  messageId: 'boundary',
                  data: { message: "App push/pop navigation must use SlideStackView (src/shared/ui/SlideStackView.tsx), not useMotionState(..., 'navigation')." },
                });
              }
            } else if (name === 'transition') {
              const kindArg = node.arguments?.[0];
              if (kindArg?.type === 'Literal' && (kindArg.value === 'push' || kindArg.value === 'pop')) {
                context.report({
                  node,
                  messageId: 'boundary',
                  data: { message: "App push/pop navigation must use SlideStackView (src/shared/ui/SlideStackView.tsx), not transition('push'|'pop')." },
                });
              }
            }
          },
        };
      },
    },
  },
};

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) && !isTest(file) ? [file] : [];
  });
}

/** Check the actual runtime import graph; type-only dependencies do not create runtime cycles. */
export function checkArchitecture() {
  const graph = new Map(), errors = [];
  for (const file of sourceFiles(src)) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const dependencies = [];
    const inspect = node => {
      if (owner(file).startsWith('apps/') && ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const fn = node.expression.text;
        if (fn === 'useMotionState') {
          const modeArg = node.arguments[1];
          if (!modeArg || (ts.isStringLiteral(modeArg) && modeArg.text === 'navigation')) {
            errors.push(`${relative(file)}: App push/pop navigation must use SlideStackView (src/shared/ui/SlideStackView.tsx), not useMotionState(..., 'navigation').`);
          }
        } else if (fn === 'transition') {
          const kindArg = node.arguments[0];
          if (kindArg && ts.isStringLiteral(kindArg) && (kindArg.text === 'push' || kindArg.text === 'pop')) {
            errors.push(`${relative(file)}: App push/pop navigation must use SlideStackView (src/shared/ui/SlideStackView.tsx), not transition('push'|'pop').`);
          }
        }
      }
      let specifier;
      let runtime = true;
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        specifier = node.moduleSpecifier;
        runtime = !node.isTypeOnly && !node.importClause?.isTypeOnly;
        const bindings = node.importClause?.namedBindings ?? node.exportClause;
        if (bindings && 'elements' in bindings && bindings.elements.length && bindings.elements.every(element => element.isTypeOnly)
          && !node.importClause?.name) runtime = false;
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        specifier = node.arguments[0];
      }
      if (specifier && ts.isStringLiteral(specifier)) {
        const target = resolveImport(file, specifier.text);
        if (target) {
          const violation = boundaryViolation(file, target);
          if (violation) errors.push(violation);
          if (runtime && /\.tsx?$/.test(target)) dependencies.push(target);
        }
      }
      ts.forEachChild(node, inspect);
    };
    inspect(source);
    graph.set(file, dependencies);
  }
  const complete = new Set(), active = new Set();
  function visit(file, route) {
    if (active.has(file)) { errors.push(`Runtime cycle: ${[...route, file].map(relative).join(' -> ')}`); return; }
    if (complete.has(file)) return;
    active.add(file);
    for (const next of graph.get(file) ?? []) visit(next, [...route, file]);
    active.delete(file); complete.add(file);
  }
  for (const file of graph.keys()) visit(file, []);
  return { modules: graph.size, errors: [...new Set(errors)] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkArchitecture();
  if (result.errors.length) { process.stderr.write(result.errors.join('\n') + '\n'); process.exitCode = 1; }
  else process.stdout.write(`Architecture: ${result.modules} modules, no forbidden dependencies or runtime cycles.\n`);
}
