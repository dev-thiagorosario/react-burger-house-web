import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export type CartItemData = {
  productId: string
  name: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

type Props = {
  item: CartItemData
  disabled: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const controlClass = 'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82B16] disabled:cursor-not-allowed disabled:opacity-40'

export default function CartItem({ item, disabled, onQuantityChange, onRemove }: Props) {
  return (
    <li className="flex gap-3 border-b border-[#372719]/15 py-5">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#372719]/10 sm:size-24">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="size-full object-cover" /> : <ShoppingBag aria-hidden="true" className="size-7 text-[#765638]" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="font-bold leading-snug [overflow-wrap:anywhere]">{item.name}</h3>
            <p className="mt-1 text-xs text-[#6C4D30]">{money.format(item.unitPrice)} por unidade</p>
          </div>
          <button type="button" disabled={disabled} onClick={onRemove} aria-label={`Remover ${item.name} do carrinho`} className={`${controlClass} -mr-2 -mt-2 text-[#A82B16] enabled:hover:bg-[#A82B16]/10`}>
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div role="group" aria-label={`Quantidade de ${item.name}`} className="flex items-center rounded-xl border border-[#372719]/20 bg-white/25">
            <button type="button" disabled={disabled || item.quantity <= 1} onClick={() => onQuantityChange(item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className={`${controlClass} enabled:hover:bg-white/40`}><Minus className="size-4" aria-hidden="true" /></button>
            <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-label={`${item.quantity} unidades`}>{item.quantity}</span>
            <button type="button" disabled={disabled} onClick={() => onQuantityChange(item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className={`${controlClass} enabled:hover:bg-white/40`}><Plus className="size-4" aria-hidden="true" /></button>
          </div>
          <p className="text-sm font-bold tabular-nums">{money.format(item.subtotal)}</p>
        </div>
      </div>
    </li>
  )
}
