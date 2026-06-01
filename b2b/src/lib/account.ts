/*
 * Client-side account API. Calls Django auth endpoints directly
 * since CORS is open and the user identifier is already in our
 * AuthContext / localStorage. Each helper returns parsed JSON or
 * throws on non-2xx responses.
 *
 * Endpoints (all under NEXT_PUBLIC_NEJUM_API_URL):
 *   GET  /authentication/api/get_web_client_profile/{userId}/
 *   POST /authentication/api/update_web_client_profile/{userId}/
 *   GET  /authentication/api/get_client_addresses/{userId}/
 *   POST /authentication/api/add_client_address/{userId}/
 *   POST /authentication/api/set_default_address/{userId}/{addrId}/
 *   DELETE /authentication/api/delete_client_address/{userId}/{addrId}/
 *   GET  /authentication/api/get_user_favorites/{userId}/
 *   POST /authentication/api/toggle_favorite/{userId}/
 *   GET  /authentication/api/get_user_orders/{userId}/
 *   GET  /authentication/api/get_order_detail/{userId}/{orderId}/
 */

const API = () => process.env.NEXT_PUBLIC_NEJUM_API_URL ?? '';

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = data as { error?: string; details?: string };
    throw new Error(e.details ? `${e.error ?? res.status}: ${e.details}` : (e.error ?? `${res.status}`));
  }
  return data as T;
}

export type Profile = {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  birthdate: string;
  addresses: Address[];
  settings: Record<string, unknown>;
};

