import type { Route } from '@/src/lib/types'

export type FeatureCard = { number: string; title: string; body: string }
export type UseCase = { image: string; beforeImage: string; afterImage: string; title: string; body: string; cta: string }
export type FaqItem = readonly [question: string, answer: string]
type LandingRoute = Exclude<Route, 'pricing'>

export const heroContent: Record<Exclude<Route, 'pricing'>, { eyebrow: string; title: React.ReactNode; description: string }> = {
  home: {
    eyebrow: '在线 AI 图像放大器',
    title: '在线使用 AI 技术对图像进行放大与优化',
    description: 'ImgUpscaler 通过简单的在线工作流程，助您放大低分辨率图像、锐化模糊细节，并生成更清晰的高分辨率视觉效果。可将照片、动漫、产品图片、人像及老照片放大 2 倍或 4 倍，同时保持边缘、纹理和色彩的自然呈现。',
  },
  enhancer: {
    eyebrow: '在线 AI 图像增强器',
    title: '利用人工智能提升图像质量并增强照片清晰度',
    description: '使用 ImgUpscaler 作为在线 AI 图像增强工具，让模糊、噪点、压缩或低分辨率的图像看起来更清晰。锐化图像细节、减少视觉伪影、提升纹理质量，为人像、产品照片、AI 生成的图像、截图、老照片及日常视觉素材呈现更清晰的成像效果。',
  },
  reimagine: {
    eyebrow: '基于提示的创意图像放大器',
    title: '借助 AI、提示词和创意控制，重塑图像',
    description: 'ImgUpscaler Reimagine AI 助您生成更丰富、更清晰、更细腻的图像版本。上传源图像，通过提示词引导生成结果，随后调整“创意”和“相似度强度”参数，以控制 AI 对原始图像的改造程度。',
  },
}

export const featureCards: Record<Exclude<Route, 'pricing'>, FeatureCard[]> = {
  home: [
    ['01', '高级 AI 超分辨率', '利用经过训练的 AI 模型提升图像分辨率，重构更锐利的边缘、更清晰的纹理以及更自然的细节。'],
    ['02', '2倍和4倍图像放大', '为网页素材、产品列表、社交媒体帖子、演示文稿以及可直接打印的导出文件选择合适的放大比例。'],
    ['03', '批量图像放大', '通过更高效的流程批量处理多张图片，而非逐一重复上传和导出步骤。'],
    ['04', '图像增强器工作流程', '使用这款实用的在线优化工具，提升低分辨率照片、动漫插画、人像、电商图片及老照片的画质。'],
    ['05', '以隐私为先的处理', '上传的图片和生成结果会被安全处理，并在24小时内自动删除。'],
    ['06', '可直接用于商业用途的译文', '将放大后的图像用于营销、客户项目、电商商品展示、创意制作以及其他个人或商业项目。'],
  ].map(([number, title, body]) => ({ number, title, body })),
  enhancer: [
    ['01', '锐化模糊图片', '通过恢复边缘清晰度、增强局部对比度以及锐化细节，使模糊或模糊的照片看起来更清晰，同时保持面部、色彩和光线的自然感。'],
    ['02', '在线提升图像质量', '直接在浏览器中提升照片质量。优化低质量图片，适用于社交媒体、网站、演示文稿、印刷、电商商品列表及专业分享。'],
    ['03', '增强图像细节', '恢复细腻纹理、头发、织物、产品边缘、线条以及细微视觉细节，使增强后的图像更清晰、更实用。'],
    ['04', '减少噪点和压缩伪影', '修复截图、旧上传图片、压缩照片以及从社交平台保存的图片中的数字噪点、JPEG伪影、模糊现象和网络压缩损伤。'],
    ['05', '锐化 AI 艺术作品和生成图像', '通过更清晰的纹理、更锐利的细节以及更精致的输出效果，优化并增强来自 OpenAI、GPT Image 2、Midjourney、Flux、Nano Banana、Stable Diffusion、DALL-E 及其他 AI 工具生成的图像。'],
    ['06', '优化人像、产品及艺术作品', '在保留原始风格的同时，通过更清晰的纹理和更高的分辨率，优化人像、产品照片、动漫图像、插画及数字艺术作品。'],
  ].map(([number, title, body]) => ({ number, title, body })),
  reimagine: [
    ['01', '基于提示的重新构想', '请描述您期望的效果方向，例如更清晰的建筑细节、电影风格的人像光影、更丰富的动漫线条，或是更逼真的产品质感。'],
    ['02', '创意控制', '若需稳定且忠于原图的增强效果，请将创意参数调低；若希望 AI 生成更多可见的变化、纹理及新的视觉细节，则可调高该参数。'],
    ['03', '相似度强度', '控制处理后的图像与原始图像的相似程度。相似度越高，越有助于保留原始图像的布局、主体特征及可识别的结构。'],
    ['04', '创意图像增强', '在放大图像的同时添加由 AI 生成的细节，使 Reimagine 适用于概念艺术、插画、室内设计、建筑、人像及视觉实验等领域。'],
    ['05', '人像与细节模型', '根据具体需求选择合适的模型行为，无论是自然的面部美化、更强的细节还原，还是更具创意的诠释。'],
    ['06', '以隐私为先的处理', '上传的文件和生成结果会被安全处理，并在 24 小时内自动删除。'],
  ].map(([number, title, body]) => ({ number, title, body })),
}

