import { createContext, useContext, useEffect, useState } from "react";
import { PRODUCTS } from "./products.js";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";

const WHATSAPP = "5511900000000"; // troque pelo número da loja
const wa = (lines) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
const money = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const CATS = [["paineis", "Painéis flexíveis"], ["ripados", "Ripados"], ["caibros", "Caibros brise"], ["decks", "Decks"]];

const CartCtx = createContext();
const useCart = () => useContext(CartCtx);
function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(items)); } catch {} }, [items]);
  const add = (slug, qty = 1) => setItems((c) => c.some((i) => i.slug === slug) ? c.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i)) : [...c, { slug, qty }]);
  const setQty = (slug, qty) => setItems((c) => c.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, qty || 1) } : i)));
  const remove = (slug) => setItems((c) => c.filter((i) => i.slug !== slug));
  const clear = () => setItems([]);
  return <CartCtx.Provider value={{ items, add, setQty, remove, clear }}>{children}</CartCtx.Provider>;
}

function texture({ pattern, color }) {
  if (pattern === "marble")
    return `linear-gradient(115deg,transparent 40%,rgba(255,255,255,.55) 41%,transparent 43%),linear-gradient(62deg,transparent 58%,rgba(0,0,0,.22) 59%,transparent 61%),${color}`;
  if (pattern === "slat") return `repeating-linear-gradient(90deg,${color} 0 22px,rgba(0,0,0,.35) 22px 25px)`;
  return `repeating-linear-gradient(90deg,${color} 0 4px,rgba(0,0,0,.09) 4px 7px),${color}`;
}
const Swatch = ({ p, className = "" }) => <div className={`swatch ${className}`} style={{ background: texture(p) }} role="img" aria-label={p.name} />;

function Price({ p }) {
  if (!p.inStock) return <span className="out">Esgotado</span>;
  return p.promo ? <span><s>{money(p.price)}</s> <b>{money(p.promo)}</b></span> : <b>{money(p.price)}</b>;
}

function Card({ p }) {
  return (
    <Link to={`/produto/${p.slug}`} className="card">
      <Swatch p={p} />
      <h3>{p.name}</h3>
      <small>{p.size}</small>
      <Price p={p} />
    </Link>
  );
}

function Header() {
  const nav = useNavigate();
  const { items } = useCart();
  return (
    <header className="top">
      <p className="bar">Entrega para todo o Brasil · parcele em até 10x</p>
      <div className="row">
        <Link to="/" className="logo">veio</Link>
        <nav>
          {CATS.map(([k, v]) => <NavLink key={k} to={`/produtos?categoria=${k}`}>{v}</NavLink>)}
          <NavLink to="/calculadora">Calculadora</NavLink>
          <NavLink to="/contato">Revenda</NavLink>
          <NavLink to="/orcamento">Orçamento ({items.reduce((n, i) => n + i.qty, 0)})</NavLink>
        </nav>
        <form onSubmit={(e) => { e.preventDefault(); nav(`/produtos?q=${encodeURIComponent(e.target.q.value)}`); }}>
          <input name="q" placeholder="Busque no site" aria-label="Buscar produtos" />
        </form>
      </div>
    </header>
  );
}

function Home() {
  const items = PRODUCTS;
  const [i, setI] = useState(0);
  const finishes = (items || []).filter((p) => p.inStock).slice(0, 4);
  const cur = finishes[i];
  return (
    <>
      <section className="hero">
        <div>
          <h1>Troque o acabamento da parede em um dia.</h1>
          <p>Revestimentos flexíveis, ripados e decks que se instalam sem quebra-quebra. Escolha um acabamento e veja como fica.</p>
          <div className="chips">
            {finishes.map((p, k) => <button key={p.slug} aria-pressed={k === i} onClick={() => setI(k)}>{p.name.replace("Revestimento Flexível ", "")}</button>)}
          </div>
          {cur && <Link className="btn" to={`/produto/${cur.slug}`}>Ver {cur.name}</Link>}
        </div>
        {cur ? <Swatch p={cur} className="wall" /> : <div className="swatch wall" />}
      </section>
      <section className="wrap">
        <h2>Mais vendidos</h2>
        <div className="grid">{(items || []).slice(0, 8).map((p) => <Card key={p.slug} p={p} />)}</div>
      </section>
      <section className="wrap split">
        <div><h2>Instalação sem complicação</h2><p>Aplicação limpa e rápida, sem grandes reformas. Use a calculadora para saber quantas peças comprar.</p></div>
        <Link className="btn" to="/calculadora">Calcular unidades</Link>
      </section>
    </>
  );
}

function Catalog() {
  const [sp] = useSearchParams();
  const cat = sp.get("categoria") || "", q = sp.get("q") || "";
  const term = q.toLowerCase();
  const items = PRODUCTS.filter((p) => (!cat || p.category === cat) && p.name.toLowerCase().includes(term));
  return (
    <section className="wrap">
      <h2>{CATS.find(([k]) => k === cat)?.[1] || (q ? `Resultados para “${q}”` : "Todos os produtos")}</h2>
      {items && !items.length && <p>Nenhum produto encontrado. Tente outro termo ou categoria.</p>}
      <div className="grid">{(items || []).map((p) => <Card key={p.slug} p={p} />)}</div>
    </section>
  );
}

