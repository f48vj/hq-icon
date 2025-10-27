import { NextResponse, type NextRequest } from 'next/server';

import { expandShortUrl, fetchApps } from '@/lib/apple';
import type { Platform } from '@/lib/types';

function parsePlatforms(param: string | null): Platform[] {
  if (!param) {
    return [];
  }
  const values = param
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean) as Platform[];
  const valid: Platform[] = ['iOS', 'macOS', 'watchOS', 'visionOS'];
  return values.filter((value): value is Platform => valid.includes(value as Platform));
}

function sanitiseCountry(input: string | null) {
  if (!input) return 'US';
  const trimmed = input.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(trimmed)) {
    return trimmed;
  }
  return 'US';
}

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query');
  if (!rawQuery) {
    return NextResponse.json({ results: [] });
  }

  let query = rawQuery.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    if (isHttpUrl(query)) {
      query = await expandShortUrl(query);
    }

    const country = sanitiseCountry(searchParams.get('country'));
    const platforms = parsePlatforms(searchParams.get('platforms'));
    const results = await fetchApps(query, country, platforms);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[api/search] Failed to fetch apps', error);
    return NextResponse.json({ results: [], error: 'SEARCH_FAILED' }, { status: 500 });
  }
}
