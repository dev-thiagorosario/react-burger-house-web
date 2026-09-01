import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-lg bg-white px-4 text-base text-[#30323d] outline-none transition-shadow placeholder:text-[#4a4c55] focus:ring-2 focus:ring-[#d9290f] sm:h-[50px] ${className}`}
    />
  )
}

export default Input
