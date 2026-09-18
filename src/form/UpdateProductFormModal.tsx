import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { listCategories } from '../services/category-service'
import { updateProduct } from '../services/product-service'
import ProductActionDialog from './ProductActionDialog'

type ProductData = {
  id: string
  name: string
  description: string
  price: number
  categoryId: number
  imageUrl: string
  imageAlt?: string
}

type Props = {
  product: ProductData
  onClose: () => void
  onUpdated: (product: ProductData) => void
}

const fieldClass = 'w-full min-w-0 rounded-xl border border-[#F2DAAC]/15 bg-[#161410] px-3.5 py-3 text-base text-[#FFF7E8] outline-none focus:border-[#F2DAAC]/60 focus:ring-2 focus:ring-[#F2DAAC]/10 disabled:opacity-60'
const labelClass = 'mb-2 block text-sm font-semibold text-[#E7DFD1]'
const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

export default function UpdateProductFormModal({ product, onClose, onUpdated }: Props) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(formatPrice(product.price))
  const [categoryId, setCategoryId] = useState(String(product.categoryId))
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)

  useEffect(() => {
    let active = true
    listCategories().then((result) => { if (active) setCategories(result) })
      .catch((error: unknown) => { if (active) setCategoryError(error instanceof Error ? error.message : 'Não foi possível carregar as categorias.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || loading || categoryError) return
    if (!name.trim()) { setError('Informe o nome do produto.'); return }
    const values = { name: name.trim(), description, price: Number(price.replace(/\D/g, '')) / 100, categoryId: Number(categoryId) }
    // PATCH only edited fields, preserving unrelated data on the server.
    const changes = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== product[key as keyof typeof values]))
    if (Object.keys(changes).length === 0) { onClose(); return }
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const updated = await updateProduct(product.id, changes)
      onUpdated({ ...product, name: updated.name, description: updated.description, price: updated.price, categoryId: updated.categoryId, imageAlt: updated.imageAlt })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível atualizar o produto.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <ProductActionDialog title="Atualizar produto" busy={busy} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={busy} className="grid min-w-0 gap-6 p-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-7">
          <div className="min-w-0">
            <span className={labelClass}>Foto do produto</span>
            <img src={product.imageUrl} alt={product.imageAlt || product.name} className="aspect-square max-h-52 w-full rounded-xl border border-[#F2DAAC]/15 object-cover" />
            <p className="mt-2 text-xs text-[#BFB6A7]">A foto atual será mantida.</p>
          </div>
          <div className="min-w-0 space-y-4">
            <div><label htmlFor="update-name" className={labelClass}>Nome do produto</label><input autoFocus id="update-name" name="name" required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></div>
            <div><label htmlFor="update-description" className={labelClass}>Descrição <span className="font-normal text-[#938B7E]">(opcional)</span></label><textarea id="update-description" name="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClass} block resize-y`} /></div>
            <div className="grid gap-4 min-[420px]:grid-cols-2">
              <div className="min-w-0"><label htmlFor="update-category" className={labelClass}>Categoria</label><select id="update-category" name="categoryId" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={loading || !!categoryError || !categories.length} className={fieldClass}>
                {!categories.some(({ id }) => String(id) === categoryId) && <option value={categoryId} disabled>{loading ? 'Carregando…' : `Categoria ${categoryId} (atual)`}</option>}
                {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select></div>
              <div className="min-w-0"><label htmlFor="update-price" className={labelClass}>Preço</label><input id="update-price" name="price" required inputMode="numeric" value={price} onChange={(event) => { const digits = event.target.value.replace(/\D/g, '').slice(0, 10); setPrice(digits ? formatPrice(Number(digits) / 100) : '') }} className={fieldClass} /></div>
            </div>
            <div aria-live="polite" className="text-sm text-[#BFB6A7]">
              {loading && <p>Buscando categorias…</p>}
              {categoryError && <div role="alert"><p className="text-red-300">{categoryError}</p><button type="button" onClick={() => { setLoading(true); setCategoryError(''); setAttempt((value) => value + 1) }} className="min-h-11 cursor-pointer text-[#F2DAAC] underline underline-offset-4">Tentar novamente</button></div>}
              {!loading && !categoryError && !categories.length && <p>Nenhuma categoria disponível. A categoria atual será mantida.</p>}
            </div>
          </div>
        </fieldset>
        <footer className="border-t border-[#F2DAAC]/10 bg-[#1C1914] px-5 py-4 sm:px-7">
          {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} disabled={busy} className="min-h-11 rounded-lg border border-[#F2DAAC]/30 px-5 text-sm font-semibold text-[#F2DAAC] enabled:cursor-pointer enabled:hover:bg-[#F2DAAC]/10 focus-visible:outline-2 focus-visible:outline-[#F2DAAC] disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={busy || loading || !!categoryError} className="min-h-11 rounded-lg bg-[#E90025] px-5 text-sm font-semibold text-white enabled:cursor-pointer enabled:hover:bg-[#C90020] focus-visible:outline-2 focus-visible:outline-[#F2DAAC] disabled:opacity-50">{busy ? 'Salvando…' : 'Salvar alterações'}</button>
          </div>
        </footer>
      </form>
    </ProductActionDialog>
  )
}
