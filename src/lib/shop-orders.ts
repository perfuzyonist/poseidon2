import { randomBytes } from "node:crypto";
import { db, getProducts, getOrders, saveProduct } from "./db";
import { getSettings } from "./settings";
import { quoteCart } from "./commerce";
import { orderStatuses, type CheckoutInput, type Order } from "./types";
export async function placeOrder(input: CheckoutInput): Promise<Order> {
  return db().transaction(async () => {
    const existing = (await getOrders()).find(
      (o) => o.idempotencyKey === input.idempotencyKey,
    );
    if (existing) {
      if (existing.email.toLowerCase() !== input.email.trim().toLowerCase())
        throw new Error("Sipariş anahtarı geçersiz.");
      return existing;
    }
    const settings = await getSettings();
    if (input.paymentMethod === "bank" && !settings.bankEnabled)
      throw new Error("Havale/EFT ödeme yöntemi henüz yapılandırılmadı.");
    if (input.paymentMethod === "online" && !settings.demoOnlineEnabled)
      throw new Error("Online ödeme şu anda kapalı.");
    const catalog = await getProducts();
    const quote = quoteCart(
      catalog,
      input.items,
      settings,
      input.deliveryMethod,
    );
    const {
      customer,
      email,
      phone,
      address,
      city,
      district,
      postalCode,
      note,
      billingType,
      companyName,
      taxOffice,
      taxNumber,
      paymentMethod,
      deliveryMethod,
      idempotencyKey,
    } = input;
    const order: Order = {
      ...quote,
      customer: customer.trim(),
      email: email.trim().toLowerCase(),
      phone,
      address: address.trim(),
      city,
      district,
      postalCode,
      note,
      billingType,
      companyName,
      taxOffice,
      taxNumber,
      paymentMethod,
      deliveryMethod,
      idempotencyKey,
      id: `PS-${randomBytes(6).toString("hex").toUpperCase()}`,
      accessToken: randomBytes(32).toString("hex"),
      createdAt: new Date().toISOString(),
      consentAt: new Date().toISOString(),
      paymentStatus:
        paymentMethod === "bank"
          ? "Havale bekleniyor"
          : "Demo ödeme tamamlandı",
      status: paymentMethod === "bank" ? "Ödeme bekleniyor" : "Yeni sipariş",
      stockReserved: true,
      ...(paymentMethod === "bank"
        ? {
            bankSnapshot: {
              bankName: settings.bankName,
              accountName: settings.accountName,
              iban: settings.iban,
            },
          }
        : {}),
    };
    for (const line of quote.items) {
      const p = catalog.find((p) => p.id === line.id)!;
      await saveProduct({ ...p, stock: p.stock - line.quantity });
    }
    await db()
      .prepare("INSERT INTO orders (id,data) VALUES (?,?)")
      .run(order.id, JSON.stringify(order));
    return order;
  });
}
export async function updateOrder(
  id: string,
  changes: { status?: string; paymentStatus?: string },
) {
  return db().transaction(async () => {
    const order = (await getOrders()).find((o) => o.id === id);
    if (!order) throw new Error("Sipariş bulunamadı.");
    if (changes.status && !orderStatuses.includes(changes.status))
      throw new Error("Geçersiz sipariş durumu.");
    if (
      order.status === "İptal edildi" &&
      changes.status &&
      changes.status !== "İptal edildi"
    )
      throw new Error(
        "İptal edilmiş sipariş yeniden açılamaz; yeni sipariş oluşturulmalıdır.",
      );
    if (changes.paymentStatus) {
      if (
        order.paymentMethod !== "bank" ||
        order.status === "İptal edildi" ||
        changes.paymentStatus !== "Ödeme onaylandı"
      )
        throw new Error("Bu sipariş için ödeme onaylanamaz.");
      order.paymentStatus = changes.paymentStatus;
      if (order.status === "Ödeme bekleniyor") order.status = "Onaylandı";
    }
    if (
      changes.status &&
      [
        "Hazırlanıyor",
        "Kargoya verildi",
        "Teslim edildi",
        "Tamamlandı",
      ].includes(changes.status) &&
      order.paymentMethod === "bank" &&
      order.paymentStatus !== "Ödeme onaylandı"
    )
      throw new Error(
        "Hazırlamaya başlamadan önce havale ödemesini onaylayın.",
      );
    if (
      changes.status === "Kargoya verildi" &&
      order.deliveryMethod === "pickup"
    )
      throw new Error("Mağazadan teslim siparişi kargoya verilemez.");
    if (
      changes.status === "İptal edildi" &&
      ["Kargoya verildi", "Teslim edildi", "Tamamlandı"].includes(order.status)
    )
      throw new Error(
        "Teslimata çıkan veya teslim edilmiş sipariş için önce mağazada iade sürecini değerlendirin. Doğrudan iptal ile stok geri eklenemez.",
      );
    if (changes.status === "İptal edildi" && order.stockReserved) {
      const catalog = await getProducts();
      for (const line of order.items) {
        const p = catalog.find((p) => p.id === line.id);
        if (p) await saveProduct({ ...p, stock: p.stock + line.quantity });
      }
      order.stockReserved = false;
      if (order.paymentStatus === "Havale bekleniyor")
        order.paymentStatus = "İptal edildi";
    }
    if (changes.status) order.status = changes.status;
    await db()
      .prepare("UPDATE orders SET data=? WHERE id=?")
      .run(JSON.stringify(order), id);
    return order;
  });
}
export function publicOrder(order: Order) {
  const { accessToken, idempotencyKey, ...safe } = order;
  return safe;
}
export async function orderByToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return undefined;
  return (await getOrders()).find((o) => o.accessToken === token);
}
