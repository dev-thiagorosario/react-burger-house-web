import { Calendar, Clock, PackageCheck, User } from 'lucide-react'

export type OrderStatus = 'pending' | 'pickedUp' | 'cancelled'

type OrderProps = {
  id: number
  user: { id: string; fullName: string }
  status: OrderStatus
  createdAt: string
  pickedUpAt: string | null
  items: { id: number; name: string; quantity: number; unitPrice: number; subtotal: number }[]
  total: number
  statuses: { id: number; name: string }[]
  canUpdateStatus: boolean
  isUpdating: boolean
  statusError: string
  onStatusChange: (statusId: number) => void
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

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  pickedUp: 'Retirado',
  cancelled: 'Cancelado',
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR')
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

const Order = ({ id, user, status, createdAt, pickedUpAt, items, total, statuses, canUpdateStatus, isUpdating, statusError, onStatusChange }: OrderProps) => {
  const currentStatus = statuses.find((option) => option.name === status)
  const createdDate = new Date(createdAt)
  const badgeClassName = `rounded-lg border px-3 text-sm font-bold ${statusStyles[status]}`

  return (
    <article aria-labelledby={`order-${id}`} className="flex min-w-0 flex-col rounded-2xl bg-[#F2DAAC] p-5 text-[#161410] shadow-lg shadow-black/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#161410]/15 pb-4">
        <h2 id={`order-${id}`} className="text-lg font-bold">Pedido #{String(id).padStart(3, '0')}</h2>
        {canUpdateStatus && status === 'pending' && currentStatus ? (
          <select
            aria-label={`Status do pedido ${id}`}
            aria-busy={isUpdating}
            aria-describedby={statusError ? `order-${id}-status-error` : undefined}
            value={currentStatus.id}
            disabled={isUpdating}
            onChange={(event) => onStatusChange(Number(event.target.value))}
            className={`min-h-10 max-w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161410] disabled:cursor-not-allowed disabled:opacity-60 ${badgeClassName}`}
          >
            {statuses.map((option) => (
              <option key={option.id} value={option.id}>{statusLabels[option.name] ?? option.name}</option>
            ))}
          </select>
        ) : (
          <span className={`inline-flex min-h-10 items-center ${badgeClassName}`}>{statusLabels[status] ?? status}</span>
        )}
      </div>
      {isUpdating && <p role="status" className="pt-3 text-sm text-[#615039]">Atualizando status...</p>}
      {statusError && <p id={`order-${id}-status-error`} role="alert" className="pt-3 text-sm text-red-800">{statusError}</p>}

      <div className="flex items-center gap-3 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#161410]/10">
          <User aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[#615039]">Cliente</p>
          <p className="font-bold [overflow-wrap:anywhere]">{user.fullName}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 border-y border-[#161410]/15 py-4 text-sm">
        <div className="col-span-2">
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><Calendar aria-hidden="true" className="size-4" />Data do pedido</dt>
          <dd className="mt-1 font-semibold"><time dateTime={createdAt}>{dateFormatter.format(createdDate)}</time></dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><Clock aria-hidden="true" className="size-4" />Feito às</dt>
          <dd className="mt-1 font-semibold tabular-nums"><time dateTime={createdAt}>{timeFormatter.format(createdDate)}</time></dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs text-[#615039]"><PackageCheck aria-hidden="true" className="size-4" />Retirado às</dt>
          <dd className="mt-1 min-h-5 font-semibold tabular-nums">
            {pickedUpAt ? <time dateTime={pickedUpAt} title={dateFormatter.format(new Date(pickedUpAt))}>{timeFormatter.format(new Date(pickedUpAt))}</time> : '—'}
          </dd>
        </div>
      </dl>

      <div className="flex-1 py-5">
        <h3 className="mb-3 text-sm font-bold">Itens do pedido</h3>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="[overflow-wrap:anywhere]"><span className="font-bold">{item.quantity}×</span> {item.name}</p>
                <p className="mt-1 text-xs text-[#615039]">{priceFormatter.format(item.unitPrice)} / unidade</p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{priceFormatter.format(item.subtotal)}</span>
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
