import { useEffect, useRef, useState } from 'react'
import { Camera, ChevronDown, Plus, X } from 'lucide-react'
import Button from '../components/Button'
import { listCategories } from '../services/category-service'

type ProductFormModalProps = {
  isOpen: boolean
  onClose: () => void
}

const fieldClass = 'w-full min-w-0 rounded-xl border border-[#F2DAAC]/15 bg-[#161410] px-3.5 py-3 text-base text-[#FFF7E8] placeholder:text-[#938B7E] outline-none transition-colors focus:border-[#F2DAAC]/60 focus:ring-2 focus:ring-[#F2DAAC]/10 disabled:cursor-not-allowed disabled:opacity-60'
const labelClass = 'mb-2 block text-sm font-semibold text-[#E7DFD1]'

function ProductFormContent({ onClose }: Pick<ProductFormModalProps, 'onClose'>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  const [price, setPrice] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    let active = true
    listCategories()
      .then((result) => { if (active) setCategories(result) })
      .catch((error: unknown) => {
        if (active) setCategoryError(error instanceof Error ? error.message : 'Não foi possível carregar as categorias.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    if (!imagePreview) return
    return () => URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="product-modal-title"
      aria-describedby="product-modal-description"
      onCancel={(event) => { event.preventDefault(); onCloseRef.current() }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-[#F2DAAC]/25 bg-[#211E18] p-0 text-[#FFF7E8] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <header className="flex items-start justify-between gap-4 border-b border-[#F2DAAC]/10 px-5 py-5 sm:px-7">
        <div>
          <h2 id="product-modal-title" className="text-xl font-bold tracking-tight sm:text-2xl">Adicionar produto</h2>
          <p id="product-modal-description" className="mt-1.5 text-sm text-[#BFB6A7]">Capriche nos detalhes do seu próximo favorito.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar modal" className="-mr-2 -mt-1 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#C5BDAF] hover:bg-[#F2DAAC]/10 hover:text-[#FFF7E8] focus-visible:outline-2 focus-visible:outline-[#F2DAAC]">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={(event) => {
        event.preventDefault()
        setSubmitError('O envio de produtos ainda não está integrado. Os dados preenchidos foram mantidos.')
      }}>
        <div className="grid gap-6 p-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="min-w-0">
            <span className={labelClass}>Foto do produto</span>
            <label className="group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#F2DAAC]/30 bg-[#161410] text-center transition-colors hover:border-[#F2DAAC]/70 focus-within:ring-2 focus-within:ring-[#F2DAAC] sm:aspect-square">
              <input
                name="image" type="file" aria-label="Foto do produto" aria-describedby="product-image-help" aria-invalid={!!imageError}
                accept="image/png,image/jpeg,image/webp" className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                    setImageError('Escolha uma imagem PNG, JPG ou WEBP de até 5 MB.')
                    event.target.value = ''
                    return
                  }
                  setImageError('')
                  setImagePreview(URL.createObjectURL(file))
                }}
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Prévia da foto do produto" className="absolute inset-0 size-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-3 text-sm font-semibold">Trocar foto</span>
                </>
              ) : (
                <div className="px-4 py-6">
                  <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#F2DAAC]/10 text-[#F2DAAC]"><Camera className="size-6" strokeWidth={1.5} aria-hidden="true" /></span>
                  <span className="block text-sm font-semibold">Adicionar foto</span>
                  <span className="mt-1 block text-xs text-[#BFB6A7]">Escolha uma imagem do produto</span>
                </div>
              )}
            </label>
            <p id="product-image-help" className="mt-2.5 text-xs leading-relaxed text-[#BFB6A7]">PNG, JPG ou WEBP · Até 5 MB</p>
            {imageError && <p role="alert" className="mt-2 text-sm text-red-300">{imageError}</p>}
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <label htmlFor="product-name" className={labelClass}>Nome do produto</label>
              <input id="product-name" name="name" required placeholder="Ex.: Bacon BBQ" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="product-description" className={labelClass}>Descrição <span className="font-normal text-[#938B7E]">(opcional)</span></label>
              <textarea id="product-description" name="description" rows={3} placeholder="Ingredientes e o que torna esse produto especial" className={`${fieldClass} block min-h-24 resize-y`} />
            </div>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="product-category" className={labelClass}>Categoria</label>
                <div className="relative">
                  <select id="product-category" name="categoryId" required defaultValue="" disabled={loading || !!categoryError || categories.length === 0} aria-describedby="product-category-status" className={`${fieldClass} appearance-none pr-9`}>
                    <option value="" disabled>{loading ? 'Carregando…' : categoryError ? 'Indisponível' : categories.length === 0 ? 'Sem categorias' : 'Selecione'}</option>
                    {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#C5BDAF]" aria-hidden="true" />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="product-price" className={labelClass}>Preço</label>
                <input id="product-price" name="price" type="text" inputMode="numeric" required value={price} placeholder="R$ 0,00" className={fieldClass} onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 9)
                  setPrice(digits ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(digits) / 100) : '')
                }} />
              </div>
            </div>
            <div id="product-category-status" aria-live="polite" className="text-sm text-[#BFB6A7]">
              {loading && <p>Buscando categorias do cardápio…</p>}
              {categoryError && <div role="alert"><p className="text-red-300">{categoryError}</p><button type="button" className="min-h-11 cursor-pointer text-[#F2DAAC] underline underline-offset-4" onClick={() => { setLoading(true); setCategoryError(''); setAttempt((value) => value + 1) }}>Tentar novamente</button></div>}
              {!loading && !categoryError && categories.length === 0 && <p>Nenhuma categoria cadastrada. Cadastre uma categoria para adicionar produtos.</p>}
            </div>
          </div>
        </div>
        <footer className="border-t border-[#F2DAAC]/10 bg-[#1C1914] px-5 py-4 sm:px-7">
          {submitError && <p role="alert" className="mb-3 text-sm text-red-300">{submitError}</p>}
          <Button type="submit" backgroundColor="#E90025" textColor="#FFFFFF" borderColor="#E90025" disabled={loading || !!categoryError || categories.length === 0 || !!imageError} className="flex max-w-none items-center justify-center gap-2 focus-visible:outline-[#F2DAAC]">
            <Plus className="size-5" aria-hidden="true" /> Adicionar produto
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

export default function ProductFormModal({ isOpen, onClose }: ProductFormModalProps) {
  return isOpen ? <ProductFormContent onClose={onClose} /> : null
}
