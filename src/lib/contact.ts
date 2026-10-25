export const businessAddress =
  "İstiklal Mahallesi, 1156 Sokak, No:26/B, Pamukkale / Denizli";
export const businessPhone = "+90 551 859 49 01";
export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
export function whatsappHref(
  phone: string,
  text = "Merhaba, Poseidon Akvaryum ürünleri hakkında bilgi almak istiyorum.",
) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
export function directionsHref(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Poseidon Akvaryum " + address)}`;
}
export function mapEmbedHref(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=17`;
}
