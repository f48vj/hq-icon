export type Platform = 'iOS' | 'macOS' | 'watchOS' | 'visionOS';

export interface AppListing {
  trackId: number;
  trackName: string;
  sellerName?: string;
  url: string;
  artworkUrl512: string;
  artworkUrl1024?: string;
  formattedPrice?: string;
  primaryGenreName?: string;
  bundleId?: string;
  kind?: string;
  platforms: Platform[];
}
