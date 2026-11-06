// @ts-check
const raizM = $("#page");

function remover(/** @type {"bolsas"|"mentorias"} */ tipo, /** @type {string} */ id) {
  if (!confirm("Remover esta publicação?")) return;
  estado[tipo] = estado[tipo].filter((x) => x.id !== id);
  if (tipo === "bolsas") { estado.mentorias = estado.mentorias.filter((m) => m.bolsaId !== id); estado.favs = estado.favs.filter((f) => f !== id); delete estado.passos[id]; }
  guardar(); desenhar(); aviso("Removido.");
}

const linha = (/** @type {string} */ titulo, /** @type {string} */ sub, /** @type {any} */ accao, /** @type {string} */ href = "") =>
  h("li", { class: "row row--slim" }, h("div", {}, h("h2", {}, href ? h("a", { class: "tl", href }, titulo) : titulo), h("p", { class: "meta" }, sub)), accao);

function importar(/** @type {File} */ ficheiro) {
  ficheiro.text().then((t) => {
    const d = JSON.parse(t);
    const ok = (/** @type {any} */ x, /** @type {string[]} */ ks) => x && ks.every((k) => typeof x[k] === "string");
    const novas = (d.bolsas ?? []).filter((x) => ok(x, ["id", "titulo", "entidade", "pais", "nivel", "prazo"]) && !estado.bolsas.some((y) => y.id === x.id));
    const novasM = (d.mentorias ?? []).filter((x) => ok(x, ["id", "nome", "bolsaId", "oferta", "contacto"]) && !estado.mentorias.some((y) => y.id === x.id));
    estado.bolsas.push(...novas); estado.mentorias.push(...novasM);
    guardar(); desenhar(); aviso(`Importadas ${novas.length} bolsas e ${novasM.length} mentorias.`);
  }).catch(() => aviso("Ficheiro inválido. Usa um JSON exportado pela Ponte."));
}

function desenhar() {
  const botao = (/** @type {"bolsas"|"mentorias"} */ tipo, /** @type {string} */ id) =>
    h("button", { class: "btn btn--danger btn--sm", type: "button", onclick: () => remover(tipo, id) }, "Remover");
  const publicadas = [
    ...estado.bolsas.map((b) => linha(b.titulo, `Bolsa · ${b.entidade}`, botao("bolsas", b.id))),
    ...estado.mentorias.map((m) => linha(m.nome, `Mentoria · ${m.oferta}`, botao("mentorias", m.id))),
  ];
  const guardadas = todasBolsas().filter((b) => estado.favs.includes(b.id));
  raizM.replaceChildren(
    h("h1", { class: "page-title" }, "O meu painel"),
    h("h2", { class: "sec" }, "Bolsas guardadas"),
    h("ul", { class: "list" }, guardadas.length
      ? guardadas.map((b) => linha(b.titulo, `${prazoTxt(restam(b.prazo))} · ${feitos(b.id).length} de ${PASSOS.length} passos`, null, `bolsa.html?id=${encodeURIComponent(b.id)}`))
      : h("li", { class: "empty" }, "Guarda uma bolsa com a estrela para acompanhares aqui os passos da candidatura.")),
    h("h2", { class: "sec" }, "Candidaturas e inscrições"),
    h("ul", { class: "list" }, estado.registos.length ? estado.registos.map((r) => {
      const alvo = /** @type {any} */ (r.tipo === "candidatura" ? todasBolsas() : todasMentorias()).find((/** @type {any} */ x) => x.id === r.alvoId);
      return linha(alvo?.titulo ?? alvo?.nome ?? "Publicação removida", `${r.tipo === "candidatura" ? "Candidatura" : "Inscrição em mentoria"} · ${r.id}`, null, `comprovativo.html?id=${r.id}`);
    }) : h("li", { class: "empty" }, "Quando te candidatares a uma bolsa ou te inscreveres numa mentoria, o comprovativo fica aqui.")),
    h("h2", { class: "sec" }, "As minhas publicações"),
    h("ul", { class: "list" }, publicadas.length ? publicadas : h("li", { class: "empty" }, "Ainda não publicaste nada neste navegador.")),
    h("h2", { class: "sec" }, "Dados"),
    h("p", { class: "meta" }, "Os dados vivem só neste navegador. Exporta para fazer cópia ou levar para outro dispositivo."),
    h("div", { class: "actions", style: "justify-content:flex-start" },
      h("button", { class: "btn btn--ghost", type: "button", style: "color:var(--ink)", onclick: () => $("#file").click() }, "Importar JSON"),
      h("input", { id: "file", type: "file", accept: "application/json", hidden: "", onchange: (/** @type {any} */ e) => e.target.files[0] && importar(e.target.files[0]) }))
  );
}
desenhar();
