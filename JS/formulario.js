// @ts-check
/** Serve candidatura.html e inscricao.html; o tipo vem do atributo data-tipo do <body>. */
const tipo = /** @type {"candidatura"|"inscricao"} */ (document.body.dataset.tipo);
const ehCand = tipo === "candidatura";
const alvoId = new URLSearchParams(location.search).get("id") ?? "";
const alvo = /** @type {any} */ (ehCand ? todasBolsas() : todasMentorias()).find((/** @type {any} */ x) => x.id === alvoId);
const pag = $("#page");
const HORARIOS = ["Manhãs", "Tardes", "Noites", "Fins de semana"];
const COMUNS = [["nome", "Nome completo", "text"], ["email", "Email", "email"], ["telefone", "Telefone", "tel"]];
const CAMPOS = ehCand
  ? [...COMUNS, ["curso", "Curso ou formação actual", "text"], ["media", "Média final (0 a 20)", "number"], ["carta", "Porque mereces esta bolsa?", "textarea"]]
  : [...COMUNS, ["objectivo", "O que queres trabalhar com o mentor", "textarea"], ["horario", "Disponibilidade", "select"]];
const voltar = ehCand ? `bolsa.html?id=${encodeURIComponent(alvoId)}` : `mentoria.html?id=${encodeURIComponent(alvoId)}`;
const vazio = (/** @type {string} */ msg) => pag.replaceChildren(h("p", { class: "empty" }, msg, " ", h("a", { class: "link", href: "../index.html" }, "Voltar ao início")));

const existente = alvo && registoDe(tipo, alvo.id);
if (!alvo) vazio("Não encontrei o que procuras neste navegador.");
else if (existente) location.replace(`comprovativo.html?id=${existente.id}`);
else if (ehCand && restam(alvo.prazo) < 0) vazio("As candidaturas a esta bolsa já encerraram.");
else {
  document.title = `${ehCand ? "Candidatura" : "Inscrição"} · Ponte`;
  const campo = (/** @type {string[]} */ [n, l, t]) => h("label", {}, l,
    t === "textarea" ? h("textarea", { name: n, rows: 4, maxlength: 600 })
    : t === "select" ? h("select", { name: n }, HORARIOS.map((o) => h("option", {}, o)))
    : h("input", { name: n, type: t, maxlength: 80, min: t === "number" ? 0 : null, max: t === "number" ? 20 : null, step: t === "number" ? "0.1" : null }));
  const err = h("p", { class: "err", role: "alert" });
  const enviar = h("button", { class: "btn", type: "submit" }, ehCand ? "Submeter candidatura" : "Confirmar inscrição");
  const form = h("form", { class: "formulario", novalidate: "" }, CAMPOS.map(campo),
    h("label", { class: "check" }, h("input", { type: "checkbox", name: "ok" }), "Confirmo que os dados estão correctos"),
    err, h("div", { class: "actions", style: "justify-content:flex-start" }, enviar, h("a", { class: "link", href: voltar }, "Cancelar")));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = /** @type {any} */ (form.elements), v = (/** @type {string} */ n) => f[n].value.trim();
    const media = Number(v("media"));
    const erro = CAMPOS.some(([n]) => !v(n)) ? "Preenche todos os campos."
      : !/^\S+@\S+\.\S+$/.test(v("email")) ? "O email não parece válido."
      : !/^\+?[\d\s]{9,16}$/.test(v("telefone")) ? "Indica um telefone com 9 a 15 dígitos."
      : ehCand && !(media >= 0 && media <= 20) ? "A média deve estar entre 0 e 20."
      : !f.ok.checked ? "Confirma que os dados estão correctos." : "";
    err.textContent = erro;
    if (erro) return;
    enviar.disabled = true; enviar.textContent = "A enviar…";
    const reg = { id: `PNT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, tipo, alvoId: alvo.id, dados: CAMPOS.map(([n, l]) => [l, v(n)]), em: new Date().toISOString() };
    setTimeout(() => { estado.registos.push(reg); guardar(); location.href = `comprovativo.html?id=${reg.id}`; }, 900);
  });

  pag.replaceChildren(
    h("a", { class: "link", href: voltar }, "← Voltar"),
    h("h1", { class: "page-title" }, ehCand ? "Candidatura à bolsa" : "Inscrição na mentoria"),
    h("p", { class: "meta" }, ehCand ? `${alvo.titulo} · ${alvo.entidade}` : `${alvo.nome} · ${alvo.area}`),
    form);
}
