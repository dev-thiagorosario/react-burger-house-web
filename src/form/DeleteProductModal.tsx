import { useRef, useState } from 'react'
import { deleteProduct } from '../services/product-service'
import ProductActionDialog from './ProductActionDialog'

type Props = {
  product: { id: string; name: string }
  onClose: () => void
  onDeleted: (id: string) => void
}

export default function DeleteProductModal({ product, onClose, onDeleted }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)

  async function handleDelete() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      await deleteProduct(product.id)
      onDeleted(product.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível excluir o produto.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <ProductActionDialog title="Excluir produto" busy={busy} onClose={onClose}>
      <div className="space-y-3 px-5 py-6 sm:px-7">
        <p className="leading-relaxed text-[#E7DFD1]">Tem certeza que deseja excluir <strong className="text-[#FFF7E8] [overflow-wrap:anywhere]">“{product.name}”</strong> do cardápio?</p>
        <p className="text-sm text-[#BFB6A7]">Essa ação não poderá ser desfeita.</p>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </div>
      <footer className="flex justify-end gap-3 border-t border-[#F2DAAC]/10 bg-[#1C1914] px-5 py-4 sm:px-7">
        <button autoFocus type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-lg border border-[#F2DAAC]/30 px-5 text-sm font-semibold text-[#F2DAAC] enabled:cursor-pointer enabled:hover:bg-[#F2DAAC]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2DAAC] disabled:opacity-50">Cancelar</button>
        <button type="button" disabled={busy} onClick={handleDelete} className="min-h-11 rounded-lg bg-[#E90025] px-5 text-sm font-semibold text-white enabled:cursor-pointer enabled:hover:bg-[#C90020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2DAAC] disabled:opacity-50">{busy ? 'Excluindo…' : 'Excluir'}</button>
      </footer>
    </ProductActionDialog>
  )
}
