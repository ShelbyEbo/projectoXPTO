// @ts-check
const mentoria = todasMentorias().find((x) => x.id === new URLSearchParams(location.search).get("id"));
const painel = $("#page");

if (!mentoria) {
  painel.replaceChildren(h("p", { class: "empty" }, "Esta mentoria não existe neste navegador. ", h("a", { class: "link", href: "../index.html" }, "Voltar ao início")));
} else {
  const b = todasBolsas().find((x) => x.id === mentoria.bolsaId);
  const reg = registoDe("inscricao", mentoria.id);
  document.title = `Mentoria de ${mentoria.nome} · Ponte`;
  painel.replaceChildren(
    h("a", { class: "link", href: "bolsas.html?tab=mentorias" }, "← Todas as mentorias"),
    h("h1", { class: "page-title" }, `Mentoria com ${mentoria.nome}`),
    h("p", { class: "meta" }, mentoria.area, b ? [" · Acompanha a candidatura a ", h("a", { class: "tl", href: `bolsa.html?id=${encodeURIComponent(b.id)}` }, b.titulo)] : null),
    h("p", { class: "note note--leaf" }, mentoria.oferta),
    h("div", { class: "cta" }, reg
      ? h("a", { class: "btn", href: `comprovativo.html?id=${reg.id}` }, "Ver comprovativo da inscrição")
      : h("a", { class: "btn", href: `inscricao.html?id=${encodeURIComponent(mentoria.id)}` }, "Inscrever-me")),
    h("h2", { class: "sec" }, "Como funciona"),
    h("ol", { class: "steps3" }, ["Preenches a inscrição com o teu objectivo e a tua disponibilidade.", "Recebes o comprovativo com o número de protocolo.", "Contactas o mentor pelo canal que ele indicou."].map((t) => h("li", {}, t)))
  );
}
