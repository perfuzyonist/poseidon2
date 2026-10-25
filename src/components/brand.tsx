export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand brand-official ${light ? "brand-light" : ""}`}>
      <img
        src="/images/poseidon-logo.png"
        alt="Denizli Poseidon Akvaryum"
        width={1200}
        height={657}
      />
    </span>
  );
}
