import { notFound } from "next/navigation";
import { orderByToken, publicOrder } from "@/lib/shop-orders";
import { OrderReceipt } from "@/components/order-receipt";
import { CheckoutSteps } from "@/components/shop-shell";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sipariş sonucu",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await orderByToken(token);
  if (!order) notFound();
  return (
    <main className="commerce-page shell receipt-page">
      <CheckoutSteps current={3} />
      <OrderReceipt order={publicOrder(order)} success />
    </main>
  );
}
