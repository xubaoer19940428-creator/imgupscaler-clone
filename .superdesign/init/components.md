# Shared primitives

## `src/components/ui/badge.tsx`
```tsx
import * as React from 'react'
import { cn } from '@/src/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold tracking-[.14em] text-slate-500', className)} {...props} />
}

```

## `src/components/ui/button.tsx`
```tsx
import * as React from 'react'
import { cn } from '@/src/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50', variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-700', variant === 'outline' && 'border border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50', variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900', variant === 'link' && 'text-blue-600 hover:underline', size === 'sm' && 'px-3 py-2 text-xs', size === 'default' && 'px-4 py-3 text-sm', size === 'lg' && 'px-5 py-3.5 text-base', size === 'icon' && 'h-9 w-9 p-0', className)} {...props} />
}

```

## `src/components/ui/card.tsx`
```tsx
import * as React from 'react'
import { cn } from '@/src/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...props} />
}

```

## `src/components/ui/icons.tsx`
```tsx
type IconName = 'arrow' | 'upload' | 'spark' | 'check' | 'menu' | 'download' | 'lock' | 'chevron' | 'close' | 'flip' | 'rotate' | 'crop' | 'edit' | 'user' | 'credit-card' | 'logout'

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, className }
  if (name === 'arrow') return <svg {...props}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
  if (name === 'upload') return <svg {...props}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/></svg>
  if (name === 'spark') return <svg {...props}><path d="m12 3-1.6 5.4L5 10l5.4 1.6L12 17l1.6-5.4L19 10l-5.4-1.6L12 3Z"/><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z"/></svg>
  if (name === 'check') return <svg {...props}><path d="m5 12 4 4L19 6"/></svg>
  if (name === 'menu') return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  if (name === 'download') return <svg {...props}><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>
  if (name === 'lock') return <svg {...props}><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
  if (name === 'user') return <svg {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
  if (name === 'credit-card') return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
  if (name === 'logout') return <svg {...props}><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
  if (name === 'close') return <svg {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'flip') return <svg {...props}><path d="M4 7h16M4 17h16"/><path d="m8 4-4 3 4 3M16 14l4 3-4 3"/></svg>
  if (name === 'rotate') return <svg {...props}><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 5v5h5"/></svg>
  if (name === 'crop') return <svg {...props}><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>
  if (name === 'edit') return <svg {...props}><path d="m4 16-.8 4.8L8 20l11.3-11.3a2.1 2.1 0 0 0-3-3L4 16Z"/><path d="m14 7 3 3"/></svg>
  return <svg {...props}><path d="m9 18 6-6-6-6"/></svg>
}

```

## `src/components/ui/input.tsx`
```tsx
import * as React from 'react'
import { cn } from '@/src/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn('h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100', className)} {...props} />)
Input.displayName = 'Input'

```

## `src/components/ui/textarea.tsx`
```tsx
import * as React from 'react'
import { cn } from '@/src/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn('w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100', className)} {...props} />)
Textarea.displayName = 'Textarea'

```
