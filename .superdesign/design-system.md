# Image studio redesign
Product: AI image upscaling, enhancement and reimagination. Existing functional Next.js app with uploads up to20 files, 2K/4K output on home,1K/2K/4K enhancer, prompt-based reimagine, real auth, pricing and multilingual SEO. Chinese is review language; all13 locales and RTL must work.
## Current baseline (reproduction only)
White #fff, ink #090b10, muted #6b7280, borders #e5e7eb, blue #1b61c9/#294eff. Plus Jakarta Sans font.64px nav; centered headline, large dashed upload panel, alternating use cases. Preserve this only when generating the baseline.
## Requested replacement direction
Refined neutral imaging workspace. User rejected moss/lime as AI-template-like, then requested richer color than flat grayscale. Current palette: warm white #fffefb, canvas #f7f6f2, ink #252a30, muted #6b6b66, border #e2dfd8, deep ink-blue actions #293b50, hover #3b5067, warm gray sections #f0eee8. Selected navigation uses #eaeef2; featured pricing uses #f0f2f4 with #a8b3bf border. No neon accents or gradients. Headline remains ink; color is restrained to actions and selected states. White compare handles with dark arrows and outlined header login. Instrument Sans with system CJK fallbacks. Preserve the moderate corner refinement below. Functional status colors and content imagery retain their meaning.
## Layout direction
Editorial imaging desk: asymmetrical headline with upload panel and large before-after artwork immediately visible; clear tool navigation. Lower page has image contact sheets, numbered workflow, concise capabilities and FAQ in a split layout. Original layout rather than recolor. Maintain usable upload/drag drop, queue, controls, compare slider, login, language nav. Avoid fake counters, fabricated testimonials or success guarantees. Do not invent new brand identity; Img.Upscaler is temporary current product name pending user naming decision.
## Motion and access
Subtle150–220ms hover/focus, one restrained entrance; respect reduced motion. Visible focus,44px controls, adequate contrast. Mobile stack preserves upload priority. Semantic H1/H2, canonical/alternate/schema and image optimization must remain in implementation.

## Implementation checkpoint
The local warm neutral / ink-blue palette supersedes remote draft v3. Remote draft is historical and has not been refreshed for this CSS correction. Use src/styles/11-studio.css as the current visual source.

## Corner refinement
Use moderate rounding: 20px workbench/dialogs (14px mobile workbench), 16px plan/account panels, 12px image and upload surfaces, 10px buttons and inputs. Keep editorial text sections and dividing rules unboxed.
