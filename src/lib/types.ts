export const categories = [
  "Tümü",
  "Canlılar",
  "Akvaryumlar",
  "Ekipmanlar",
  "Yem & Bakım",
  "Bitki & Dekor",
] as const;
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string;
  description: string;
  badge: string;
  featured: boolean;
};
export type CartItem = { id: string; quantity: number };
export type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  total: number;
  status: string;
  createdAt: string;
  accessToken?: string;
  paymentMethod?: "bank" | "online";
  paymentStatus?:
    | "Havale bekleniyor"
    | "Ödeme onaylandı"
    | "Demo ödeme tamamlandı"
    | "İptal edildi";
  deliveryMethod?: "shipping" | "pickup";
  shippingFee?: number;
  subtotal?: number;
  city?: string;
  district?: string;
  postalCode?: string;
  billingType?: "individual" | "business";
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  bankSnapshot?: { bankName: string; accountName: string; iban: string };
  stockReserved?: boolean;
  idempotencyKey?: string;
  consentAt?: string;
  items: { id: string; name: string; price: number; quantity: number }[];
};
export const orderStatuses = [
  "Yeni sipariş",
  "Ödeme bekleniyor",
  "Onaylandı",
  "Yeni talep",
  "İletişime geçildi",
  "Hazırlanıyor",
  "Kargoya verildi",
  "Teslim edildi",
  "Tamamlandı",
  "İptal edildi",
];
export type StoreSettings = {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  bankEnabled: boolean;
  bankName: string;
  accountName: string;
  iban: string;
  demoOnlineEnabled: boolean;
  shippingEnabled: boolean;
  pickupEnabled: boolean;
  shippingFee: number;
  freeShippingThreshold: number;
  campaignEnabled: boolean;
  campaignEyebrow: string;
  campaignTitle: string;
  campaignDescription: string;
  campaignButton: string;
  campaignHref: string;
  campaignImage: string;
};
export type CheckoutInput = {
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  note: string;
  items: CartItem[];
  paymentMethod: "bank" | "online";
  deliveryMethod: "shipping" | "pickup";
  billingType: "individual" | "business";
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  idempotencyKey: string;
  consent: boolean;
};
export const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
