// @ts-check
/**
 * @typedef {{id:string, titulo:string, entidade:string, pais:string, nivel:string, prazo:string, link:string, exemplo?:boolean}} Bolsa
 * @typedef {{id:string, nome:string, area:string, bolsaId:string, oferta:string, contacto:string, exemplo?:boolean}} Mentoria
 * @typedef {{id:string, tipo:"candidatura"|"inscricao", alvoId:string, dados:[string,string][], em:string}} Registo
 * @typedef {{bolsas:Bolsa[], mentorias:Mentoria[], favs:string[], passos:Record<string, number[]>, registos:Registo[]}} Estado
 */

/** Prefixo das ligações para a pasta pages/, conforme a página onde o script corre. */
const BASE = location.pathname.includes("/pages/") ? "" : "pages/";
const KEY = "ponte:v1";
const dias = (/** @type {number} */ n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

/** Dados de exemplo (instituições fictícias). Os prazos são relativos a hoje. */
const EXEMPLOS = {
  bolsas: /** @type {Bolsa[]} */ ([
    { id: "e1", titulo: "Mestrado em Engenharia de Software", entidade: "Fundação Horizonte", pais: "Portugal", nivel: "Mestrado", prazo: dias(6), link: "#", exemplo: true },
    { id: "e2", titulo: "Licenciatura em Ciências da Computação", entidade: "Instituto Atlântico", pais: "França", nivel: "Licenciatura", prazo: dias(24), link: "#", exemplo: true },
    { id: "e3", titulo: "Doutoramento em Energias Renováveis", entidade: "Programa Savana", pais: "Brasil", nivel: "Doutoramento", prazo: dias(52), link: "#", exemplo: true },
    { id: "e4", titulo: "Mestrado em Dados e Inteligência Artificial", entidade: "Fundação Horizonte", pais: "França", nivel: "Mestrado", prazo: dias(-9), link: "#", exemplo: true },
  ]),
  mentorias: /** @type {Mentoria[]} */ ([
    { id: "m1", nome: "Exemplo A.", area: "Engenharia Informática", bolsaId: "e1", oferta: "Reviso a carta de motivação e simulo a entrevista.", contacto: "244900000000", exemplo: true },
    { id: "m2", nome: "Exemplo B.", area: "Ciências da Computação", bolsaId: "e2", oferta: "Explico o processo de candidatura passo a passo.", contacto: "exemplo@email.com", exemplo: true },
  ]),
};

/** @returns {Estado} */
const carregar = () => {
  try { return { bolsas: [], mentorias: [], favs: [], passos: {}, registos: [], ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; }
  catch { return { bolsas: [], mentorias: [], favs: [], passos: {}, registos: [] }; }
};
const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(estado)); } catch { aviso("Sem espaço para guardar neste navegador."); } };

let estado = carregar();
const todasBolsas = () => [...estado.bolsas, ...EXEMPLOS.bolsas];
const todasMentorias = () => [...estado.mentorias, ...EXEMPLOS.mentorias];

/** Cria elementos sem innerHTML: o texto dos utilizadores nunca é interpretado como HTML. */
const h = (/** @type {string} */ tag, attrs = /** @type {Record<string, any>} */ ({}), ...filhos) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  el.append(...filhos.flat().filter((x) => x != null && x !== false));
  return el;
};
const $ = (/** @type {string} */ s) => /** @type {any} */ (document.querySelector(s));
const norm = (/** @type {string} */ s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const restam = (/** @type {string} */ p) => Math.ceil((new Date(p + "T23:59:59").getTime() - Date.now()) / 864e5);
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const PASSOS = ["Ler os requisitos e a elegibilidade", "Reunir os documentos (certificados, passaporte)", "Escrever a carta de motivação", "Pedir cartas de recomendação", "Submeter antes do prazo"];
const prazoTxt = (/** @type {number} */ n) => (n < 0 ? "Candidaturas encerradas" : n === 0 ? "Último dia para candidatar" : `Faltam ${n} ${n === 1 ? "dia" : "dias"}`);
const feitos = (/** @type {string} */ id) => estado.passos[id] ?? [];

const registoDe = (/** @type {string} */ tipo, /** @type {string} */ alvoId) => estado.registos.find((r) => r.tipo === tipo && r.alvoId === alvoId);

const contactoHref = (/** @type {Mentoria} */ m, /** @type {Bolsa|undefined} */ b) => {
  const msg = `Olá ${m.nome}, inscrevi-me na tua mentoria sobre "${b?.titulo ?? "bolsas"}" na Ponte.`;
  return /^\d{9,15}$/.test(m.contacto)
    ? `https://wa.me/${m.contacto}?text=${encodeURIComponent(msg)}`
    : `mailto:${m.contacto}?subject=${encodeURIComponent("Mentoria Ponte")}&body=${encodeURIComponent(msg)}`;
};

function linhaMentoria(/** @type {Mentoria} */ m, /** @type {number} */ i) {
  const b = todasBolsas().find((x) => x.id === m.bolsaId);
  const href = `${BASE}mentoria.html?id=${encodeURIComponent(m.id)}`;
  return h("li", { class: "row", style: `--i:${i}` },
    h("div", { class: "when", "aria-hidden": "true" }, h("b", {}, m.nome.charAt(0).toUpperCase())),
    h("div", {}, h("h2", {}, h("a", { class: "tl", href }, m.nome)), h("p", { class: "meta" }, `${m.area}${b ? " · " + b.titulo : ""}`), h("p", { class: "note note--leaf" }, m.oferta)),
    h("div", { class: "row__act" }, h("a", { class: "btn", href }, "Ver mentoria")));
}

let tempo = 0;
function aviso(/** @type {string} */ txt) {
  const t = $("#toast"); t.textContent = txt; t.classList.add("on");
  clearTimeout(tempo); tempo = window.setTimeout(() => t.classList.remove("on"), 2600);
}

