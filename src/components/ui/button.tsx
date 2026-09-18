import * as React from 'react'
import { cn } from '@/src/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50', variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-700', variant === 'outline' && 'border border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50', variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900', variant === 'link' && 'text-blue-600 hover:underline', size === 'sm' && 'px-3 py-2 text-xs', size === 'default' && 'px-4 py-3 text-sm', size === 'lg' && 'px-5 py-3.5 text-base', size === 'icon' && 'h-9 w-9 p-0', className)} {...props} />
}
