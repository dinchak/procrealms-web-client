// @ts-check
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import * as Vue from 'vue'

const renderer = Vue.createRenderer({
  createElement: tag => ({ tagName: tag.toUpperCase(), addEventListener () {}, removeEventListener () {} }),
  createText: () => ({}), createComment: () => ({}),
  insert (node, parent, anchor) {
    detach(node)
    const children = parent.children ||= []
    const index = anchor ? children.indexOf(anchor) : -1
    children.splice(index < 0 ? children.length : index, 0, node)
    node.parent = parent
  },
  remove: detach, setText () {}, setElementText () {}, patchProp () {},
  parentNode: node => node.parent || null,
  nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] || null
})

function detach (node) {
  if (node.parent) {
    const index = node.parent.children.indexOf(node)
    if (index !== -1) {
      node.parent.children.splice(index, 1)
    }
    node.parent = null
  }
}

/** Mount actual component setup with explicit browser/network doubles. */
export function mountComponent (path, bindings, props = {}, renderTemplate = false) {
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
  if (renderTemplate) {
    const template = compileTemplate({
      source: descriptor.template.content, filename: path, id: `lifecycle-test`,
      compilerOptions: { bindingMetadata: compiled.bindings }
    })
    assertCompilation(template.errors)
    const imported = [...template.code.matchAll(/(\w+) as (\w+)/g)]
    const renderCode = template.code.replace(/^import.*$/gm, ``).replace(`export function render`, `function render`)
    component.render = compileFunction(`${renderCode}\nreturn render`, imported.map(match => match[2]))(...imported.map(match => Vue[match[1]]))
  } else {
    component.render = () => null
  }
  const app = renderer.createApp({ render: () => Vue.h(component, { ...props }) })
  app.directive(`html-safe`, {})
  const instance = app.mount({})
  return { app, setup: instance.$.subTree.component.setupState, tree: () => instance.$.subTree.component.subTree }
}

function assertCompilation (errors) {
  if (errors.length) {
    throw new Error(errors.map(String).join(`\n`))
  }
}
