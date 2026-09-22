import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getCartSummary } from '../src/services/cart-service.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const items = [{ productId: 'bacon-bbq', quantity: 2 }]
const summary = {
  items: [{ productId: 'bacon-bbq', name: 'Bacon BBQ', unitPrice: 32.9, quantity: 2, subtotal: 65.8 }],
  totalItems: 2,
  total: 65.8,
}

test('consulta resumo autenticado enviando apenas os produtos e quantidades', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/cart/summary')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { items })
    return Response.json({ success: true, data: summary })
  }

  const result = await getCartSummary([{ ...items[0], name: 'Nome antigo', price: 1, subtotal: 2 }])
  assert.deepEqual(result, summary)
})

test('preserva preços atuais da API e aceita produtos gratuitos', async () => {
  const freeSummary = {
    items: [{ ...summary.items[0], unitPrice: 0, subtotal: 0 }],
    totalItems: 2,
    total: 0,
  }
  globalThis.fetch = async () => Response.json({ success: true, data: freeSummary })
  assert.deepEqual(await getCartSummary(items), freeSummary)
})

test('rejeita resumo incompleto ou valores inválidos sem mostrar total fictício', async () => {
  for (const payload of [
    null,
    { success: false, data: summary },
    { success: true, data: {} },
    { success: true, data: { ...summary, total: '65.80' } },
    { success: true, data: { ...summary, totalItems: 1.5 } },
    { success: true, data: { ...summary, items: [] } },
    { success: true, data: { ...summary, items: [null] } },
    { success: true, data: { ...summary, items: [{ ...summary.items[0], quantity: 0 }] } },
    { success: true, data: { ...summary, items: [{ ...summary.items[0], subtotal: -1 }] } },
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(getCartSummary(items), /resumo do carrinho inválido/)
  }
})

test('preserva falhas de sessão, produto removido ou indisponível e permite nova consulta', async () => {
  for (const status of [401, 404, 409]) {
    globalThis.fetch = async () => Response.json({ success: false, message: 'Não foi possível consultar o carrinho.' }, { status })
    await assert.rejects(getCartSummary(items), { status, message: 'Não foi possível consultar o carrinho.' })
  }
  globalThis.fetch = async () => Response.json({ success: true, data: summary })
  assert.deepEqual(await getCartSummary(items), summary)
})

test('rejeita resumo parcial, produtos duplicados e quantidades diferentes da seleção', async () => {
  const selection = [...items, { productId: 'batata-frita', quantity: 1 }]
  const fries = { productId: 'batata-frita', name: 'Batata frita', unitPrice: 10, quantity: 1, subtotal: 10 }
  for (const data of [
    summary,
    { ...summary, items: [...summary.items, { ...fries, productId: 'outro-produto' }], totalItems: 3 },
    { ...summary, items: [...summary.items, { ...fries, quantity: 2 }], totalItems: 4 },
    { ...summary, items: [summary.items[0], summary.items[0]], totalItems: 4 },
    { ...summary, items: [...summary.items, fries], totalItems: 2 },
  ]) {
    globalThis.fetch = async () => Response.json({ success: true, data })
    await assert.rejects(getCartSummary(selection), /resumo do carrinho inválido/)
  }
})

test('aceita os mesmos itens em outra ordem sem recalcular os preços retornados', async () => {
  const selection = [...items, { productId: 'batata-frita', quantity: 1 }]
  const data = {
    items: [{ productId: 'batata-frita', name: 'Batata frita', unitPrice: 10, quantity: 1, subtotal: 10 }, ...summary.items],
    totalItems: 3,
    total: 75.8,
  }
  globalThis.fetch = async () => Response.json({ success: true, data })
  assert.deepEqual(await getCartSummary(selection), data)
})

test('preserva erros de validação do resumo', async () => {
  const errors = [{ field: 'items.0.quantity', message: 'A quantidade deve ser maior ou igual a um.' }]
  globalThis.fetch = async () => Response.json({ success: false, errors }, { status: 400 })
  await assert.rejects(getCartSummary(items), { status: 400, issues: errors, message: errors[0].message })
})

test('informa falhas HTTP sem JSON e falhas de conexão', async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 })
  await assert.rejects(getCartSummary(items), { status: 503, message: 'Não foi possível calcular o resumo do carrinho.' })
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(getCartSummary(items), /Não foi possível conectar ao servidor/)
})
