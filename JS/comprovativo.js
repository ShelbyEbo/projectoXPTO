// @ts-check
const registo = estado.registos.find((r) => r.id === new URLSearchParams(location.search).get("id"));
const folha = $("#page");

if (!registo) {
  folha.replaceChildren(h("p", { class: "empty" }, "Comprovativo não encontrado neste navegador. ", h("a", { class: "link", href: "minhas.html" }, "Ver o meu painel")));
} else {
  const ehCand = registo.tipo === "candidatura";
  const alvo = /** @type {any} */ (ehCand ? todasBolsas() : todasMentorias()).find((/** @type {any} */ x) => x.id === registo.alvoId);
  const bolsa = !ehCand && alvo ? todasBolsas().find((b) => b.id === alvo.bolsaId) : undefined;
  const referente = alvo ? (ehCand ? alvo.titulo : `Mentoria com ${alvo.nome}`) : "Publicação removida";
  const linhas = [["Referente a", referente], ["Submetido em", new Date(registo.em).toLocaleString("pt-PT")], ...registo.dados];
  document.title = `Comprovativo ${registo.id} · Ponte`;
  folha.replaceChildren(
    h("article", { class: "recibo" },
      h("span", { class: "selo" }, ehCand ? "Em análise" : "Confirmada"),
      h("h1", { class: "page-title" }, ehCand ? "Comprovativo de candidatura" : "Comprovativo de inscrição"),
      h("p", { class: "meta" }, "Número de protocolo"),
      h("p", { class: "proto" }, registo.id),
      h("dl", { class: "dados" }, linhas.flatMap(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])),
      h("p", { class: "aviso" }, "Documento gerado numa simulação. Nenhuma informação foi enviada a uma entidade real, por isso este comprovativo não tem valor oficial.")),
    h("div", { class: "cta" },
      h("button", { class: "btn", type: "button", onclick: () => print() }, "Imprimir ou guardar em PDF"),
      !ehCand && alvo ? h("a", { class: "btn btn--ghost", style: "color:var(--ink)", href: contactoHref(alvo, bolsa), target: "_blank", rel: "noopener noreferrer" }, "Falar com o mentor") : null,
      h("a", { class: "link", href: "minhas.html" }, "Ir para o meu painel")));
}
