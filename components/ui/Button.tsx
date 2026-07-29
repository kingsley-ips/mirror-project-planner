import { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  fullWidth?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:   'bg-[var(--pine)]     text-white  border-[var(--pine)]',
  secondary: 'bg-[var(--bluestem)] text-[var(--text)] border-[var(--bluestem)]',
  outline:   'bg-transparent       text-[var(--pine)] border-[var(--pine)]',
  ghost:     'bg-transparent       text-[var(--pine)] border-transparent',
  danger:    'bg-red-600           text-white  border-red-600',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-3   text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold border-2 transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
