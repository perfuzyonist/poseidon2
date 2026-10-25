"use client";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import type { Product, CartItem, StoreSettings } from "@/lib/types";
type Shop = {
  demo: boolean;
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  ready: boolean;
  count: number;
  add: (p: Product, quantity?: number) => boolean;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  refresh: () => Promise<void>;
  checkoutKey: () => string;
};
const Context = createContext<Shop | null>(null);
export function useShop() {
  const value = useContext(Context);
  if (!value) throw new Error("Mağaza bağlamı bulunamadı.");
  return value;
}
export function ShopProvider({
  children,
  initialProducts,
  initialSettings,
  demo = false,
}: {
  children: ReactNode;
  initialProducts: Product[];
  initialSettings: StoreSettings;
  demo?: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [settings, setSettings] = useState(initialSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setProducts(initialProducts);
    setSettings(initialSettings);
  }, [initialProducts, initialSettings]);
  useEffect(() => {
    const read = () => {
      try {
        const value = JSON.parse(localStorage.getItem("poseidon-cart") || "[]");
        if (Array.isArray(value))
          setCart(
            value.filter(
              (i: CartItem) =>
                i &&
                typeof i.id === "string" &&
                Number.isInteger(i.quantity) &&
                i.quantity > 0 &&
                i.quantity <= 100,
            ),
          );
      } catch {}
    };
    read();
    setReady(true);
    const listener = (e: StorageEvent) => {
      if (e.key === "poseidon-cart") read();
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      const value = JSON.stringify(cart);
      if (localStorage.getItem("poseidon-cart") !== value) {
        localStorage.setItem("poseidon-cart", value);
        sessionStorage.removeItem("poseidon-checkout-key");
      }
    } catch {}
  }, [cart, ready]);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 6500);
      return () => clearTimeout(t);
    }
  }, [message]);
  const refresh = useCallback(async () => {
    const results = await Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);
    if (results.some((r) => !r.ok))
      throw new Error("Güncel mağaza bilgileri alınamadı.");
    const [p, s] = await Promise.all(results.map((r) => r.json()));
    setProducts(p);
    setSettings(s);
  }, []);
  function add(p: Product, quantity = 1) {
    const current = cart.find((i) => i.id === p.id)?.quantity || 0;
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      current + quantity > p.stock
    ) {
      setMessage("Bu ürün için stok sınırına ulaştınız.");
      return false;
    }
    setCart((prev) =>
      prev.some((i) => i.id === p.id)
        ? prev.map((i) =>
            i.id === p.id ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...prev, { id: p.id, quantity }],
    );
    setMessage(`${p.name} sepetinize eklendi.`);
    return true;
  }
  function update(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity > 100) return;
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }
  function checkoutKey() {
    try {
      let key = sessionStorage.getItem("poseidon-checkout-key");
      if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem("poseidon-checkout-key", key);
      }
      return key;
    } catch {
      return crypto.randomUUID();
    }
  }
  return (
    <Context.Provider
      value={{
        demo,
        products,
        settings,
        cart,
        ready,
        count: cart.reduce((n, i) => n + i.quantity, 0),
        add,
        update,
        clear: () => setCart([]),
        refresh,
        checkoutKey,
      }}
    >
      {children}
      {message && (
        <div className="cart-notification" role="status">
          <span className="notice-check">
            <CheckCircle2 size={22} />
          </span>
          <div>
            <b>Sepetiniz güncellendi</b>
            <p>{message}</p>
            <Link href="/sepet" onClick={() => setMessage("")}>
              Sepete git <ArrowRight size={15} />
            </Link>
          </div>
          <button
            className="icon-button"
            aria-label="Bildirimi kapat"
            onClick={() => setMessage("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