export const useCases: Record<Exclude<Route, 'pricing'>, UseCase[]> = {
  home: [
    ['/reference/upscale-image-online.jpeg', '在线将图片进行放大处理，适用于网页、印刷及社交媒体', '将小尺寸、模糊或像素化的图片转换为更清晰的高分辨率图像，适用于网站、缩略图、演示文稿、海报、电商平台及社交媒体帖子。ImgUpscaler 在放大图像尺寸的同时，能比标准缩放方式更好地保留图像的自然质感。', '在线放大图片'],
    ['/reference/batch-upscaler.jpeg', '批量图像放大工具，助力高效生产', '当您需要批量优化产品照片、营销素材、动漫图片或客户文件时，批量放大功能有助于保持工作流程的一致性。减少重复的手动操作，处理更多图片，并更快地生成精美的导出文件。', '探索批量放大功能'],
    ['/reference/enhance-subjects.jpeg', '优化人像、产品、动漫及老照片', '将 ImgUpscaler 作为在线图像增强工具，用于处理人们实际使用的各类视觉素材：个人头像、电商商品图、插画、扫描图片、旅行照片以及需要提升分辨率以获得更佳使用效果的旧照片。', '提升图像质量'],
  ].map(([image, title, body, cta]) => ({ image, beforeImage: image, afterImage: image, title, body, cta })),
  enhancer: [
    ['/reference/upscale-image-online.jpeg', '锐化模糊图像并恢复丢失的细节', '在保持效果自然的同时，增强模糊或低质量的图像。该 AI 图像增强工具可提升边缘清晰度、恢复细腻纹理，并减少模糊、噪点和压缩伪影，使图像看起来更清晰，且不会显得过度处理。', '锐化图像'],
    ['/reference/batch-upscaler.jpeg', '优化低分辨率图片，适用于社交媒体、印刷及电子商务场景', '为社交媒体、演示文稿、印刷材料、壁纸、产品列表及专业分享创建更清晰的高分辨率图像。AI 增强技术在提升图像分辨率的同时增加可用细节，确保在不同输出尺寸下呈现更清晰的视觉效果。', '图像放大与优化'],
    ['/reference/enhance-subjects.jpeg', '优化 AI 艺术作品、人像、截图及产品视觉素材', '该增强工具适用于 AI 生成的图像、人像照片、动漫作品、插画、截图及产品视觉素材。它能锐化纹理、消除伪影、增加图像细节并提升清晰度，同时保留原始的视觉风格。', '优化创意图片'],
  ].map(([image, title, body, cta], index) => ({ image, beforeImage: image, afterImage: ['/reference/enhance-subjects.jpeg', '/reference/upscale-image-online.jpeg', '/reference/anime-upscaler.webp'][index], title, body, cta })),
  reimagine: [
    ['/reference/enhance-subjects.jpeg', '以更丰富的细节重塑建筑与室内设计', '将低分辨率的建筑、室内及室外图像转化为更清晰的视觉效果，增强表面纹理、优化边缘细节并强化空间深度。通过提示词引导材质、光照和氛围，同时利用“相似度强度”功能保留原始结构。', '试用 Reimagine AI'],
    ['/reference/anime-upscaler.webp', '为动漫、插画和 AI 艺术作品增添创意细节', '将 Reimagine AI 用作基于提示词的增强工具，用于优化动漫作品、插画、线稿及 AI 生成的图像。在保持原始风格方向可辨识的同时，增添更丰富的纹理、更清晰的细节以及更精致的完成效果。', '优化动漫插画'],
    ['/reference/upscale-image-online.jpeg', '在保持面部可识别的前提下优化人像', '通过增强清晰度、肌肤细节、发丝质感及优化光线，重塑人像照片，同时利用相似度控制功能确保人物可辨识。本功能特别适用于个人头像、老照片、编辑图片及创意人像照。', '重新构想人像'],
  ].map(([image, title, body, cta], index) => ({ image, beforeImage: image, afterImage: ['/reference/anime-upscaler.webp', '/reference/enhance-subjects.jpeg', '/reference/unnamed.jpg'][index], title, body, cta })),
}

