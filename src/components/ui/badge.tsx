import * as React from 'react'
import { cn } from '@/src/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold tracking-[.14em] text-slate-500', className)} {...props} />
}
