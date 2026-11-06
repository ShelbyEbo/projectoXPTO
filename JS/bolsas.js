// @ts-check
const ui = { tab: new URLSearchParams(location.search).get("tab") === "mentorias" ? "mentorias" : "bolsas", bolsaFoco: "" };

function linhaBolsa(/** @type {Bolsa} */ b, /** @type {number} */ i) {
  const n = restam(b.prazo), fechada = n < 0, urgente = !fechada && n <= 7;
  const [, mm, dd] = b.prazo.split("-");
  const mentores = todasMentorias().filter((m) => m.bolsaId === b.id).length;
  const guardada = estado.favs.includes(b.id);
  return h("li", { class: "row", style: `--i:${i}` },
    h("div", { class: `when${urgente ? " when--soon" : ""}${fechada ? " when--off" : ""}`, "aria-hidden": "true" }, h("b", {}, String(+dd)), h("span", {}, MES[+mm - 1])),
    h("div", {},
      h("h2", {}, h("a", { class: "tl", href: `bolsa.html?id=${encodeURIComponent(b.id)}` }, b.titulo)),
      h("p", { class: "meta" }, `${b.entidade}, ${b.pais} · ${b.nivel}`),
      h("p", { class: `note${urgente ? " note--soon" : ""}` }, fechada ? "Candidaturas encerradas" : n === 0 ? "Último dia para candidatar" : `Faltam ${n} ${n === 1 ? "dia" : "dias"}`)),
    h("div", { class: "row__act" },
      mentores ? h("button", { class: "link", type: "button", onclick: () => { ui.bolsaFoco = b.id; mudarTab("mentorias"); } }, `${mentores} ${mentores === 1 ? "mentor" : "mentores"}`) : null,
      b.link && b.link !== "#" ? h("a", { class: "link", href: b.link, target: "_blank", rel: "noopener noreferrer" }, "Ver bolsa") : null,
      h("button", { class: "star", type: "button", "aria-pressed": String(guardada), "aria-label": guardada ? "Remover das guardadas" : "Guardar bolsa", onclick: () => { estado.favs = guardada ? estado.favs.filter((x) => x !== b.id) : [...estado.favs, b.id]; guardar(); desenhar(false); } }, "★")));
}

function desenhar(animar = true) {
  const q = norm($("#q").value), nivel = $("#nivel").value, soFavs = $("#favs").checked;
  const lista = $("#list");
  const foco = todasBolsas().find((b) => b.id === ui.bolsaFoco);
  const bolsaTab = ui.tab === "bolsas";
  $("#nivel").hidden = $("#favs").parentElement.hidden = !bolsaTab;
  $("#focus").hidden = bolsaTab || !foco;
  $("#focus").replaceChildren(...(foco ? [`Mentores para: ${foco.titulo}`, h("button", { type: "button", onclick: () => { ui.bolsaFoco = ""; desenhar(); } }, "Ver todos")] : []));

  const itens = bolsaTab
    ? todasBolsas().filter((b) => norm(`${b.titulo} ${b.entidade} ${b.pais}`).includes(q) && (!nivel || b.nivel === nivel) && (!soFavs || estado.favs.includes(b.id)))
        .sort((a, b) => (restam(a.prazo) < 0) - (restam(b.prazo) < 0) || a.prazo.localeCompare(b.prazo))
    : todasMentorias().filter((m) => norm(`${m.nome} ${m.area} ${m.oferta}`).includes(q) && (!ui.bolsaFoco || m.bolsaId === ui.bolsaFoco));

  lista.replaceChildren(...(itens.length
    ? itens.map((x, i) => (bolsaTab ? linhaBolsa(/** @type {Bolsa} */ (x), animar ? i : 0) : linhaMentoria(/** @type {Mentoria} */ (x), animar ? i : 0)))
    : [h("li", { class: "empty" }, bolsaTab ? "Nenhuma bolsa com estes filtros. Limpa a pesquisa ou publica uma." : "Ainda ninguém oferece mentoria aqui. Publica a tua oferta.")]));
  if (!animar) lista.querySelectorAll(".row").forEach((r) => /** @type {HTMLElement} */ (r).style.animation = "none");
}

function mudarTab(/** @type {string} */ t) {
  ui.tab = t;
  for (const id of ["bolsas", "mentorias"]) $(`#tab-${id}`).setAttribute("aria-selected", String(id === t));
  desenhar();
}

const dlg = $("#dlg"), form = $("#form");
function prepararForm() {
  const sel = form.elements.bolsaId;
  sel.replaceChildren(...todasBolsas().map((b) => h("option", { value: b.id }, b.titulo)));
  for (const bloco of form.querySelectorAll("[data-for]")) bloco.hidden = bloco.dataset.for !== form.elements.kind.value;
  $("#err").textContent = "";
}

form.elements.kind.addEventListener("change", prepararForm);
$("#publish").addEventListener("click", () => { form.reset(); prepararForm(); dlg.showModal(); });
$("#save").addEventListener("click", (e) => {
  e.preventDefault();
  const f = form.elements, v = (/** @type {string} */ n) => f[n].value.trim();
  const id = crypto.randomUUID();
  if (f.kind.value === "bolsa") {
    const falta = ["titulo", "entidade", "pais", "prazo"].find((n) => !v(n));
    if (falta) return void ($("#err").textContent = "Preenche título, entidade, país e prazo.");
    if (v("link") && !/^https?:\/\//.test(v("link"))) return void ($("#err").textContent = "A ligação deve começar por https://");
    estado.bolsas.unshift({ id, titulo: v("titulo"), entidade: v("entidade"), pais: v("pais"), nivel: v("nivelb"), prazo: v("prazo"), link: v("link") });
    ui.tab = "bolsas";
  } else {
    const contacto = v("contacto").replace(/[\s+]/g, "");
    if (!v("nome") || !v("oferta")) return void ($("#err").textContent = "Preenche o nome e como podes ajudar.");
    if (!/^\d{9,15}$/.test(contacto) && !/^\S+@\S+\.\S+$/.test(contacto)) return void ($("#err").textContent = "Indica um WhatsApp só com números ou um email válido.");
    estado.mentorias.unshift({ id, nome: v("nome"), area: v("area"), bolsaId: v("bolsaId"), oferta: v("oferta"), contacto });
    ui.tab = "mentorias"; ui.bolsaFoco = v("bolsaId");
  }
  guardar(); dlg.close(); mudarTab(ui.tab); aviso("Publicado.");
});

$("#export").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" }));
  const a = h("a", { href: url, download: "ponte-dados.json" }); a.click(); URL.revokeObjectURL(url);
});
for (const id of ["bolsas", "mentorias"]) $(`#tab-${id}`).addEventListener("click", () => mudarTab(id));
for (const s of ["#q", "#nivel", "#favs"]) $(s).addEventListener("input", () => desenhar(false));

mudarTab(ui.tab);