function Product() {
  const { slug } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return <p className="wrap err">Produto não encontrado.</p>;
  const msgUrl = wa(["Olá! Gostaria de negociar este produto:", `• ${p.name} (${p.size})`, `Valor anunciado: ${money(p.promo || p.price)}`, "Pode me passar prazo e condições de entrega?"]);
  return (
    <section className="wrap detail">
      <Swatch p={p} className="big" />
      <div>
        <h1>{p.name}</h1>
        <p>{p.size}</p>
        <p className="price"><Price p={p} /></p>
        {p.inStock
          ? <>
              <a className="btn" href={msgUrl}>Pedir pelo WhatsApp</a>{" "}
              <button className="btn alt" onClick={() => { add(p.slug); nav("/orcamento"); }}>Adicionar ao orçamento</button>
            </>
          : <Link className="btn" to="/contato">Avise-me quando chegar</Link>}
      </div>
    </section>
  );
}

function Calculator() {
  const [w, setW] = useState(3), [h, setH] = useState(2.6), [area, setArea] = useState(3.48);
  const units = Math.ceil((w * h * 1.1) / area); // 10% de perda
  return (
    <section className="wrap narrow">
      <h2>Cálculo de unidades</h2>
      <label>Largura da parede (m)<input type="number" min="0" step="0.1" value={w} onChange={(e) => setW(+e.target.value)} /></label>
      <label>Altura (m)<input type="number" min="0" step="0.1" value={h} onChange={(e) => setH(+e.target.value)} /></label>
      <label>Área por peça (m²)<input type="number" min="0.1" step="0.01" value={area} onChange={(e) => setArea(+e.target.value || 1)} /></label>
      <p className="result">{units} {units === 1 ? "peça" : "peças"} <small>já com 10% de margem para cortes</small></p>
    </section>
  );
}

function Contact() {
  const [f, setF] = useState({ name: "", city: "", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const url = wa(["Olá! Tenho interesse em revender os produtos.", f.name && `Nome ou empresa: ${f.name}`, f.city && `Cidade: ${f.city}`, f.message]);
  return (
    <section className="wrap narrow">
      <h2>Revenda e contato</h2>
      <p>Preencha o que quiser e continue a conversa no WhatsApp com tudo já escrito.</p>
      <label>Nome ou empresa<input value={f.name} onChange={set("name")} maxLength={80} /></label>
      <label>Cidade<input value={f.city} onChange={set("city")} maxLength={60} /></label>
      <label>Mensagem<textarea rows="4" value={f.message} onChange={set("message")} maxLength={500} /></label>
      <a className="btn" href={url}>Conversar pelo WhatsApp</a>
    </section>
  );
}

function Cart() {
  const { items, setQty, remove } = useCart();
  const products = PRODUCTS;
  const [info, setInfo] = useState({ name: "", cep: "" });
  const lines = items.map((i) => ({ ...i, p: (products || []).find((p) => p.slug === i.slug) })).filter((l) => l.p);
  const total = lines.reduce((n, l) => n + (l.p.promo || l.p.price) * l.qty, 0);
  const url = wa([
    "Olá! Gostaria de negociar este orçamento:",
    ...lines.map((l) => `• ${l.qty}x ${l.p.name} (${l.p.size}) - ${money(l.p.promo || l.p.price)} cada`),
    `Total estimado: ${money(total)}`,
    info.name && `Nome: ${info.name}`,
    info.cep && `CEP para entrega: ${info.cep}`,
  ]);
  if (!items.length) return <section className="wrap"><h2>Seu orçamento está vazio</h2><p>Adicione produtos para enviar tudo de uma vez ao nosso atendimento.</p><Link className="btn" to="/produtos">Ver produtos</Link></section>;
  return (
    <section className="wrap detail">
      <div>
        <h2>Seu orçamento</h2>
        {lines.map(({ p, qty }) => (
          <div className="line" key={p.slug}>
            <Swatch p={p} className="mini" />
            <div><b>{p.name}</b><br /><small>{money(p.promo || p.price)} cada</small></div>
            <input type="number" min="1" value={qty} aria-label={`Quantidade de ${p.name}`} onChange={(e) => setQty(p.slug, +e.target.value)} />
            <button className="link" onClick={() => remove(p.slug)}>Remover</button>
          </div>
        ))}
        <p className="price">Total estimado: <b>{money(total)}</b></p>
      </div>
      <div>
        <h2>Fale com o atendimento</h2>
        <p>Enviamos a lista acima já escrita na conversa. Frete e condições são combinados por lá.</p>
        <label>Seu nome (opcional)<input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></label>
        <label>CEP de entrega (opcional)<input inputMode="numeric" value={info.cep} onChange={(e) => setInfo({ ...info, cep: e.target.value })} /></label>
        <a className="btn" href={url}>Negociar pelo WhatsApp</a>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Catalog />} />
          <Route path="/produto/:slug" element={<Product />} />
          <Route path="/calculadora" element={<Calculator />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/orcamento" element={<Cart />} />
          <Route path="*" element={<p className="wrap">Página não encontrada.</p>} />
        </Routes>
      </main>
      <footer className="foot"><span>veio · Seg a sex 10h–19h, sáb 10h–14h</span><a href={`https://wa.me/${WHATSAPP}`}>WhatsApp</a></footer>
    </CartProvider>
  );
}
