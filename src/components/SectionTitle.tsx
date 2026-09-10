type SectionTitleProps = {
  id?: string
  title: string
  count?: number
}

const SectionTitle = ({ id, title, count }: SectionTitleProps) => {
  return (
    <header className="mb-6 flex items-start gap-4">
      <span aria-hidden="true" className="mt-1 w-1 self-stretch rounded-full bg-[#F2DAAC]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={id} className="text-2xl leading-tight font-bold tracking-tight text-[#FFF7E8] [overflow-wrap:anywhere] sm:text-3xl">
            {title}
          </h2>
          {count !== undefined && (
            <span className="rounded-full border border-[#F2DAAC]/20 bg-[#F2DAAC]/5 px-3 py-1 text-xs font-bold text-[#F2DAAC]">
              {count} {count === 1 ? 'opção' : 'opções'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default SectionTitle