export const featureIntro: Record<Exclude<Route, 'pricing'>, { kicker: string; title: React.ReactNode; description: string }> = {
  home: { kicker: '了解 AI 图像放大如何提升清晰度', title: <>高级 AI 超分辨率，<br /><em>适合真实工作。</em></>, description: 'ImgUpscaler 利用 AI 超分辨率技术将图像放大 2 倍或 4 倍，恢复细节，使视觉素材更易于在实际项目中使用。' },
  enhancer: { kicker: '提升图像质量、锐化细节并消除视觉噪点', title: <>AI 图像增强，<br /><em>真正实现图像修复。</em></>, description: '利用 AI 图像增强技术，无需手动修图即可锐化模糊图像、增加图像细节、减少噪点、消除压缩伪影，并改善低质量图像。' },
  reimagine: { kicker: '一款用于可控图像变换的创新型 AI 图像放大工具', title: <>重新构想 AI，<br /><em>实现创意图像增强。</em></>, description: 'Reimagine AI 不仅用于简单的图像缩放。您可以通过提示词、模型选择、创意程度和相似度强度等参数，在生成过程中添加逼真的细节，同时决定输出结果是忠实于原图，还是探索更具想象力的变体。' },
}

export const workflowSteps = [
  ['步骤 1', '上传 JPG、PNG 或 WebP 格式的图片', '请上传一张需要提升清晰度的低分辨率照片、产品图片、动漫插画、人像、老照片或图形。'],
  ['步骤 2', '选择 2 倍或 4 倍放大', '选择符合您需求的放大倍数。AI 图像放大器在放大图像的同时，还能增强细节、纹理和边缘。'],
  ['步骤 3', '预览、增强和下载', '对比处理前后的效果，如有需要可继续编辑，并下载高分辨率图片，以便发布、分享或进行后续设计工作。'],
] as const

