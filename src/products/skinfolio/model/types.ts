export type Champion = { id: number; name: string; alias: string };
export type Chroma = { id: number; name: string; colors: string[]; image: string | null };
export type Skin = {
  id: number;
  championId: number;
  name: string;
  rarity: string;
  isLegacy: boolean;
  image: string | null;
  splash: string | null;
  chromaTotal: number;
  chromas: Chroma[];
  skinLines: number[];
};

export type Catalog = {
  champions: Champion[];
  championById: Map<number, Champion>;
  skinsByChampion: Map<number, Skin[]>;
  skinById: Map<number, Skin>;
  chromaById: Map<number, { skin: Skin; chroma: Chroma }>;
  totals: { skins: number };
};

export type Ownership = {
  source: string;
  profile: Record<string, unknown> | null;
  ownedSkinIds: Set<number>;
  ownedChromaIds: Set<number>;
  chromasOwned: number;
  chromasBySkin: Map<number, number>;
  masteryByChampion: Map<number, { points: number; level?: number }>;
  lastSyncAt: string | null;
  loot: unknown;
  wallet: unknown;
  flair: unknown;
  collectionValueRp: number;
  pricedOwnedCount: number;
  offers: unknown[];
  matches: unknown[];
  cosmetics: { wards: Set<number>; emotes: Set<number>; icons: Set<number> };
  events: unknown[];
  syncHistory: unknown[];
};

export type CollectionMode = 'skins' | 'chromas';
export type CollectionView = 'all' | 'owned' | 'missing';
export type CollectionSort = 'mastery' | 'completion' | 'alpha';
export type SkinSection = { champ: Champion; skins: Skin[]; ownedCount: number; total: number };
export type ChromaSection = { champ: Champion; entries: { skin: Skin; chromas: Chroma[] }[]; ownedCount: number; total: number };
