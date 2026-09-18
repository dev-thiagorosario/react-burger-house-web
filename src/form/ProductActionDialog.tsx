import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  title: string
  onClose: () => void
  busy: boolean
  wide?: boolean
  children: ReactNode
}

export default function ProductActionDialog({ title, onClose, busy, wide = false, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected) previousFocus.focus()
      else document.querySelector<HTMLElement>('main')?.focus()
    }
  }, [])

  return (
    <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }} className={`fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] ${wide ? 'max-w-3xl' : 'max-w-md'} overflow-y-auto rounded-2xl border border-[#F2DAAC]/25 bg-[#211E18] p-0 text-[#FFF7E8] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm`}>
      <header className="flex items-center justify-between gap-4 border-b border-[#F2DAAC]/10 px-5 py-4 sm:px-7">
        <h2 id={titleId} className="text-xl font-bold sm:text-2xl">{title}</h2>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Fechar modal" className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#C5BDAF] enabled:cursor-pointer enabled:hover:bg-[#F2DAAC]/10 focus-visible:outline-2 focus-visible:outline-[#F2DAAC] disabled:opacity-50"><X className="size-5" aria-hidden="true" /></button>
      </header>
      {children}
    </dialog>
  )
}
