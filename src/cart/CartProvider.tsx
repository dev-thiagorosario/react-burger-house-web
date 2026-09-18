import { useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from '../context/cart-context'
import type { CartProduct } from '../context/cart-context'
import type { CartItemData } from '../components/CartItem'
import Cart from './Cart'

// Estado temporário para interação com a interface. Não persiste nem cria pedidos.
// A integração futura substituirá esta prévia pelos valores retornados pelo servidor.
export default function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selection, setSelection] = useState<Omit<CartItemData, 'subtotal'>[]>([])
  const items = selection.map((item) => ({
    ...item,
    subtotal: Math.round(item.unitPrice * 100) * item.quantity / 100,
  }))
  const total = items.reduce((sum, item) => sum + Math.round(item.subtotal * 100), 0) / 100
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  function addItem(product: CartProduct) {
    setSelection((current) => {
      const existing = current.find((item) => item.productId === product.id)
      return existing
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId: product.id, name: product.name, imageUrl: product.imageUrl ?? null, unitPrice: product.price, quantity: 1 }]
    })
  }

  function changeQuantity(productId: string, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    setSelection((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item))
  }

  function removeItem(productId: string) {
    setSelection((current) => current.filter((item) => item.productId !== productId))
  }

  return (
    <CartContext.Provider value={{ isOpen, items, total, itemCount, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), addItem, changeQuantity, removeItem }}>
      {children}
      <Cart />
    </CartContext.Provider>
  )
}
