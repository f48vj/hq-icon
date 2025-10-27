import type { AppListing, Platform } from '@/lib/types';

const LOOKUP_ENDPOINT = 'https://itunes.apple.com/lookup';
const SEARCH_ENDPOINT = 'https://itunes.apple.com/search';

const DEFAULT_LIMIT = 24;

interface AppleSearchResponse {
  resultCount: number;
  results: AppleRawResult[];
}

interface AppleRawResult {
  trackId: number;
  trackName: string;
  sellerName?: string;
  trackViewUrl: string;
  artworkUrl512: string;
  formattedPrice?: string;
  price?: number;
  currency?: string;
  primaryGenreName?: string;
  bundleId?: string;
  kind?: string;
  features?: string[];
  supportedDevices?: string[];
  supportedPlatforms?: string[];
  platformFeatures?: { name?: string }[];
  deviceFamilies?: number[];
  contentAdvisoryRating?: string;
}

const platformOrder: Platform[] = ['iOS', 'macOS', 'watchOS', 'visionOS'];

function normalisePrice(raw: AppleRawResult): string | undefined {
  if (raw.formattedPrice) {
    return raw.formattedPrice;
  }
  if (typeof raw.price === 'number') {
    if (raw.price === 0) {
      return 'Free';
    }
    return `${raw.currency ?? '$'}${raw.price.toFixed(2)}`;
  }
  return undefined;
}

function detectPlatforms(raw: AppleRawResult): Platform[] {
  const detected = new Set<Platform>();
  const kind = raw.kind?.toLowerCase() ?? '';
  const features = (raw.features ?? []).map((feature) => feature.toLowerCase());
  const supportedDevices = (raw.supportedDevices ?? []).map((device) => device.toLowerCase());
  const supportedPlatforms = (raw.supportedPlatforms ?? []).map((platform) => platform.toLowerCase());
  const platformFeatures = (raw.platformFeatures ?? []).map((feature) => feature.name?.toLowerCase() ?? '');

  if (kind.includes('mac')) {
    detected.add('macOS');
  }

  if (kind.includes('software')) {
    detected.add('iOS');
  }

  const hasWatch =
    features.some((feature) => feature.includes('watch')) ||
    supportedDevices.some((device) => device.includes('watch')) ||
    supportedPlatforms.some((platform) => platform.includes('watch')) ||
    platformFeatures.some((feature) => feature.includes('watch'));

  if (hasWatch) {
    detected.add('watchOS');
  }

  const hasVision =
    features.some((feature) => feature.includes('vision')) ||
    supportedDevices.some((device) => device.includes('vision')) ||
    supportedPlatforms.some((platform) => platform.includes('vision')) ||
    platformFeatures.some((feature) => feature.includes('vision'));

  if (hasVision) {
    detected.add('visionOS');
  }

  return platformOrder.filter((platform) => detected.has(platform));
}

function normaliseResult(raw: AppleRawResult): AppListing | null {
  if (!raw.trackId || !raw.trackName || !raw.artworkUrl512 || !raw.trackViewUrl) {
    return null;
  }

  const platforms = detectPlatforms(raw);

  return {
    trackId: raw.trackId,
    trackName: raw.trackName,
    sellerName: raw.sellerName,
    url: raw.trackViewUrl,
    artworkUrl512: raw.artworkUrl512,
    artworkUrl1024: raw.artworkUrl512?.replace('512x512', '1024x1024'),
    formattedPrice: normalisePrice(raw),
    primaryGenreName: raw.primaryGenreName,
    bundleId: raw.bundleId,
    kind: raw.kind,
    platforms,
  };
}

function isShortLinkHost(hostname: string) {
  return hostname.endsWith('appsto.re') || hostname.endsWith('apple.co');
}

function extractTrackId(input: string): string | null {
  if (/^\d+$/.test(input)) {
    return input;
  }

  try {
    const parsed = new URL(input);
    const idMatch = parsed.pathname.match(/\/id(\d+)/i);
    if (idMatch) {
      return idMatch[1];
    }
  } catch {
    const idMatch = input.match(/id(\d+)/i);
    if (idMatch) {
      return idMatch[1];
    }
  }

  return null;
}

export async function expandShortUrl(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    if (!isShortLinkHost(parsed.hostname)) {
      return url;
    }
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
    });
    return response.url || url;
  } catch {
    return url;
  }
}

async function performRequest(endpoint: string): Promise<AppleRawResult[]> {
  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'HQ-Icon-Next',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Apple API request failed with status ${response.status}`);
  }

  const json = (await response.json()) as AppleSearchResponse;
  return json.results ?? [];
}

async function lookupById(id: string, country: string): Promise<AppListing[]> {
  const url = `${LOOKUP_ENDPOINT}?id=${id}&country=${country}`;
  const results = await performRequest(url);
  const normalised = results
    .map((raw) => normaliseResult(raw))
    .filter((result): result is AppListing => Boolean(result));
  return normalised;
}

async function searchByTerm(term: string, country: string, limit: number): Promise<AppListing[]> {
  const searchLimit = Math.max(limit, DEFAULT_LIMIT);
  const entityRequests = [
    `${SEARCH_ENDPOINT}?term=${encodeURIComponent(term)}&country=${country}&media=software&entity=software&limit=${searchLimit}`,
    `${SEARCH_ENDPOINT}?term=${encodeURIComponent(term)}&country=${country}&media=software&entity=macSoftware&limit=${Math.max(
      Math.floor(searchLimit / 2),
      10,
    )}`,
  ];

  const rawResults = await Promise.all(entityRequests.map((endpoint) => performRequest(endpoint).catch(() => [])));
  const merged = rawResults.flat();
  const byId = new Map<number, AppListing>();

  merged.forEach((raw) => {
    const result = normaliseResult(raw);
    if (!result) {
      return;
    }
    if (!byId.has(result.trackId)) {
      byId.set(result.trackId, result);
    }
  });

  return Array.from(byId.values());
}

export async function fetchApps(query: string, country: string, platforms: Platform[]): Promise<AppListing[]> {
  const id = extractTrackId(query);
  const cleanQuery = query.trim();

  const results = id ? await lookupById(id, country) : await searchByTerm(cleanQuery, country, DEFAULT_LIMIT);

  if (!platforms.length) {
    return results;
  }

  return results.filter((result) => platforms.some((platform) => result.platforms.includes(platform)));
}
