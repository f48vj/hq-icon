'use client';

import { useEffect, useMemo, useState } from 'react';

import drawOutline, { type IconResolution } from '@/lib/draw-outline';
import type { AppListing } from '@/lib/types';

interface AppResultCardProps {
  app: AppListing;
  resolution: IconResolution;
}

function formatFileName(app: AppListing, resolution: IconResolution) {
  const platform = app.platforms.join('-').toLowerCase() || 'app';
  const safeName = app.trackName.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
  return `${safeName}-${platform}-${resolution}x${resolution}.png`;
}

function PlatformBadge({ value }: { value: string }) {
  return <span className="pill bg-slate-800/70 text-slate-200">{value}</span>;
}

export default function AppResultCard({ app, resolution }: AppResultCardProps) {
  const [iconSrc, setIconSrc] = useState<string>(app.artworkUrl512);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    drawOutline(app, resolution)
      .then((base64) => {
        if (!isCancelled) {
          setIconSrc(base64);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIconSrc(resolution === 1024 ? app.artworkUrl1024 ?? app.artworkUrl512 : app.artworkUrl512);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [app, resolution]);

  const downloadName = useMemo(() => formatFileName(app, resolution), [app, resolution]);

  return (
    <article className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-sky-500/10 backdrop-blur transition hover:border-sky-500/60 hover:shadow-sky-400/30">
      <a
        href={iconSrc}
        download={downloadName}
        className="relative block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60"
      >
        <div className="flex aspect-square items-center justify-center">
          {isLoading ? (
            <div className="h-24 w-24 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
          ) : (
            <img
              src={iconSrc}
              alt={app.trackName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-200 opacity-0 transition group-hover:opacity-100">
          Download
        </span>
      </a>
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{app.trackName}</h3>
            {app.formattedPrice && (
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
                {app.formattedPrice}
              </span>
            )}
          </div>
          {app.sellerName && <p className="text-sm text-slate-400">{app.sellerName}</p>}
          {app.primaryGenreName && <p className="text-xs uppercase tracking-wide text-slate-500">{app.primaryGenreName}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {app.platforms.length > 0 ? (
            app.platforms.map((platform) => <PlatformBadge key={platform} value={platform} />)
          ) : (
            <PlatformBadge value="Universal" />
          )}
          <PlatformBadge value={`${resolution} x ${resolution}`} />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <a
          href={app.url}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary w-full sm:w-auto"
        >
          View in App Store
        </a>
        <a href={iconSrc} download={downloadName} className="btn-primary w-full sm:w-auto">
          Download PNG
        </a>
      </div>
    </article>
  );
}
