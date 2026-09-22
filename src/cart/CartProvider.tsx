import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from '../context/cart-context'
import type { CartProduct } from '../context/cart-context'
import type { CartItemData } from '../components/CartItem'
import { getCartSummary } from '../services/cart-service'
import { createOrder } from '../services/order-service'
import Cart from './Cart'

type SelectionItem = Pick<CartItemData, 'productId' | 'name' | 'imageUrl' | 'quantity'>
type SummaryRequest = { items: SelectionItem[]; attempt: number }
type SummaryResult = {
  request: SummaryRequest
  data: Awaited<ReturnType<typeof getCartSummary>> | null
  error: string
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [request, setRequest] = useState<SummaryRequest>({ items: [], attempt: 0 })
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)
  const [ordersVersion, setOrdersVersion] = useState(0)
  const pending = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (request.items.length === 0) return
    let active = true

    getCartSummary(request.items)
      .then((data) => { if (active) setResult({ request, data, error: '' }) })
      .catch((error: unknown) => {
        if (active) setResult({ request, data: null, error: error instanceof Error ? error.message : 'Não foi possível calcular o carrinho.' })
      })

    return () => { active = false }
  }, [request])

  // Um resumo só vale para a seleção que originou a consulta.
  const currentResult = result?.request === request ? result : null
  const summary = currentResult?.data
  const summaryError = request.items.length > 0 ? currentResult?.error ?? '' : ''
  const isLoading = request.items.length > 0 && !currentResult
  const items: CartItemData[] = request.items.map((item) => {
    const confirmed = summary?.items.find((entry) => entry.productId === item.productId)
    return { ...item, name: confirmed?.name ?? item.name, unitPrice: confirmed?.unitPrice ?? null, subtotal: confirmed?.subtotal ?? null }
  })
  const total = request.items.length === 0 ? 0 : summary?.total ?? null
  const itemCount = request.items.reduce((sum, item) => sum + item.quantity, 0)

  function updateSelection(update: (items: SelectionItem[]) => SelectionItem[]) {
    if (pending.current) return
    setCheckoutError('')
    setCreatedOrderId(null)
    setRequest((current) => ({ ...current, items: update(current.items) }))
  }

  function addItem(product: CartProduct) {
    updateSelection((current) => {
      const existing = current.find((item) => item.productId === product.id)
      return existing
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { productId: product.id, name: product.name, imageUrl: product.imageUrl ?? null, quantity: 1 }]
    })
  }

  function changeQuantity(productId: string, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    updateSelection((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item))
  }

  function removeItem(productId: string) {
    updateSelection((current) => current.filter((item) => item.productId !== productId))
  }

  function retrySummary() {
    if (pending.current) return
    setRequest((current) => ({ ...current, attempt: current.attempt + 1 }))
  }

  function openCart() {
    setIsOpen(true)
    retrySummary()
  }

  async function checkout() {
    if (pending.current || !summary || summaryError || isLoading || request.items.length === 0) return
    pending.current = true
    setIsSubmitting(true)
    setCheckoutError('')

    try {
      const order = await createOrder(request.items)
      if (!mounted.current) return
      setRequest({ items: [], attempt: 0 })
      setResult(null)
      setCreatedOrderId(order.id)
      setOrdersVersion((version) => version + 1)
    } catch (error) {
      if (mounted.current) setCheckoutError(error instanceof Error ? error.message : 'Não foi possível finalizar o pedido.')
    } finally {
      pending.current = false
      if (mounted.current) setIsSubmitting(false)
    }
  }

  return (
    <CartContext.Provider value={{ isOpen, items, total, itemCount, isLoading, summaryError, isSubmitting, checkoutError, createdOrderId, ordersVersion, openCart, closeCart: () => setIsOpen(false), addItem, changeQuantity, removeItem, retrySummary, checkout }}>
      {children}
      <Cart />
    </CartContext.Provider>
  )
}
