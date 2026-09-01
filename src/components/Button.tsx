import type { ButtonHTMLAttributes, CSSProperties } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  backgroundColor?: CSSProperties['backgroundColor']
  textColor?: CSSProperties['color']
  borderColor?: CSSProperties['borderColor']
}

const Button = ({
  backgroundColor,
  textColor,
  borderColor,
  className = '',
  style,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`mx-auto h-12 w-full max-w-[350px] cursor-pointer rounded-lg border-2 px-3 py-2 text-base font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[50px] sm:px-4 sm:text-lg ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        borderColor,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export default Button
