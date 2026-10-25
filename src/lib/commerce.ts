import type { CartItem, Product, StoreSettings } from "./types";
export function quoteCart(
  products: Product[],
  cart: CartItem[],
  settings: StoreSettings,
  delivery: "shipping" | "pickup",
) {
  const merged = new Map<string, number>();
  for (const i of cart) merged.set(i.id, (merged.get(i.id) || 0) + i.quantity);
  const items = [...merged].map(([id, quantity]) => {
    const p = products.find((p) => p.id === id);
    if (!p || !Number.isInteger(quantity) || quantity < 1 || quantity > p.stock)
      throw new Error(
        "Sepetinizdeki bir ürünün stoğu değişti. Lütfen sepetinizi güncelleyin.",
      );
    return { id: p.id, name: p.name, price: p.price, quantity };
  });
  if (!items.length) throw new Error("Sepetiniz boş.");
  if (
    delivery === "shipping" &&
    (!settings.shippingEnabled ||
      [...merged.keys()].some(
        (id) => products.find((p) => p.id === id)?.category === "Canlılar",
      ))
  )
    throw new Error(
      "Canlı içeren sepetler yalnızca mağazadan teslim alınabilir.",
    );
  if (delivery === "pickup" && !settings.pickupEnabled)
    throw new Error("Mağazadan teslim şu anda kapalı.");
  const subtotal =
    items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) /
    100;
  const shippingFee =
    delivery === "shipping" &&
    (settings.freeShippingThreshold === 0 ||
      subtotal < settings.freeShippingThreshold)
      ? settings.shippingFee
      : 0;
  return {
    items,
    subtotal,
    shippingFee,
    total: (Math.round(subtotal * 100) + Math.round(shippingFee * 100)) / 100,
  };
}
