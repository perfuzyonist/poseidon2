// A fresh GitHub/Vercel deployment opens as a self-contained customer showcase.
// Permanent database/storage operations are an explicit live-mode opt-in.
export function isShowcase() {
  return process.env.APP_MODE !== "live";
}
export function showcaseWriteResponse() {
  if (isShowcase())
    return Response.json(
      {
        error:
          "Bu bağlantı tanıtım demosudur. Kalıcı kayıt, fotoğraf yükleme ve gerçek sipariş işlemleri kapalıdır.",
      },
      { status: 403 },
    );
}
