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
 * @property {number} total
 * @property {number} itemCount
 * @property {() => void} openCart
 * @property {() => void} closeCart
 * @property {(product: CartProduct) => void} addItem
 * @property {(productId: string, quantity: number) => void} changeQuantity
 * @property {(productId: string) => void} removeItem
 */

export const CartContext = createContext(
  /** @type {CartState | undefined} */ (undefined),
)
