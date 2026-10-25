import { getProducts } from "@/lib/db";
import Storefront from "@/components/storefront";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <Storefront products={await getProducts()} />;
}
