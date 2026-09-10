import type { ButtonHTMLAttributes } from 'react'

type CategoryTabProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-pressed'
> & {
  label: string
  isSelected: boolean
}

const CategoryTab = ({
  label,
  isSelected,
  className = '',
  type = 'button',
  ...props
}: CategoryTabProps) => {
  return (
    <button
      {...props}
      type={type}
      aria-pressed={isSelected}
      className={`inline-flex min-h-10 min-w-20 shrink-0 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors motion-reduce:transition-none enabled:cursor-pointer enabled:hover:border-[#F2DAAC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2DAAC] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28 ${
        isSelected
          ? 'border-[#F2DAAC] bg-[#F2DAAC] text-[#161410]'
          : 'border-[#F2DAAC]/40 bg-[#161410] text-[#F2DAAC]'
      } ${className}`}
    >
      {label}
    </button>
  )
}

export default CategoryTab
