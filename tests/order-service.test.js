import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createOrder, listOrders, listOrderStatuses, updateOrderStatus } from '../src/services/order-service.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const user = { id: '11111111-1111-4111-8111-111111111111', fullName: 'Maria Silva' }
const items = [{ productId: 'bacon-bbq', quantity: 2 }]
const order = {
  id: 42,
  userId: user.id,
  status: 'pending',
  items: [{ id: 101, productId: 'bacon-bbq', name: 'Bacon BBQ na compra', unitPrice: 32.9, quantity: 2, subtotal: 65.8 }],
  totalItems: 2,
  total: 65.8,
  createdAt: '2026-09-22T12:00:00.000Z',
  updatedAt: '2026-09-22T12:00:00.000Z',
  pickedUpAt: null,
}
const details = { ...order, user }

test('lista pedidos pela rota canônica com cookie e sem cache, preservando os dados salvos', async () => {
  const orders = [details, { ...details, id: 43, status: 'pickedUp', pickedUpAt: details.updatedAt }, { ...details, id: 44, status: 'cancelled' }]
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/orders')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return Response.json({ success: true, data: { orders } })
  }
  assert.deepEqual(await listOrders(), orders)
})

test('aceita lista de pedidos vazia e rejeita envelopes ou pedidos inválidos', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { orders: [] } })
  assert.deepEqual(await listOrders(), [])

  for (const payload of [
    null,
    { success: false, data: { orders: [] } },
    { success: true, data: {} },
    { success: true, data: { orders: [null] } },
    ...[
      { total: '65.80' }, { status: 'withdrawn' }, { id: '42' }, { user: undefined },
      { createdAt: 'inválida' }, { pickedUpAt: undefined },
      { items: [{ ...order.items[0], quantity: 1.5 }] },
    ].map((changes) => ({ success: true, data: { orders: [{ ...details, ...changes }] } })),
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(listOrders(), /resposta de pedidos inválida/)
  }
})

test('consulta status reais da API sem presumir seus IDs', async () => {
  const statuses = [{ id: 7, name: 'pending' }, { id: 17, name: 'pickedUp' }, { id: 23, name: 'cancelled' }]
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/list-order-statuses')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return Response.json({ success: true, data: { statuses } })
  }
  assert.deepEqual(await listOrderStatuses(), statuses)
})

test('aceita status vazios e rejeita lista de status malformada', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { statuses: [] } })
  assert.deepEqual(await listOrderStatuses(), [])
  for (const payload of [
    { success: false }, { success: true, data: {} },
    ...[null, { id: '17', name: 'pickedUp' }, { id: 0, name: 'pending' }, { id: 17, name: '' }]
      .map((status) => ({ success: true, data: { statuses: [status] } })),
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(listOrderStatuses(), /resposta de status inválida/)
  }
})

test('cria pedido com cookie e envia somente produto e quantidade', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/create-order')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { items })
    return Response.json({ success: true, message: 'Pedido criado com sucesso.', data: { order } }, { status: 201 })
  }
  assert.deepEqual(await createOrder([{ ...items[0], price: 1, subtotal: 2, name: 'Nome antigo', userId: 'outro' }]), order)
})

test('exige confirmação completa de criação antes de tratar o pedido como concluído', async () => {
  for (const payload of [null, { success: false }, { success: true, data: {} },
    { success: true, data: { order: { id: 42 } } },
    { success: true, data: { order: { ...order, total: '65.80' } } },
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(createOrder(items), /não confirmou a criação/)
  }
})

test('atualiza status pelo ID real e recebe data de retirada e pedido confirmados pelo servidor', async () => {
  const updated = { ...details, status: 'pickedUp', updatedAt: '2026-09-22T12:30:00.000Z', pickedUpAt: '2026-09-22T12:30:00.000Z' }
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/update-order-status/42')
    assert.equal(options.method, 'PATCH')
    assert.equal(options.credentials, 'include')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { statusId: 17 })
    return Response.json({ success: true, data: { order: updated } })
  }
  assert.deepEqual(await updateOrderStatus(42, 17), updated)
})

test('rejeita confirmação de atualização incompleta ou de outro pedido', async () => {
  for (const payload of [null, { success: false }, { success: true, data: {} },
    { success: true, data: { order } },
    { success: true, data: { order: { ...details, id: 43 } } },
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(updateOrderStatus(42, 17), /não confirmou a atualização/)
  }
})

test('preserva falhas de autorização, pedido ausente e transição recusada', async () => {
  for (const status of [401, 403, 404, 409]) {
    globalThis.fetch = async () => Response.json({ success: false, message: 'Atualização recusada.' }, { status })
    await assert.rejects(updateOrderStatus(42, 17), { status, message: 'Atualização recusada.' })
  }
})

test('preserva validação da criação e permite nova tentativa explícita', async () => {
  const errors = [{ field: 'items.0.quantity', message: 'Quantidade inválida.' }]
  globalThis.fetch = async () => Response.json({ success: false, errors }, { status: 400 })
  await assert.rejects(createOrder(items), { status: 400, issues: errors, message: 'Quantidade inválida.' })
  globalThis.fetch = async () => Response.json({ success: true, data: { order } }, { status: 201 })
  assert.deepEqual(await createOrder(items), order)
})

test('informa falhas HTTP e de conexão em consultas e mutações', async () => {
  for (const action of [listOrders, listOrderStatuses, () => createOrder(items), () => updateOrderStatus(42, 17)]) {
    globalThis.fetch = async () => new Response(null, { status: 503 })
    await assert.rejects(action(), { status: 503 })
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
    await assert.rejects(action(), /Não foi possível conectar ao servidor/)
  }
})
