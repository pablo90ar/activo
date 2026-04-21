export const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
