// @ts-check
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { compileScript, parse } from '@vue/compiler-sfc'
import * as Vue from 'vue'

const renderer = Vue.createRenderer({
  createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
  insert () {}, remove () {}, setText () {}, setElementText () {}, patchProp () {},
  parentNode: () => null, nextSibling: () => null
})

/** Mount actual component setup with explicit browser/network doubles. */
export function mountComponent (path, bindings, props = {}) {
  const source = readFileSync(new URL(path, import.meta.url), `utf8`)
  const { descriptor } = parse(source)
  const compiled = compileScript(descriptor, { id: `lifecycle-test`, genDefaultAs: `component` })
  const dependencies = { testEnvironment: { MODE: `production` }, ...bindings }
  for (const match of compiled.content.matchAll(/^import ([\s\S]*?) from ['"]([^'"]+)['"]/gm)) {
    const imported = match[1].replace(/\/\/[^\n]*/g, ``).replace(/[{}]/g, ``).split(`,`)
    for (const name of imported) {
      const [original, alias] = name.trim().split(/\s+as\s+/)
      const local = alias || original
      if (/^[A-Za-z_$][\w$]*$/.test(local) && !Object.hasOwn(dependencies, local)) {
        dependencies[local] = match[2] === `vue` ? Vue[original] : {}
      }
    }
  }
  const code = compiled.content.replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, ``).replaceAll(`import.meta.env`, `testEnvironment`)
  const component = compileFunction(`${code}\nreturn component`, Object.keys(dependencies))(...Object.values(dependencies))
  component.render = () => null
  const app = renderer.createApp({ render: () => Vue.h(component, { ...props }) })
  const instance = app.mount({})
  return { app, setup: instance.$.subTree.component.setupState }
}
