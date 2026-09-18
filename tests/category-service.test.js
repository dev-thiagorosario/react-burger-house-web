import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { listCategories } from '../src/services/category-service.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('carrega nomes e IDs reais, incluindo novas categorias', async () => {
  const categories = [{ id: 3, name: 'Bebidas' }, { id: 42, name: 'Sobremesas' }]
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/list-categories')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return Response.json({ success: true, data: { categories } })
  }
  assert.deepEqual(await listCategories(), categories)
})

test('distingue lista vazia de resposta inválida', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { categories: [] } })
  assert.deepEqual(await listCategories(), [])
  for (const payload of [
    { success: false },
    { success: true, data: {} },
    { success: true, data: { categories: [null] } },
    { success: true, data: { categories: [{ id: '3', name: 'Bebidas' }] } },
    { success: true, data: { categories: [{ id: 3, name: '' }] } },
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(listCategories(), /resposta de categorias inválida/)
  }
})

test('informa falha HTTP e permite nova consulta', async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 })
  await assert.rejects(listCategories(), { status: 503 })
  globalThis.fetch = async () => Response.json({ success: true, data: { categories: [{ id: 7, name: 'Combos' }] } })
  assert.deepEqual(await listCategories(), [{ id: 7, name: 'Combos' }])
})
