import type { Product, CartItem, CheckoutInput } from "./types";
import { categories } from "./types";
const str = (v: unknown, max: number) =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
export function validProduct(p: Product) {
  return (
    p &&
    str(p.id, 100) &&
    /^[a-zA-Z0-9-]+$/.test(p.id) &&
    str(p.name, 150) &&
    categories.slice(1).includes(p.category as never) &&
    Number.isFinite(p.price) &&
    p.price > 0 &&
    p.price <= 10000000 &&
    (p.oldPrice === null ||
      (Number.isFinite(p.oldPrice) && p.oldPrice > p.price)) &&
    Number.isInteger(p.stock) &&
    p.stock >= 0 &&
    p.stock <= 100000 &&
    str(p.description, 3000) &&
    typeof p.badge === "string" &&
    p.badge.length <= 40 &&
    typeof p.featured === "boolean" &&
    str(p.image, 2000) &&
    (/^https:\/\//.test(p.image) ||
      /^\/images\/[\w.-]+$/.test(p.image) ||
      /^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(p.image))
  );
}
export function validCheckout(p: CheckoutInput) {
  return (
    validOrder(p) &&
    ["bank", "online"].includes(p.paymentMethod) &&
    ["shipping", "pickup"].includes(p.deliveryMethod) &&
    ["individual", "business"].includes(p.billingType) &&
    typeof p.city === "string" &&
    p.city.length <= 80 &&
    typeof p.district === "string" &&
    p.district.length <= 100 &&
    typeof p.postalCode === "string" &&
    p.postalCode.length <= 10 &&
    (p.deliveryMethod === "pickup" ||
      (str(p.city, 80) &&
        str(p.district, 100) &&
        p.address.trim().length >= 10 &&
        (!p.postalCode || /^\d{5}$/.test(p.postalCode)))) &&
    ["companyName", "taxOffice", "taxNumber"].every(
      (k) =>
        typeof p[k as keyof CheckoutInput] === "string" &&
        (p[k as keyof CheckoutInput] as string).length <= 150,
    ) &&
    (p.billingType === "individual" ||
      (str(p.companyName, 150) &&
        str(p.taxOffice, 150) &&
        /^\d{10,11}$/.test(p.taxNumber))) &&
    typeof p.idempotencyKey === "string" &&
    /^[\da-f-]{36}$/i.test(p.idempotencyKey) &&
    p.consent === true
  );
}
export function validOrder(p: {
  customer: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  items: CartItem[];
}) {
  return (
    p &&
    str(p.customer, 120) &&
    str(p.email, 200) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) &&
    str(p.phone, 25) &&
    /^[+\d\s()-]{10,25}$/.test(p.phone) &&
    str(p.address, 600) &&
    typeof p.note === "string" &&
    p.note.length <= 1000 &&
    Array.isArray(p.items) &&
    p.items.length > 0 &&
    p.items.length <= 50 &&
    p.items.every(
      (i) =>
        i &&
        str(i.id, 100) &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0 &&
        i.quantity <= 100,
    )
  );
}