export const routeWorkflow: Record<Exclude<Route, 'pricing'>, { kicker: string; title: React.ReactNode; description: string; steps: readonly (readonly [string, string, string])[] }> = {
  home: {
    kicker: '如何在线放大图片',
    title: <>三步完成<br /><em>清晰输出。</em></>,
    description: '将 ImgUpscaler 作为一款简易的 AI 图像放大工具使用：上传文件，选择放大倍数，预览并下载更清晰的图像。',
    steps: workflowSteps,
  },
  enhancer: {
    kicker: '如何在线提升图像质量',
    title: <>三步完成<br /><em>清晰修复。</em></>,
    description: '使用 ImgUpscaler 锐化图像、提升照片质量，并通过 AI 增强技术生成更清晰的高分辨率图像。',
    steps: [
      ['步骤 1', '上传一张模糊或低质量的图片', '无论您提供的是模糊、压缩、噪点多、低分辨率、老旧还是 AI 生成的图像，本增强工具的工作流程均可胜任。'],
      ['步骤 2', '选择增强输出', '根据您的需求选择合适的输出质量，无论是快速锐化照片、增强图像细节，还是生成更清晰的高分辨率图像用于分享、发布或打印。'],
      ['步骤 3', '预览结果并下载', '对比处理前后的版本，查看恢复的细节、更锐利的边缘和更清晰的纹理，待增强后的图像准备就绪后即可下载。'],
    ],
  },
  reimagine: {
    kicker: '如何在线重塑图像',
    title: <>三步完成<br /><em>创意输出。</em></>,
    description: '若您需要超越基础图像放大功能的更多功能，请使用 Reimagine AI。从一张图片开始，通过提示词引导生成结果，在下载最终输出前，平衡创意与原图相似度。',
    steps: [
      ['步骤 1', '上传您想要重构的图片', '请提供一张人像、产品照片、建筑图像、室内场景、动漫插画、艺术插图、AI 生成的图像，或需要增加细节的老照片。'],
      ['步骤 2', '添加提示并选择转换强度', '编写简短的提示语以确定视觉风格，选择模型行为，并调整“创造力”和“相似度强度”来控制生成的结果应遵循原样还是富有创意。'],
      ['步骤 3', '预览、优化并下载', '查看处理后的图像，如需调整细节与保真度的平衡，可修改相关设置，随后下载增强后的图像用于设计、营销、概念创作或个人用途。'],
    ],
  },
}

export const testimonials = [
  ['Eleonore Lefaix', 'Siecledigital.fr 编辑', 'ImgUpscaler 让图像放大变得简单，并支持批量放大功能，方便用户一次性处理多张图像。'],
  ['Eva Williams', 'Fixthephoto 编辑', '当您需要批量放大多张图片并优化大量视觉素材，且无需重复相同的手动操作时，ImgUpscaler 将大显身手。'],
  ['Matic Broz', '编辑', '图像放大本不该既昂贵又复杂。ImgUpscaler 为用户提供了一种简单直观的在线放大图像的方式。'],
  ['Sravan', 'ProductHunt 用户', 'ImgUpscaler 适用于多种图像类型，无论是风景照、产品照片，还是需要增强细节的老照片，都能表现出色。'],
] as const

const commonFaqs: FaqItem[] = [
  ['什么是 ImgUpscaler？', 'ImgUpscaler 是一款在线 AI 图像放大工具，可帮助您将图像放大并增强画质，实现 2 倍或 4 倍的放大效果。该工具专为照片、动漫插画、产品图片、人像、老照片以及其他需要更高可用分辨率的视觉素材而设计。'],
  ['AI 图像放大工具是如何工作的？', '系统会分析图像中的边缘、纹理和色彩关系，再生成更高分辨率的细节，而不是简单地拉伸像素。当前项目提供浏览器端演示处理，真实模型可接入 adapter。'],
  ['如何在线放大图片？', '上传 JPG、PNG、WebP 或 AVIF，选择放大倍数，等待预览生成，然后下载处理后的 WebP 结果。'],
  ['我能将图片放大到 4K 分辨率吗？', '可以选择 4K 输出；演示层为了浏览器性能将长边限制在 4096px，真实服务端可按模型和额度放宽。'],
  ['图像放大工具与图像增强工具有什么区别？', '放大器重点增加画布尺寸，增强器重点修复锐度、噪点、纹理和色彩，两者可以共用同一套上传与下载工作流。'],
  ['AI 图像增强能修复模糊的图片吗？', '它可以改善轻度模糊、压缩噪点和边缘锯齿，但无法保证从严重失焦或遮挡中恢复真实信息。'],
  ['ImgUpscaler 支持哪些图像格式？', '当前前端接受 JPG、PNG、WebP 和 AVIF，单张图片最大 20MB。'],
  ['我可以一次放大多张图片吗？', '可以。工作区最多加入 12 张图片，处理后支持批量下载每张结果。'],
  ['我上传的图片是私密的吗？', '本前端演示只在浏览器生成预览，不会上传文件。接入后端时应使用短期签名 URL、访问控制和自动清理。'],
  ['上传的图片会保存多长时间？', '演示版本不会保存。生产服务建议设置任务完成后的自动删除策略，例如 24 小时内清理源图和结果。'],
  ['我可以将放大后的图片用于商业用途吗？', '前端不会限制你的导出用途；商业授权、模型输出责任和素材版权应在真实产品条款中明确。'],
  ['哪些图片最适合进行 AI 画质增强？', '低分辨率照片、产品图、头像、动漫插画、扫描图片和轻度压缩的老照片通常更容易获得明显改善。'],
  ['AI 图像增强比普通图像缩放更好吗？', '普通缩放只进行插值，AI 增强会尝试重建细节；实际效果取决于源图质量、模型和目标尺寸。'],
  ['使用 ImgUpscaler 需要安装软件吗？', '不需要。Next.js 前端可直接在浏览器中使用，真实推理服务部署在服务器端。'],
]

