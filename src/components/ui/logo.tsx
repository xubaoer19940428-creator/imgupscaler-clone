import type { FC, SVGProps } from 'react'

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number
  showText?: boolean
  className?: string
}

export const LogoMark: FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Base Container Layer */}
      <rect x="2" y="2" width="32" height="32" rx="8" fill="url(#react_logo_grad_dark)" />
      
      {/* Subtle Inner Border Highlight */}
      <rect x="2.75" y="2.75" width="30.5" height="30.5" rx="7.25" stroke="url(#react_logo_grad_border)" strokeWidth="1.5" />

      {/* Low-res base pixel grid (representing input image) */}
      <rect x="8" y="19" width="4.5" height="4.5" rx="1.2" fill="#8898aa" fillOpacity="0.5" />
      <rect x="13.5" y="19" width="4.5" height="4.5" rx="1.2" fill="#8898aa" fillOpacity="0.8" />
      <rect x="8" y="24.5" width="4.5" height="4.5" rx="1.2" fill="#8898aa" fillOpacity="0.8" />
      <rect x="13.5" y="24.5" width="4.5" height="4.5" rx="1.2" fill="#8898aa" />

      {/* Diagonal Connection Beam */}
      <line x1="16.5" y1="19.5" x2="21" y2="15" stroke="url(#react_logo_grad_accent)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3" />

      {/* High-res AI Clarity / Super-Resolution Star (representing 4K upscale) */}
      <path d="M23.5 7.5 C23.5 11.2 20.2 13.5 17 13.5 C20.2 13.5 23.5 15.8 23.5 19.5 C23.5 15.8 26.8 13.5 30 13.5 C26.8 13.5 23.5 11.2 23.5 7.5 Z" fill="url(#react_logo_grad_sparkle)" />
      
      {/* Micro clarity spark */}
      <circle cx="28" cy="8" r="1" fill="#60a5fa" />

      {/* Gradients */}
      <defs>
        <linearGradient id="react_logo_grad_dark" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a333f" />
          <stop offset="100%" stopColor="#181d24" />
        </linearGradient>
        <linearGradient id="react_logo_grad_border" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="react_logo_grad_sparkle" x1="17" y1="7.5" x2="30" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="react_logo_grad_accent" x1="16.5" y1="19.5" x2="21" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8898aa" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const BrandLogo: FC<{
  size?: number
  className?: string
  textClassName?: string
}> = ({ size = 26, className = '', textClassName = '' }) => {
  return (
    <span className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <LogoMark size={size} />
      <span className={`text-[21px] font-extrabold text-[var(--ink,#252a30)] tracking-[-0.04em] ${textClassName}`}>
        Img<span className="text-[#3b82f6]">.</span><span className="font-semibold text-[var(--ink,#252a30)]">Upscaler</span>
      </span>
    </span>
  )
}
