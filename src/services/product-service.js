import { apiUrl, getJson, requestJson } from './api-client.js'

export function deleteProduct(id) {
  return requestJson(`/delete-products/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Não foi possível excluir o produto.')
}

export async function updateProduct(id, changes) {
  const payload = await requestJson(`/update-products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  }, 'Não foi possível atualizar o produto.')

  const product = payload?.data?.product
  if (payload?.success !== true || product?.id !== id ||
    typeof product.name !== 'string' || typeof product.description !== 'string' ||
    !Number.isFinite(product.price) || product.price < 0 || !Number.isInteger(product.categoryId)) {
    throw new Error('O servidor não confirmou a atualização do produto.')
  }
  return payload.data.product
}

function getImage(product, variant) {
  const image = Array.isArray(product.images)
    ? product.images.find((image) => image?.variant === variant && typeof image.url === 'string' && image.url.trim())
    : undefined
  const legacyUrl = variant === 'desktop' ? product.imageUrl : product.mobileImageUrl
  return image?.url || (typeof legacyUrl === 'string' && legacyUrl.trim() ? legacyUrl : undefined)
}

export async function listProducts() {
  const payload = await getJson('/list-products', 'Não foi possível carregar o cardápio.')
  const products = payload?.data?.products

  if (payload?.success !== true || !Array.isArray(products) || products.some((product) =>
    !product ||
    !['id', 'name', 'description'].every((field) => typeof product[field] === 'string') ||
    !(getImage(product, 'desktop') || getImage(product, 'mobile')) ||
    !Number.isFinite(product.price) || product.price < 0 ||
    !Number.isInteger(product.categoryId) || typeof product.isActive !== 'boolean',
  )) {
    throw new Error('O servidor retornou uma resposta de produtos inválida.')
  }

  return products.filter((product) => product.isActive).map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    imageUrl: new URL(getImage(product, 'desktop') || getImage(product, 'mobile'), `${apiUrl}/`).href,
    mobileImageUrl: getImage(product, 'mobile')
      ? new URL(getImage(product, 'mobile'), `${apiUrl}/`).href
      : undefined,
    imageAlt: product.imageAlt || product.name,
  }))
}