export const enhancerFaqs: FaqItem[] = [
  ['什么是 AI 图像增强工具？', 'AI 图像增强工具是一款可自动提升图像质量的在线工具。它能锐化模糊的图像、增强图像细节、减少噪点、消除压缩伪影，并在无需手动编辑的情况下生成更清晰的图像。'],
  ['如何在线提升图像质量？', '上传图片，选择增强输出，预览结果并下载。整个工作流程在浏览器中完成。'],
  ['AI 能让模糊的图片变清晰吗？', 'AI 可以改善轻度模糊、噪点和压缩损伤，但不能保证恢复原本没有捕捉到的真实细节。'],
  ['无需手动编辑，能否提升图像细节？', '可以。增强器会自动处理边缘、纹理、噪点和压缩伪影。'],
  ['图像增强工具和图像放大工具有什么区别？', '增强器侧重清晰度、纹理和噪点；放大器侧重画布尺寸和分辨率。'],
  ['增强器会自动减少模糊和噪点吗？', '演示工作流会生成更清晰的本地预览，真实模型接入后可提供完整去噪能力。'],
  ['该功能是否支持压缩的 JPEG 或网页图片？', '支持 JPG、PNG、WebP 和 AVIF。'],
  ['我可以对 AI 生成的图像进行增强处理吗？', '可以，AI 艺术作品、人像、产品视觉和插画都适合此工作流。'],
  ['我能自然地增强人像效果吗？', '建议使用中等强度并预览对比，避免过度锐化。'],
  ['我可以使用增强器来优化产品照片吗？', '可以，适用于电商商品列表、营销素材和网站图片。'],
  ['增强功能会改变我图片的原始颜色吗？', '演示层只做轻量对比度和饱和度调整，接入模型后应提供颜色保真策略。'],
  ['哪些类型的图片最适合使用此增强工具？', '人像、截图、老照片、产品照片、动漫和低分辨率网页图片。'],
  ['下载前可以预览增强后的图片吗？', '可以，结果会先替换为工作区中的预览，并支持编辑和下载。'],
  ['使用增强器需要具备编辑技能吗？', '不需要，上传、选择输出并下载即可。'],
]

export const reimagineFaqs: FaqItem[] = [
  ['什么是 Reimagine AI？', 'Reimagine AI 是 ImgUpscaler 推出的基于提示词的创意图像放大工具。它能在放大图像的同时，根据提示词、创意设置和相似度强度生成新的细节、纹理和视觉变化。'],
  ['Reimagine AI 与普通的图像放大工具有什么不同？', '普通放大器侧重保留源图风格并提升分辨率；Reimagine AI 还会根据提示词添加新的生成式细节。'],
  ['什么是创意图像放大器？', '它将分辨率增强与生成式人工智能结合，在原图基础上推断新的细节、纹理、图案以及风格改进。'],
  ['提示词如何影响重新构想的结果？', '提示词用于描述光线、材质、风格、细节程度、氛围或主题处理方式。'],
  ['“创意”控件有什么作用？', '创意越高，生成的变化、纹理和新视觉细节越明显；创意越低，结果越接近原图。'],
  ['“相似度强度”功能是什么？', '相似度越高，越有助于保留原始布局、主体特征及可识别结构。'],
  ['为了获得稳定的结果，我应该使用哪些设置？', '将创意设置为中低，并提高相似度强度，适合人像和需要保留构图的图片。'],
  ['在不大幅改变面部特征的前提下，能否重新构思肖像画？', '可以，使用人像模型、较低创意和较高相似度。'],
  ['哪些图像类型最适合使用 Reimagine AI？', '人像、建筑、室内设计、动漫艺术、插画、产品照片和老照片。'],
  ['Reimagine AI 是否是 Magnific 的替代方案？', '它可以作为轻量级的提示引导创意放大工具使用。'],
  ['我可以将 Reimagine AI 生成的内容用于商业用途吗？', '可以，但仍需遵守适用法律及原始图片的相关权利。'],
  ['上传的图片是私密的吗？', '演示版本只在浏览器生成预览；生产服务应使用短期签名 URL 和自动清理。'],
]

