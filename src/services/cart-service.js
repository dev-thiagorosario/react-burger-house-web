import { postJson } from './api-client.js'

/**
 * @typedef {Object} CartSelectionItem
 * @property {string} productId
 * @property {number} quantity
 *
 * @typedef {CartSelectionItem & { name: string, unitPrice: number, subtotal: number }} CartSummaryItem
 *
 * @typedef {Object} CartSummary
 * @property {CartSummaryItem[]} items
 * @property {number} totalItems
 * @property {number} total
 */

function matchesSelection(summaryItems, selection) {
  if (summaryItems.length !== selection.length) return false

  const remaining = [...selection]
  return summaryItems.every(({ productId, quantity }) => {
    const index = remaining.findIndex((item) => item.productId === productId && item.quantity === quantity)
    if (index === -1) return false
    remaining.splice(index, 1)
    return true
  })
}

/**
 * @param {CartSelectionItem[]} items
 * @returns {Promise<CartSummary>}
 */
export async function getCartSummary(items) {
  const payload = await postJson('/cart/summary', {
    items: items.map(({ productId, quantity }) => ({ productId, quantity })),
  }, 'Não foi possível calcular o resumo do carrinho.')
  const summary = payload?.data

  if (payload?.success !== true || !summary ||
    !Array.isArray(summary.items) || summary.items.length === 0 ||
    summary.items.some((item) =>
      !item || typeof item.productId !== 'string' || !item.productId.trim() ||
      typeof item.name !== 'string' || !item.name.trim() ||
      !Number.isFinite(item.unitPrice) || item.unitPrice < 0 ||
      !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
      !Number.isFinite(item.subtotal) || item.subtotal < 0,
    ) ||
    !matchesSelection(summary.items, items) ||
    !Number.isSafeInteger(summary.totalItems) || summary.totalItems < 1 ||
    summary.totalItems !== items.reduce((total, item) => total + item.quantity, 0) ||
    !Number.isFinite(summary.total) || summary.total < 0) {
    throw new Error('O servidor retornou um resumo do carrinho inválido.')
  }

  return summary
}
