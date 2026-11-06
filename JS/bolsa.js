// @ts-check
const bolsaId = new URLSearchParams(location.search).get("id");
const bolsa = todasBolsas().find((x) => x.id === bolsaId);
const raiz = $("#page");

if (!bolsa) {
  raiz.replaceChildren(h("p", { class: "empty" }, "Esta bolsa não existe neste navegador. ", h("a", { class: "link", href: "bolsas.html" }, "Voltar às bolsas")));
} else {
  const n = restam(bolsa.prazo);
  const mentores = todasMentorias().filter((m) => m.bolsaId === bolsa.id);
  const pct = () => `${(feitos(bolsa.id).length / PASSOS.length) * 100}%`;
  const reg = registoDe("candidatura", bolsa.id);
  const botaoCandidatura = () => reg
    ? h("a", { class: "btn", href: `comprovativo.html?id=${reg.id}` }, "Ver comprovativo da candidatura")
    : n < 0 ? h("span", { class: "btn", "aria-disabled": "true" }, "Candidaturas encerradas")
    : h("a", { class: "btn", href: `candidatura.html?id=${encodeURIComponent(bolsa.id)}` }, "Candidatar-me");
  document.title = `${bolsa.titulo} · Ponte`;
  raiz.replaceChildren(
    h("a", { class: "link", href: "bolsas.html" }, "← Todas as bolsas"),
    h("h1", { class: "page-title" }, bolsa.titulo),
    h("p", { class: "meta" }, `${bolsa.entidade}, ${bolsa.pais} · ${bolsa.nivel}`),
    h("p", { class: `note${n >= 0 && n <= 7 ? " note--soon" : ""}` }, `${prazoTxt(n)} (${bolsa.prazo.split("-").reverse().join("/")})`),
    h("div", { class: "cta" }, botaoCandidatura(), bolsa.link && bolsa.link !== "#" ? h("a", { class: "btn btn--ghost", style: "color:var(--ink)", href: bolsa.link, target: "_blank", rel: "noopener noreferrer" }, "Página oficial") : null),
    h("h2", { class: "sec" }, "Passos da candidatura"),
    h("div", { class: "prog", role: "progressbar", "aria-label": "Progresso" }, h("i", { style: `width:${pct()}` })),
    h("ul", { class: "steps" }, PASSOS.map((p, i) => h("li", {}, h("label", { class: "check" },
      h("input", { type: "checkbox", checked: feitos(bolsa.id).includes(i) ? "" : null, onchange: (/** @type {any} */ e) => {
        const set = new Set(feitos(bolsa.id));
        e.target.checked ? set.add(i) : set.delete(i);
        estado.passos[bolsa.id] = [...set]; guardar();
        $(".prog i").style.width = pct();
      } }), p)))),
    h("h2", { class: "sec" }, "Mentores desta bolsa"),
    h("ul", { class: "list" }, mentores.length ? mentores.map(linhaMentoria) : h("li", { class: "empty" }, "Ainda sem mentores. Publica a tua oferta na página de bolsas e mentorias."))
  );
}
