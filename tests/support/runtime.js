// @ts-check
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'

/** Load application functions with browser and network dependencies supplied by the test. */
export function loadRuntimeModule (path, bindings, exports) {
  const source = readFileSync(new URL(path, import.meta.url), `utf8`)
  const code = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, ``)
    .replaceAll(`import.meta.env`, `testEnvironment`)
    .replace(/^export /gm, ``)
  return compileFunction(`${code}\nreturn { ${exports.join(`, `)} }`, Object.keys(bindings))(...Object.values(bindings))
}
