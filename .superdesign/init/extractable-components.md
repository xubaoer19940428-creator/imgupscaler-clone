# Extractable components
## SiteHeader
- Source: src/components/site/site-header.tsx
- Category: layout
- Description: Shared desktop navigation and mobile menu; logged-out baseline.
- Props: activeItem(string, home), homeHref(string), showAccount(boolean,false).
- Hardcoded: Img.Upscaler wordmark; Chinese tool labels and login; CSS; menu icons.
## SiteFooter
- Source: src/components/site/site-footer.tsx
- Category: layout
- Description: Shared copyright, legal links and language chooser.
- Props: currentLocale(string,zh).
- Hardcoded: wordmark, legal labels and icon paths.
## Button / Card / Input / Textarea
- Source: src/components/ui/
- Category: basic
- Description: simple inline primitives; no draft extraction needed.
