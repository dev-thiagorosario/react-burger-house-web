import { ShoppingBag } from 'lucide-react'

type ProductProps = {
  title: string
  description: string
  image: string
  mobileImage?: string
  imageAlt?: string
  onAddToCart?: () => void
  price: number
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const Product = ({ title, description, image, mobileImage, imageAlt = title, price, onAddToCart }: ProductProps) => {
  return (
    <article className="grid h-full w-full min-w-0 grid-cols-[100px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 rounded-2xl border border-[#F2DAAC]/15 bg-[#211E18] p-4 shadow-lg shadow-black/10 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-x-5 sm:gap-y-3 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-x-6">
      <picture className="block overflow-hidden rounded-xl sm:row-span-3">
        {mobileImage && <source media="(width < 640px)" srcSet={mobileImage} />}
        <img
          loading="lazy"
          decoding="async"
          src={image}
          alt={imageAlt}
          className="block aspect-[100/83] w-full object-cover object-center"
        />
      </picture>

      <h3 className="min-w-0 self-center text-lg leading-snug font-bold text-[#FFF7E8] [overflow-wrap:anywhere] sm:self-end lg:text-xl">
        {title}
      </h3>
      <p className="col-span-2 min-w-0 text-sm leading-relaxed text-[#C5BDAF] [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2">
        {description}
      </p>

      <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-between gap-3 self-end border-t border-[#F2DAAC]/10 pt-4 sm:col-span-1 sm:col-start-2">
        <span className="min-w-0 text-lg font-bold text-[#F2DAAC] tabular-nums [overflow-wrap:anywhere] sm:text-xl">
          {priceFormatter.format(price)}
        </span>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!onAddToCart}
          aria-label={`Adicionar ${title} ao carrinho`}
          title={onAddToCart ? 'Adicionar ao carrinho' : 'Compra indisponível no momento'}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F2DAAC] text-[#161410] enabled:cursor-pointer enabled:hover:bg-[#FFF7E8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </button>
      </div>
    </article>
  )
}

export default Product
