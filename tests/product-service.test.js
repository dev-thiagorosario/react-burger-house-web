import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { listProducts } from '../src/services/product-service.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const product = {
  id: 'bacon-bbq', name: 'Bacon BBQ', description: 'Hambúrguer com bacon',
  price: 32.9, categoryId: 1, imageUrl: '/assets/bacon.jpg',
  mobileImageUrl: '/assets/bacon-mobile.png', imageAlt: 'Hambúrguer Bacon BBQ',
  isActive: true, createdAt: '2026-09-17T22:02:36.559Z',
}

test('consulta list-products com cookie e adapta produtos ativos para o cardápio', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/list-products')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return Response.json({ success: true, data: { products: [product, { ...product, id: 'inactive', isActive: false }] } })
  }
  assert.deepEqual(await listProducts(), [{
    id: product.id, name: product.name, description: product.description,
    price: 32.9, categoryId: 1,
    imageUrl: 'http://localhost:8080/assets/bacon.jpg',
    mobileImageUrl: 'http://localhost:8080/assets/bacon-mobile.png',
    imageAlt: product.imageAlt,
  }])
})

test('preserva URL absoluta e usa nome quando texto alternativo não é informado', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { products: [{
    ...product, imageUrl: 'https://cdn.example.com/burger.jpg', mobileImageUrl: null, imageAlt: null,
  }] } })
  const [result] = await listProducts()
  assert.equal(result.imageUrl, 'https://cdn.example.com/burger.jpg')
  assert.equal(result.mobileImageUrl, undefined)
  assert.equal(result.imageAlt, product.name)
})

test('aceita cardápio vazio', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { products: [] } })
  assert.deepEqual(await listProducts(), [])
})

test('lê images por variante no contrato atual, independente da ordem', async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: { products: [{
    ...product, imageUrl: undefined, mobileImageUrl: undefined,
    images: [
      { variant: 'mobile', url: '/products/bacon-bbq/images/mobile' },
      { variant: 'desktop', url: '/products/bacon-bbq/images/desktop' },
    ],
  }] } })
  const [result] = await listProducts()
  assert.equal(result.imageUrl, 'http://localhost:8080/products/bacon-bbq/images/desktop')
  assert.equal(result.mobileImageUrl, 'http://localhost:8080/products/bacon-bbq/images/mobile')
})

test('aceita produto com apenas uma variante de imagem', async () => {
  for (const variant of ['desktop', 'mobile']) {
    globalThis.fetch = async () => Response.json({ success: true, data: { products: [{
      ...product, imageUrl: undefined, mobileImageUrl: undefined,
      images: [{ variant, url: `/products/bacon-bbq/images/${variant}` }],
    }] } })
    const [result] = await listProducts()
    assert.equal(result.imageUrl, `http://localhost:8080/products/bacon-bbq/images/${variant}`)
  }
})

test('rejeita envelope ou produto inválido em vez de tratar como cardápio vazio', async () => {
  for (const payload of [
    { success: false, data: { products: [] } },
    { success: true, data: {} },
    { success: true, data: { products: [{ ...product, price: '32.90' }] } },
    { success: true, data: { products: [null] } },
    { success: true, data: { products: [{ ...product, imageUrl: undefined, mobileImageUrl: undefined, images: [null, { variant: 'desktop', url: 123 }] }] } },
  ]) {
    globalThis.fetch = async () => Response.json(payload)
    await assert.rejects(listProducts(), /resposta de produtos inválida/)
  }
})

test('informa falha HTTP e permite uma nova consulta', async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 })
  await assert.rejects(listProducts(), { status: 503, message: 'Não foi possível carregar o cardápio.' })
  globalThis.fetch = async () => Response.json({ success: true, data: { products: [product] } })
  assert.equal((await listProducts()).length, 1)
})

test('informa falha de conexão', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(listProducts(), /Não foi possível conectar ao servidor/)
})
