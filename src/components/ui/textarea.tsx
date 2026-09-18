import * as React from 'react'
import { cn } from '@/src/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn('w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100', className)} {...props} />)
Textarea.displayName = 'Textarea'
