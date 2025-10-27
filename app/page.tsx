import SearchExperience from '@/components/search-experience';

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-16 pt-20 sm:px-10 lg:px-16">
      <header className="space-y-6 text-center sm:text-left">
        <span className="pill mx-auto sm:mx-0">HQ ICON</span>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          High-resolution App Store icons across every platform.
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-slate-300 sm:mx-0">
          Paste an App Store link, ID, or app name to instantly fetch sharp icons for iOS,
          macOS, watchOS, and visionOS in 512px or 1024px. Built with the latest Next.js,
          TypeScript, Tailwind CSS, and powered by pnpm.
        </p>
      </header>
      <SearchExperience />
      <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-500 sm:text-left">
        Crafted with ❤️ for designers and developers. Source available on{' '}
        <a
          href="https://github.com/zhangweijie-cn/hq-icon"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-400 hover:text-sky-300"
        >
          GitHub
        </a>
        .
      </footer>
    </main>
  );
}
