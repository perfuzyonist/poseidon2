// POS sağlayıcısı seçildiğinde sunucu tarafı adaptör burada uygulanır.
// Kart bilgileri tutulmaz; sağlayıcının güvenli formu kullanılır.
export interface PaymentProvider {
  createCheckout(input: {
    orderId: string;
    amountInKurus: number;
    currency: "TRY";
    callbackUrl: string;
  }): Promise<{ redirectUrl: string; reference: string }>;
  verifyWebhook(
    rawBody: string,
    signature: string,
  ): Promise<{ reference: string; paid: boolean; amountInKurus: number }>;
}
export const paymentMode = "bank-and-online-demo" as const;
