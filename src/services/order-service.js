import { getJson, postJson, requestJson } from './api-client.js'

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} userId
 * @property {'pending' | 'pickedUp' | 'cancelled'} status
 * @property {(import('./cart-service.js').CartSummaryItem & { id: number })[]} items
 * @property {number} totalItems
 * @property {number} total
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string | null} pickedUpAt
 *
 * @typedef {Order & { user: { id: string, fullName: string } }} OrderDetails
 *
 * @typedef {Object} OrderStatus
 * @property {number} id
 * @property {string} name
 */

function isDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function isOrder(order, requireUser = false) {
  return order && Number.isSafeInteger(order.id) && order.id > 0 &&
    typeof order.userId === 'string' && order.userId.trim() &&
    ['pending', 'pickedUp', 'cancelled'].includes(order.status) &&
    Array.isArray(order.items) && order.items.every((item) =>
      item && Number.isSafeInteger(item.id) && item.id > 0 &&
      typeof item.productId === 'string' && item.productId.trim() &&
      typeof item.name === 'string' && item.name.trim() &&
      Number.isFinite(item.unitPrice) && item.unitPrice >= 0 &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 &&
      Number.isFinite(item.subtotal) && item.subtotal >= 0,
    ) &&
    Number.isSafeInteger(order.totalItems) && order.totalItems >= 0 &&
    Number.isFinite(order.total) && order.total >= 0 &&
    isDate(order.createdAt) && isDate(order.updatedAt) &&
    (order.pickedUpAt === null || isDate(order.pickedUpAt)) &&
    (!requireUser || (order.user?.id === order.userId &&
      typeof order.user.fullName === 'string' && order.user.fullName.trim()))
}

/** @returns {Promise<OrderDetails[]>} */
export async function listOrders() {
  const payload = await getJson('/orders', 'Não foi possível carregar os pedidos.')
  const orders = payload?.data?.orders

  if (payload?.success !== true || !Array.isArray(orders) ||
    orders.some((order) => !isOrder(order, true))) {
    throw new Error('O servidor retornou uma resposta de pedidos inválida.')
  }

  return orders
}

/** @returns {Promise<OrderStatus[]>} */
export async function listOrderStatuses() {
  const payload = await getJson('/list-order-statuses', 'Não foi possível carregar os status dos pedidos.')
  const statuses = payload?.data?.statuses

  if (payload?.success !== true || !Array.isArray(statuses) || statuses.some((status) =>
    !status || !Number.isSafeInteger(status.id) || status.id <= 0 ||
    typeof status.name !== 'string' || !status.name.trim(),
  )) {
    throw new Error('O servidor retornou uma resposta de status inválida.')
  }

  return statuses
}

/**
 * @param {import('./cart-service.js').CartSelectionItem[]} items
 * @returns {Promise<Order>}
 */
export async function createOrder(items) {
  const payload = await postJson('/create-order', {
    items: items.map(({ productId, quantity }) => ({ productId, quantity })),
  }, 'Não foi possível criar o pedido.')
  const order = payload?.data?.order

  if (payload?.success !== true || !isOrder(order)) {
    throw new Error('O servidor não confirmou a criação do pedido.')
  }

  return order
}

/**
 * @param {number} id
 * @param {number} statusId
 * @returns {Promise<OrderDetails>}
 */
export async function updateOrderStatus(id, statusId) {
  const payload = await requestJson(`/update-order-status/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statusId }),
  }, 'Não foi possível atualizar o status do pedido.')
  const order = payload?.data?.order

  if (payload?.success !== true || !isOrder(order, true) || order.id !== id) {
    throw new Error('O servidor não confirmou a atualização do pedido.')
  }

  return order
}