export const faqs: Record<Exclude<Route, 'pricing'>, FaqItem[]> = { home: commonFaqs, enhancer: enhancerFaqs, reimagine: reimagineFaqs }

/**
 * English copy for the routes that are currently visible in the product.
 * The hidden enhancer/reimagine implementations intentionally keep their
 * existing source data so restoring a feature flag does not require a data
 * migration. Active routes always read through getLandingContent(), which
 * keeps the locale decision out of the section JSX.
 */
const englishHomeHero: typeof heroContent['home'] = {
  eyebrow: 'Online AI image upscaler',
  title: 'Upscale and enhance images with AI online',
  description: 'ImgUpscaler helps you enlarge low-resolution images, sharpen soft details, and create clearer high-resolution visuals in a simple online workflow. Upscale photos, anime art, product shots, portraits, and old pictures by 2x or 4x while keeping edges, textures, and colors natural.',
}

const englishHomeFeatures: FeatureCard[] = [
  { number: '01', title: 'Advanced AI super resolution', body: 'Use trained AI models to raise image resolution while rebuilding sharper edges, clearer textures, and more natural detail.' },
  { number: '02', title: '2x and 4x image upscaling', body: 'Choose the right output for web assets, product listings, social posts, presentations, and files ready to print.' },
  { number: '03', title: 'Batch image upscaling', body: 'Process multiple images in one efficient workflow instead of repeating the same upload and export steps.' },
  { number: '04', title: 'Practical image enhancement workflow', body: 'Improve low-resolution photos, anime illustrations, portraits, ecommerce images, and old pictures with a focused online tool.' },
  { number: '05', title: 'Privacy-first processing', body: 'Uploaded images and generated results are handled securely and are designed to be removed automatically within 24 hours in production.' },
  { number: '06', title: 'Ready for personal and commercial work', body: 'Use upscaled images for marketing, client projects, ecommerce displays, creative production, and other personal or commercial work.' },
]

const englishHomeUseCases: UseCase[] = [
  { image: '/reference/upscale-image-online.jpeg', beforeImage: '/reference/upscale-image-online.jpeg', afterImage: '/reference/upscale-image-online.jpeg', title: 'Upscale images online for web, print, and social media', body: 'Turn small, blurry, or pixelated images into clearer high-resolution visuals for websites, thumbnails, presentations, posters, ecommerce listings, and social posts. ImgUpscaler preserves a more natural look than standard resizing.', cta: 'Upscale an image' },
  { image: '/reference/batch-upscaler.jpeg', beforeImage: '/reference/batch-upscaler.jpeg', afterImage: '/reference/batch-upscaler.jpeg', title: 'Batch upscaling for a faster production workflow', body: 'When you need to optimize product photos, marketing assets, anime images, or client files, batch upscaling keeps the workflow consistent. Process more images with fewer repetitive actions and export faster.', cta: 'Explore batch upscaling' },
  { image: '/reference/enhance-subjects.jpeg', beforeImage: '/reference/enhance-subjects.jpeg', afterImage: '/reference/enhance-subjects.jpeg', title: 'Improve portraits, products, anime, and old photos', body: 'Use ImgUpscaler for the visual assets people work with every day: profile images, ecommerce photos, illustrations, scans, travel pictures, and older images that need a more usable resolution.', cta: 'Improve image quality' },
]

