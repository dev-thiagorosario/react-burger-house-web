import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle, ShoppingBag, X } from 'lucide-react'
import CartItem from '../components/CartItem'
import { useCart } from '../hooks/use-cart'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const buttonClass = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82B16] disabled:cursor-not-allowed disabled:opacity-50'

export default function Cart() {
  const { isOpen, closeCart, items, total, itemCount, isLoading, summaryError, isSubmitting, checkoutError, createdOrderId, changeQuantity, removeItem, retrySummary, checkout } = useCart()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [isOpen])

  return (
    <dialog id="shopping-cart" ref={dialogRef} aria-labelledby="cart-title" onCancel={(event) => { event.preventDefault(); closeCart() }} onClick={(event) => { if (event.target === event.currentTarget) closeCart() }} className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-md border-0 bg-[#F2DAAC] p-0 text-[#251B12] shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm">
      <div className="flex h-full flex-col" onClick={(event) => event.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#372719]/15 px-5 py-5 sm:px-6">
          <div>
            <h2 id="cart-title" className="text-xl font-extrabold">Meu carrinho</h2>
            <p className="mt-1 text-sm text-[#6C4D30]">{itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item selecionado' : 'itens selecionados'}` : 'Seu próximo favorito está aqui.'}</p>
          </div>
          <button type="button" onClick={closeCart} autoFocus aria-label="Fechar carrinho" className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl hover:bg-[#372719]/10 focus-visible:outline-2 focus-visible:outline-[#A82B16]"><X aria-hidden="true" className="size-5" /></button>
        </header>

        <div aria-busy={isLoading || isSubmitting} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
          {items.length > 0 && (
            <ul className="pb-4">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  disabled={isSubmitting}
                  onQuantityChange={(quantity) => changeQuantity(item.productId, quantity)}
                  onRemove={() => removeItem(item.productId)}
                />
              ))}
            </ul>
          )}
          {createdOrderId !== null && (
            <div className="flex min-h-72 flex-col items-center justify-center py-10 text-center">
              <CheckCircle className="mb-5 size-12 text-green-800" aria-hidden="true" />
              <h3 role="status" className="text-lg font-bold">Pedido #{createdOrderId} criado com sucesso!</h3>
              <p className="mt-2 text-sm text-[#6C4D30]">Acompanhe seu pedido na página de pedidos.</p>
              <Link to="/pedidos" onClick={closeCart} className={`${buttonClass} mt-6 max-w-64 bg-[#BB2D13] text-white`}>Ver meus pedidos <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          )}
          {items.length === 0 && createdOrderId === null && (
            <div className="flex min-h-72 flex-col items-center justify-center py-10 text-center">
              <span className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#372719]/5">
                <ShoppingBag className="size-9 text-[#8E6540]" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-bold">Seu carrinho está vazio</h3>
              <p className="mt-2 max-w-64 text-sm leading-relaxed text-[#6C4D30]">
                Escolha seus hambúrgueres, porções e bebidas favoritos para começar.
              </p>
              <Link to="/home" onClick={closeCart} className={`${buttonClass} mt-6 max-w-64 border border-[#372719]/25 hover:bg-white/30`}>
                Explorar produtos <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        <footer className="shrink-0 space-y-4 border-t border-[#372719]/15 bg-[#F8E7C8] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          {isLoading && <p role="status" className="text-sm text-[#6C4D30]">Atualizando valores do carrinho...</p>}
          {summaryError && <div role="alert" className="text-sm text-[#A82B16]"><p>{summaryError}</p><button type="button" onClick={retrySummary} className="min-h-11 cursor-pointer font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#A82B16]">Tentar novamente</button></div>}
          {checkoutError && <p role="alert" className="text-sm text-[#A82B16]">{checkoutError}</p>}
          <div className="flex items-center justify-between gap-3"><span className="font-medium">Total do pedido</span><span aria-live="polite" aria-atomic="true" className="text-2xl font-extrabold tabular-nums">{total === null ? '—' : money.format(total)}</span></div>
          <button type="button" onClick={checkout} disabled={items.length === 0 || isLoading || isSubmitting || !!summaryError || total === null} aria-busy={isSubmitting} className={`${buttonClass} bg-[#BB2D13] text-white`}>{isSubmitting ? 'Enviando pedido...' : 'Finalizar pedido'} <ArrowRight className="size-5" aria-hidden="true" /></button>
          {items.length > 0 && (
            <Link to="/home" onClick={closeCart} className="flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-[#6C4D30] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#A82B16]">
              Continuar comprando
            </Link>
          )}
        </footer>
      </div>
    </dialog>
  )
}
