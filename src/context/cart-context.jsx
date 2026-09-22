import { createContext } from 'react'

/**
 * @typedef {Object} CartProduct
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} [imageUrl]
 */

/**
 * @typedef {Object} CartState
 * @property {boolean} isOpen
 * @property {import('../components/CartItem').CartItemData[]} items
 * @property {number | null} total
 * @property {number} itemCount
 * @property {boolean} isLoading
 * @property {string} summaryError
 * @property {boolean} isSubmitting
 * @property {string} checkoutError
 * @property {number | null} createdOrderId
 * @property {number} ordersVersion
 * @property {() => void} openCart
 * @property {() => void} closeCart
 * @property {(product: CartProduct) => void} addItem
 * @property {(productId: string, quantity: number) => void} changeQuantity
 * @property {(productId: string) => void} removeItem
 * @property {() => void} retrySummary
 * @property {() => Promise<void>} checkout
 */

export const CartContext = createContext(
  /** @type {CartState | undefined} */ (undefined),
)
