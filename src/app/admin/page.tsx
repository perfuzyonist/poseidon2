import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getOrders, getProducts } from "@/lib/db";
import Admin from "@/components/admin";
import { isShowcase } from "@/lib/mode";
export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const demo = isShowcase();
  const authenticated = demo || (await isAdmin());
  return (
    <Admin
      demo={demo}
      authenticated={authenticated}
      initialProducts={authenticated ? await getProducts() : []}
      initialOrders={authenticated ? await getOrders() : []}
    />
  );
}
