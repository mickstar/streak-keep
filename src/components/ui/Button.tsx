import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:  'btn-primary font-semibold',
  secondary: 'btn-secondary border',
  ghost:    'btn-ghost',
  danger:   'bg-transparent border border-red-900/60 text-red-400 hover:bg-red-950/40',
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[44px] min-w-[44px] px-5 rounded-xl
        text-sm transition-all active:scale-95
        disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
