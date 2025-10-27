# HQ Icon

A modern Next.js (App Router) experience for grabbing high-resolution App Store icons across iOS, macOS, watchOS, and visionOS. Built with TypeScript, Tailwind CSS, and pnpm.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to search for any app by name, App Store URL, or ID. Icons can be exported at 512px or 1024px with automatic rounded masking for iOS-style assets.

## Features

- Supports 20+ App Store storefronts
- Filters for iOS, macOS, watchOS, and visionOS apps
- Downloads icons in PNG format at 512px and 1024px
- Short-link expansion for `appsto.re` and `apple.co` URLs
- Built with the latest Next.js 14, React 18, and Tailwind CSS 3

## Deployment

Create a production build with:

```bash
pnpm build
pnpm start
```

## License

MIT