export type Address = {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type Favorite = {
  id: number;
  product_sku: string;
  created_at: string;
};

export type Order = {
  id: number;
  status: string;
  order_status: string | null;
  order_status_display: string | null;
  order_number: string | null;
  payment_status: string;
  original_currency: string;
  original_price: string | null;
  paid_currency: string;
  paid_amount: string | null;
  items_count: number;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type CreateOrderPayload = {
  web_client_id: number;
  status?: string;
  order_status?: string;
  notes?: string;
  original_currency?: string;
  original_price?: number;
  paid_currency?: string;
  paid_amount?: number;
  exchange_rate?: number;
  delivery_address_title?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_country?: string;
  delivery_phone?: string;
  billing_address_title?: string;
  billing_address?: string;
  billing_city?: string;
  billing_country?: string;
  billing_phone?: string;
  items: Array<{
    product_sku: string;
    product_variant_sku?: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
};

export type CreateOrderResult = {
  success: true;
  order_id: number;
  order_number: string;
};

export type OrderItemDetail = {
  id: number;
  product_sku: string | null;
  product_title: string | null;
  product_image: string | null;
  variant_sku: string | null;
  quantity: string | null;
  price: string | null;
  subtotal: string | null;
  status: string;
};

export type OrderDetail = Order & {
  delivery_address_title: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  delivery_phone: string | null;
  billing_address_title: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_phone: string | null;
  payment_method: string | null;
  card_type: string | null;
  card_last_four: string | null;
  ettn: string | null;
  invoice_date: string | null;
  updated_at: string;
  items: OrderItemDetail[];
  total_value: string;
};

export async function getProfile(userId: number): Promise<Profile> {
  const res = await fetch(`${API()}/authentication/api/get_web_client_profile/${userId}/`, {
    cache: 'no-store',
  });
  return jsonOrThrow<Profile>(res);
}

export async function updateProfile(
  userId: number,
  body: { name?: string; phone?: string; birthdate?: string },
): Promise<void> {
  const res = await fetch(`${API()}/authentication/api/update_web_client_profile/${userId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await jsonOrThrow(res);
}

export async function getAddresses(userId: number): Promise<Address[]> {
  const res = await fetch(`${API()}/authentication/api/get_client_addresses/${userId}/`, {
    cache: 'no-store',
  });
  const data = await jsonOrThrow<{ addresses: Address[] }>(res);
  return data.addresses ?? [];
}

export async function addAddress(
  userId: number,
  body: { title: string; address: string; city: string; country: string; isDefault?: boolean },
): Promise<Address> {
  const res = await fetch(`${API()}/authentication/api/add_client_address/${userId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await jsonOrThrow<{ address: Address }>(res);
  return data.address;
}

export async function setDefaultAddress(userId: number, addressId: string): Promise<void> {
  const res = await fetch(
    `${API()}/authentication/api/set_default_address/${userId}/${addressId}/`,
    { method: 'POST' },
  );
  await jsonOrThrow(res);
}

export async function deleteAddress(userId: number, addressId: string): Promise<void> {
  const res = await fetch(
    `${API()}/authentication/api/delete_client_address/${userId}/${addressId}/`,
    { method: 'DELETE' },
  );
  await jsonOrThrow(res);
}

export async function getFavorites(userId: number): Promise<Favorite[]> {
  const res = await fetch(`${API()}/authentication/api/get_user_favorites/${userId}/`, {
    cache: 'no-store',
  });
  const data = await jsonOrThrow<{ favorites: Favorite[] }>(res);
  return data.favorites ?? [];
}

export async function toggleFavorite(
  userId: number,
  productSku: string,
): Promise<boolean> {
  const res = await fetch(`${API()}/authentication/api/toggle_favorite/${userId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_sku: productSku }),
  });
  const data = await jsonOrThrow<{ is_favorited: boolean }>(res);
  return data.is_favorited;
}

export async function getOrders(userId: number): Promise<Order[]> {
  const res = await fetch(`${API()}/authentication/api/get_user_orders/${userId}/`, {
    cache: 'no-store',
  });
  const data = await jsonOrThrow<{ orders: Order[] }>(res);
  return data.orders ?? [];
}

export async function getOrderDetail(userId: number, orderId: number): Promise<OrderDetail> {
  const res = await fetch(
    `${API()}/authentication/api/get_order_detail/${userId}/${orderId}/`,
    { cache: 'no-store' },
  );
  return jsonOrThrow<OrderDetail>(res);
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const res = await fetch(`${API()}/operating/orders/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return jsonOrThrow<CreateOrderResult>(res);
}

/* ---------- Cart ---------- */

export type DjangoCartItem = {
  id: number;
  product_sku: string;
  variant_sku: string | null;
  quantity: string;
};

export async function getCart(userId: number): Promise<DjangoCartItem[]> {
  const res = await fetch(`${API()}/authentication/api/get_cart/${userId}/`, {
    cache: 'no-store',
  });
  const data = await jsonOrThrow<{ cart_items: DjangoCartItem[] }>(res);
  return data.cart_items ?? [];
}

export async function addCartItem(
  userId: number,
  body: { product_sku: string; variant_sku?: string; quantity: number },
): Promise<DjangoCartItem> {
  const res = await fetch(`${API()}/authentication/api/add_to_cart/${userId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_sku: body.product_sku,
      variant_sku: body.variant_sku ?? '',
      quantity: body.quantity,
    }),
  });
  const data = await jsonOrThrow<{ cart_item: DjangoCartItem }>(res);
  return data.cart_item;
}

export async function updateCartItem(
  userId: number,
  itemId: number,
  quantity: number,
): Promise<void> {
  const res = await fetch(
    `${API()}/authentication/api/update_cart_item/${userId}/${itemId}/`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    },
  );
  await jsonOrThrow(res);
}

export async function removeCartItem(userId: number, itemId: number): Promise<void> {
  const res = await fetch(
    `${API()}/authentication/api/remove_from_cart/${userId}/${itemId}/`,
    { method: 'DELETE' },
  );
  await jsonOrThrow(res);
}

export async function clearCart(userId: number): Promise<void> {
  const res = await fetch(`${API()}/authentication/api/clear_cart/${userId}/`, {
    method: 'DELETE',
  });
  await jsonOrThrow(res);
}
