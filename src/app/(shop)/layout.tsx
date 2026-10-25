import { getProducts } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ShopProvider } from "@/components/shop-provider";
import { ShopShell } from "@/components/shop-shell";
import { isShowcase } from "@/lib/mode";
export const dynamic = "force-dynamic";
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopProvider
      demo={isShowcase()}
      initialProducts={await getProducts()}
      initialSettings={await getSettings()}
    >
      <ShopShell>{children}</ShopShell>
    </ShopProvider>
  );
}
