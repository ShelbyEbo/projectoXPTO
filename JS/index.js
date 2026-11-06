// @ts-check
/** Landing: mostra os três próximos prazos abertos, a partir dos mesmos dados da página de bolsas. */
const proximos = todasBolsas().filter((b) => restam(b.prazo) >= 0).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 3);

$("#prazos").replaceChildren(...proximos.map((b, i) => {
  const n = restam(b.prazo), [, mm, dd] = b.prazo.split("-");
  return h("li", { class: "rise", style: `--i:${i + 3}` },
    h("a", { class: "prazo__a", href: `pages/bolsa.html?id=${encodeURIComponent(b.id)}` },
      h("div", { class: `when${n <= 7 ? " when--soon" : ""}`, "aria-hidden": "true" }, h("b", {}, String(+dd)), h("span", {}, MES[+mm - 1])),
      h("div", {}, h("strong", {}, b.titulo), h("span", { class: "meta" }, `${b.pais} · ${prazoTxt(n)}`))));
}));
