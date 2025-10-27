'use client';

import { useCallback, useMemo, useState, type FormEvent } from 'react';

import type { IconResolution } from '@/lib/draw-outline';
import type { AppListing, Platform } from '@/lib/types';
import AppResultCard from '@/components/app-result-card';

interface ApiResponse {
  results: AppListing[];
}

const RESOLUTIONS: { value: IconResolution; label: string }[] = [
  { value: 512, label: '512 px' },
  { value: 1024, label: '1024 px' },
];

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'iOS', label: 'iOS' },
  { value: 'macOS', label: 'macOS' },
  { value: 'watchOS', label: 'watchOS' },
  { value: 'visionOS', label: 'visionOS' },
];

const COUNTRY_OPTIONS = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'CN', label: 'China' },
  { code: 'IN', label: 'India' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'ZA', label: 'South Africa' },
];

function countryToFlag(code: string) {
  if (code.length !== 2) return code;
  const points = Array.from(code.toUpperCase()).map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export default function SearchExperience() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('US');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [resolution, setResolution] = useState<IconResolution>(1024);
  const [results, setResults] = useState<AppListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePlatform = useCallback((platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform) ? current.filter((value) => value !== platform) : [...current, platform],
    );
  }, []);

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) {
        setError('Enter an App Store link, ID, or application name.');
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ query: trimmed, country });
        if (platforms.length) {
          params.set('platforms', platforms.join(','));
        }
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Unable to reach Apple services. Please try again.');
        }
        const data = (await response.json()) as ApiResponse;
        setResults(data.results ?? []);
        if ((data.results ?? []).length === 0) {
          setError('No matching apps were found. Try adjusting your country or query.');
        }
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Unexpected error. Please retry in a moment.';
        setError(message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [country, platforms, query],
  );

  const helperText = useMemo(() => {
    if (platforms.length === 0) {
      return 'Leave filters empty to explore every available platform.';
    }
    const formatted = platforms.join(', ');
    return `Showing apps that support: ${formatted}.`;
  }, [platforms]);

  return (
    <section className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-sky-500/10 backdrop-blur"
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <label htmlFor="query" className="text-sm font-semibold text-slate-200">
              Search the App Store
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 focus-within:border-sky-500 focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.35)]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 flex-none text-slate-500"
              >
                <path
                  d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0-2a9 9 0 0 0-5.916 15.79l-2.147 2.146a1 1 0 0 0 1.414 1.414l2.147-2.147A9 9 0 1 0 11 2Z"
                  fill="currentColor"
                />
              </svg>
              <input
                id="query"
                name="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
                placeholder="Try “Things 3”, “watchOS fitness”, or paste an App Store URL"
                autoComplete="off"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Examples: https://apps.apple.com/app/id904237743, 904237743, Monument Valley.
            </p>
          </div>
          <div className="flex w-full flex-col justify-end gap-3 lg:w-auto">
            <button type="submit" className="btn-primary w-full lg:w-auto" disabled={isLoading}>
              {isLoading ? 'Searching…' : 'Search icons'}
            </button>
            <button
              type="button"
              className="btn-secondary w-full lg:w-auto"
              onClick={() => {
                setQuery('');
                setResults([]);
                setError(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-semibold text-slate-200">
              Country storefront
            </label>
            <select
              id="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code} className="bg-slate-900">
                  {countryToFlag(option.code)} {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Supports 20+ storefronts for more localized results.</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Icon resolution</span>
            <div className="flex gap-2">
              {RESOLUTIONS.map((item) => {
                const isActive = resolution === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setResolution(item.value)}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'border-sky-500 bg-sky-500/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]'
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">Toggle between 512px and 1024px PNG exports.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-200">Platform filters</span>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((option) => {
                const isActive = platforms.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => togglePlatform(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'border-sky-500 bg-sky-500/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">{helperText}</p>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Results</h2>
          {results.length > 0 && (
            <span className="text-sm text-slate-400">{results.length} app{results.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-white/5 bg-slate-900/40">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((app) => (
              <AppResultCard key={app.trackId} app={app} resolution={resolution} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center text-slate-400">
            Start searching to fetch icons from the App Store. Support for watchOS and visionOS results is built-in.
          </div>
        )}
      </div>
    </section>
  );
}
