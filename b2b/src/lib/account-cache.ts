import { getAddresses, getFavorites, getOrders, getProfile, type Address, type Favorite, type Order, type Profile } from './account';

type CacheBucket<T> = { data: T | null; promise: Promise<T> | null; ts: number };

const profileCache = new Map<number, CacheBucket<Profile>>();
const addressesCache = new Map<number, CacheBucket<Address[]>>();
const ordersCache = new Map<number, CacheBucket<Order[]>>();
const favoritesCache = new Map<number, CacheBucket<Favorite[]>>();

function ensure<T>(map: Map<number, CacheBucket<T>>, key: number): CacheBucket<T> {
  let b = map.get(key);
  if (!b) {
    b = { data: null, promise: null, ts: 0 };
    map.set(key, b);
  }
  return b;
}

function take<T>(
  map: Map<number, CacheBucket<T>>,
  key: number,
  fetcher: () => Promise<T>,
): { cached: T | null; fresh: Promise<T> } {
  const b = ensure(map, key);
  if (!b.promise) {
    b.promise = fetcher().then((d) => {
      b.data = d;
      b.ts = Date.now();
      b.promise = null;
      return d;
    }).catch((err) => {
      b.promise = null;
      throw err;
    });
  }
  return { cached: b.data, fresh: b.promise };
}

export const accountCache = {
  profile: (userId: number) => take(profileCache, userId, () => getProfile(userId)),
  addresses: (userId: number) => take(addressesCache, userId, () => getAddresses(userId)),
  orders: (userId: number) => take(ordersCache, userId, () => getOrders(userId)),
  favorites: (userId: number) => take(favoritesCache, userId, () => getFavorites(userId)),

  setProfile(userId: number, p: Profile) { ensure(profileCache, userId).data = p; },
  setAddresses(userId: number, a: Address[]) { ensure(addressesCache, userId).data = a; },
  invalidateAddresses(userId: number) {
    const b = ensure(addressesCache, userId); b.data = null; b.ts = 0;
  },
  invalidateOrders(userId: number) {
    const b = ensure(ordersCache, userId); b.data = null; b.ts = 0;
  },
};
