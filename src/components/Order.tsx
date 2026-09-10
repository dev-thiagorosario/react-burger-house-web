import { Calendar, Clock, PackageCheck, User } from 'lucide-react'

export type OrderStatus = 'pending' | 'pickedUp' | 'cancelled'

type OrderProps = {
  id: number
  userName: string
  status: OrderStatus
  date: string
  orderedAt: string
  pickedUpAt: string
  items: { name: string; quantity: number; price: number }[]
  onStatusChange: (status: OrderStatus) => void
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const statusStyles = {
  pending: 'border-amber-800/20 bg-amber-100 text-amber-950',
  pickedUp: 'border-green-800/20 bg-green-100 text-green-950',
  cancelled: 'border-red-800/20 bg-red-100 text-red-950',
}

const Order = ({ id, userName, status, date, orderedAt, pickedUpAt, items, onStatusChange }: OrderProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <article aria-labelledby={`order-${id}`} className="flex min-w-0 flex-col rounded-2xl bg-[#F2DAAC] p-5 text-[#161410] shadow-lg shadow-black/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#161410]/15 pb-4">
        <h2 id={`order-${id}`} className="text-lg font-bold">Pedido #{String(id).padStart(3, '0')}</h2>
        <select
          aria-label={`Status do pedido ${id}`}
          value={status}
          onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
          className={`min-h-10 max-w-full cursor-pointer rounded-lg border px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161410] ${statusStyles[status]}`}
        >
          <option value="pending">Pendente</option>
          <option value="pickedUp">Retirado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="flex items-center gap-3 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#161410]/10">
          <User aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[#615039]">Cliente</p>
          <p className="font-bold [overflow-wrap:anywhere]">{userName}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 border-y border-[#161410]/15 py-4 text-sm">
        <div className="col-span-2">
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><Calendar aria-hidden="true" className="size-4" />Data do pedido</dt>
          <dd className="mt-1 font-semibold">{date}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><Clock aria-hidden="true" className="size-4" />Feito às</dt>
          <dd className="mt-1 font-semibold tabular-nums">{orderedAt}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><PackageCheck aria-hidden="true" className="size-4" />Retirado às</dt>
          <dd className="mt-1 min-h-5 font-semibold tabular-nums">{status === 'pickedUp' ? pickedUpAt : ''}</dd>
        </div>
      </dl>

      <div className="flex-1 py-5">
        <h3 className="mb-3 text-sm font-bold">Itens do pedido</h3>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.name} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="[overflow-wrap:anywhere]"><span className="font-bold">{item.quantity}×</span> {item.name}</p>
                <p className="mt-1 text-xs text-[#615039]">{priceFormatter.format(item.price)} / unidade</p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{priceFormatter.format(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#161410]/20 pt-4">
        <span className="text-sm font-bold">Valor total</span>
        <span className="text-2xl font-extrabold tabular-nums">{priceFormatter.format(total)}</span>
      </div>
    </article>
  )
}

export default Order