const englishHomeFeatureIntro = {
  kicker: 'See how AI upscaling improves clarity',
  title: <>Advanced AI super resolution,<br /><em>built for real work.</em></>,
  description: 'ImgUpscaler uses AI super resolution to enlarge images by 2x or 4x, recover useful detail, and make visual assets easier to use in real projects.',
}

const englishHomeWorkflow = {
  kicker: 'How to upscale an image online',
  title: <>Three steps to a<br /><em>clearer result.</em></>,
  description: 'Use ImgUpscaler as a simple AI image upscaler: upload a file, choose the scale, preview the result, and download a clearer image.',
  steps: [
    ['Step 1', 'Upload a JPG, PNG, or WebP image', 'Upload a low-resolution photo, product image, anime illustration, portrait, old photo, or graphic that needs more clarity.'],
    ['Step 2', 'Choose 2x or 4x upscaling', 'Select the scale that fits your use case. The AI upscaler enlarges the image while improving detail, texture, and edges.'],
    ['Step 3', 'Preview and download', 'Compare the before and after result, then download the high-resolution image for publishing, sharing, or further design work.'],
  ] as const,
}

const englishHomeTestimonials = [
  ['Eleonore Lefaix', 'Siecledigital.fr editor', 'ImgUpscaler makes image upscaling simple and supports batch processing, so users can handle several images at once.'],
  ['Eva Williams', 'Fixthephoto editor', 'When you need to upscale multiple images and improve a large set of visual assets without repeating manual steps, ImgUpscaler is a practical choice.'],
  ['Matic Broz', 'Editor', 'Image upscaling should not be expensive or complicated. ImgUpscaler offers a simple and intuitive way to enlarge images online.'],
  ['Sravan', 'Product Hunt user', 'ImgUpscaler works across many image types, from landscapes and product photos to old pictures that need more visible detail.'],
] as const

const englishHomeFaqs: FaqItem[] = [
  ['What is ImgUpscaler?', 'ImgUpscaler is an online AI image upscaler that enlarges images and improves clarity at 2x or 4x. It is designed for photos, anime art, product images, portraits, old pictures, and other visual assets that need a more usable resolution.'],
  ['How does an AI image upscaler work?', 'The system analyzes edges, textures, and color relationships before generating higher-resolution detail instead of simply stretching pixels. This clone currently provides a browser-based demo; a production model can be connected through an adapter.'],
  ['How do I upscale an image online?', 'Upload a JPG, PNG, WebP, or AVIF file, choose the scale, wait for the preview, and download the processed WebP result.'],
  ['Can I upscale an image to 4K?', 'Yes. You can choose a 4K output. The demo limits the long edge to 4096px for browser performance; a production service can apply model and plan limits.'],
  ['What is the difference between upscaling and enhancement?', 'Upscaling focuses on increasing canvas size and resolution. Enhancement focuses on clarity, noise, texture, and color. Both can use the same upload and download workflow.'],
  ['Can AI enhancement fix a blurry image?', 'It can improve mild blur, compression noise, and jagged edges, but it cannot guarantee recovery of information that was never captured or is fully obscured.'],
  ['Which image formats are supported?', 'The frontend accepts JPG, PNG, WebP, and AVIF images up to 20MB per file.'],
  ['Can I upscale multiple images at once?', 'Yes. The workspace accepts up to 12 images and supports downloading each processed result in a batch workflow.'],
  ['Are my uploaded images private?', 'This frontend demo creates previews in the browser and does not upload files. A production integration should use short-lived signed URLs, access controls, and automatic cleanup.'],
  ['How long are uploaded images stored?', 'The demo does not store uploads. A production service should automatically remove source files and results after the task is complete, such as within 24 hours.'],
  ['Can I use the upscaled images commercially?', 'The frontend does not restrict export use. Commercial licensing, model output responsibility, and source-image rights should be defined in the production terms.'],
  ['Which images work best with AI upscaling?', 'Low-resolution photos, product images, portraits, anime art, scans, and lightly compressed old photos often show the clearest improvement.'],
  ['Is AI upscaling better than regular resizing?', 'Regular resizing interpolates existing pixels. AI upscaling attempts to reconstruct detail; the result depends on source quality, the model, and the target size.'],
  ['Do I need to install software?', 'No. The Next.js frontend works in a browser, while a real inference service can run on the server side.'],
]

const englishLandingContent = {
  heroContent: { ...heroContent, home: englishHomeHero },
  featureCards: { ...featureCards, home: englishHomeFeatures },
  useCases: { ...useCases, home: englishHomeUseCases },
  featureIntro: { ...featureIntro, home: englishHomeFeatureIntro },
  routeWorkflow: { ...routeWorkflow, home: englishHomeWorkflow },
  testimonials: englishHomeTestimonials,
  faqs: { ...faqs, home: englishHomeFaqs },
  video: { title: 'See how AI image upscaling improves clarity', description: 'ImgUpscaler uses AI super resolution to enlarge images by 2x or 4x, recover detail, and make visual assets easier to use in real projects. Watch the workflow, then explore the tools built for everyday image enhancement.' },
  useCaseIntro: { kicker: 'AI image upscaling for real creative work', title: <>Prepare clearer assets for<br /><em>web, print, and social media.</em></>, description: 'From quick online upscaling to batch-ready workflows, ImgUpscaler is built for creators, teams, and businesses that need clearer visuals without complicated editing settings.' },
  testimonialIntro: { title: 'What people say about ImgUpscaler', description: 'Creators, editors, marketers, and everyday users rely on ImgUpscaler when they need a practical online upscaler for clearer, more usable visual assets.' },
  faqIntro: { title: 'AI image upscaler FAQs', description: 'Answers about ImgUpscaler, online image upscaling, image enhancement, file privacy, supported formats, and common use cases.' },
}

export type LandingContent = {
  heroContent: Record<LandingRoute, { eyebrow: string; title: React.ReactNode; description: string }>
  featureCards: Record<LandingRoute, FeatureCard[]>
  useCases: Record<LandingRoute, UseCase[]>
  featureIntro: Record<LandingRoute, { kicker: string; title: React.ReactNode; description: string }>
  routeWorkflow: Record<LandingRoute, { kicker: string; title: React.ReactNode; description: string; steps: readonly (readonly [string, string, string])[] }>
  testimonials: ReadonlyArray<readonly [string, string, string]>
  faqs: Record<LandingRoute, FaqItem[]>
  video: { title: string; description: string }
  useCaseIntro: { kicker: string; title: React.ReactNode; description: string }
  testimonialIntro: { title: string; description: string }
  faqIntro: { title: string; description: string }
}

const chineseLandingContent: LandingContent = {
  heroContent,
  featureCards,
  useCases,
  featureIntro,
  routeWorkflow,
  testimonials,
  faqs,
  video: { title: '了解 AI 图像放大如何提升清晰度', description: 'ImgUpscaler 利用 AI 超分辨率技术将图像放大 2 倍或 4 倍，恢复细节，使视觉素材更易于在实际项目中使用。观看操作流程，然后探索专为日常图像增强打造的功能。' },
  useCaseIntro: { kicker: 'AI 图像放大技术，助力真正的创意工作', title: <>为网页、印刷与<br /><em>社交媒体准备清晰素材。</em></>, description: '从快速的在线放大到支持批处理的图像增强，ImgUpscaler 专为需要更清晰视觉效果，却无需复杂编辑设置的创作者、团队和企业而打造。' },
  testimonialIntro: { title: '用户对 ImgUpscaler 的评价', description: '当创作者、编辑、营销人员及普通用户需要一款实用的在线图像放大工具来获得更清晰、更实用的视觉效果时，他们都会依赖 ImgUpscaler。' },
  faqIntro: { title: 'AI图像放大工具常见问题解答', description: '关于 ImgUpscaler、在线图像放大、图像增强、文件隐私、支持格式及最佳使用场景的常见问题解答。' },
}

/** Return the complete copy model for a rendered locale. */
export function getLandingContent(locale: 'zh' | 'en'): LandingContent {
  return locale === 'en' ? englishLandingContent : chineseLandingContent
}
