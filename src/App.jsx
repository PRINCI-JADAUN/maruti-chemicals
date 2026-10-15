import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Box, CheckCircle2, ChevronDown,
  ClipboardList, Clock3, FlaskConical, Headphones, Leaf, Menu, PackageCheck,
  Search, ShieldCheck, ShoppingBag, Sparkles, Truck, UsersRound, X,
} from "lucide-react";
import { categories, company, products } from "../shared/catalogue.js";

const categoryById = new Map(categories.map((category) => [category.id, category]));
const productById = new Map(products.map((product) => [product.id, product]));
const emptyForm = { name: "", companyName: "", email: "", phone: "", industry: "", message: "" };
const revealSelectors = [
  ".section-title",
  "#about > div > div",
  ".industry-tile",
  ".delivery-step",
  ".faq-item",
  ".catalog-product-card",
  ".footer-details",
  ".footer-form-wrap",
  ".category-hero h1",
  "main.category-page > div > h1",
];
const whyReasons = [
  { icon: <BadgeCheck />, title: "Quality you can trust", body: "Products are sourced from reputed manufacturers and selected against customer requirements." },
  { icon: <FlaskConical />, title: "Industry expertise", body: "Experience serving pharmaceutical, food-processing and healthcare businesses." },
  { icon: <Truck />, title: "Reliable supply chain", body: "Order coordination and delivery support for customers across India." },
  { icon: <Headphones />, title: "Customer-first support", body: "Responsive assistance from your first enquiry through after-sales service." },
  { icon: <UsersRound />, title: "Trusted partnerships", body: "Long-term relationships built through transparency, integrity and reliability." },
  { icon: <ShieldCheck />, title: "Regulatory awareness", body: "Product selection considers the expectations of regulated industries; confirm documents for each item." },
];
const deliverySteps = [
  { title: "Understand", text: "We listen to your specifications, industry and compliance needs.", icon: <ClipboardList /> },
  { title: "Select", text: "We identify a suitable product with our manufacturing partners.", icon: <Search /> },
  { title: "Verify", text: "Product and documentation requirements are confirmed with you.", icon: <BadgeCheck /> },
  { title: "Process", text: "We coordinate the order and keep you informed.", icon: <Box /> },
  { title: "Pack", text: "We arrange packaging appropriate to the confirmed product.", icon: <PackageCheck /> },
  { title: "Deliver", text: "We coordinate delivery and stay available for follow-up.", icon: <Truck /> },
  { title: "Support", text: "Our team remains available for after-sales assistance.", icon: <Headphones /> },
];
const faqs = [
  { question: "Which industries do you serve?", answer: "Maruti Chemicals serves pharmaceutical companies, food manufacturers, hospitals, laboratories, healthcare institutions and industrial customers." },
  { question: "Do you offer bulk orders?", answer: "The company website describes bulk supply for industrial and institutional customers. Contact Maruti Chemicals to confirm quantities, availability and lead times." },
  { question: "Are products suitable for regulated industries?", answer: "Suitability depends on the exact product, grade, intended use and supporting documents. Ask Maruti Chemicals for the current specification and quality documents, then confirm with your quality and regulatory teams." },
  { question: "Can you source specialized products?", answer: "Maruti Chemicals says it works with manufacturing partners to assist with specialized product sourcing. Share your specifications and target quantity in an enquiry." },
];

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("maruti-chemicals-cart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((line) => productById.has(line?.productId) &&
      categoryById.has(line?.categoryId) &&
      productById.get(line.productId).categoryIds.includes(line.categoryId) &&
      Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 100000);
  } catch {
    return [];
  }
}

function App() {
  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);

  useEffect(() => {
    localStorage.setItem("maruti-chemicals-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const targets = document.querySelectorAll(revealSelectors.join(","));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    document.documentElement.classList.add("motion-ready");
    targets.forEach((target) => {
      const matchingSelector = revealSelectors.find((selector) => target.matches(selector));
      const siblings = Array.from(target.parentElement.children).filter((element) => element.matches(matchingSelector));
      const siblingIndex = Math.max(siblings.indexOf(target), 0);
      target.dataset.reveal = "true";
      target.style.setProperty("--reveal-delay", `${Math.min(siblingIndex * 65, 390)}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => { target.dataset.revealVisible = "true"; });
      return () => document.documentElement.classList.remove("motion-ready");
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.revealVisible = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, [location.pathname, location.search]);

  function addProduct(productId, categoryId) {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId && line.categoryId === categoryId);
      if (existing) return current;
      return [...current, { productId, categoryId, quantity: 1 }];
    });
  }

  function setQuantity(productId, categoryId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return;
    setCart((current) => current.map((line) =>
      line.productId === productId && line.categoryId === categoryId ? { ...line, quantity } : line,
    ));
  }

  function removeProduct(productId, categoryId) {
    setCart((current) => current.filter((line) => !(line.productId === productId && line.categoryId === categoryId)));
  }

  const lines = useMemo(() => cart.flatMap((line) => {
    const product = productById.get(line.productId);
    const category = categoryById.get(line.categoryId);
    return product && category ? [{ ...line, product, category }] : [];
  }), [cart]);

  return (
    <>
      <SiteHeader itemCount={itemCount} onOpenCart={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage cartLines={lines} onOpenCart={() => setCartOpen(true)} onSent={() => setCart([])} />} />
        <Route path="/industries/:categoryId" element={<IndustryPage onAdd={addProduct} cart={cart} cartLines={lines} onOpenCart={() => setCartOpen(true)} onSent={() => setCart([])} />} />
        <Route path="/search" element={<SearchPage onAdd={addProduct} cart={cart} cartLines={lines} onOpenCart={() => setCartOpen(true)} onSent={() => setCart([])} />} />
        <Route path="/brochure/:productId" element={<BrochurePage />} />
        <Route path="*" element={<HomePage cartLines={lines} onOpenCart={() => setCartOpen(true)} />} />
      </Routes>
      {cartOpen && <CartDrawer lines={lines} onClose={() => setCartOpen(false)} onSetQuantity={setQuantity} onRemove={removeProduct} onEnquire={() => { setCartOpen(false); navigate("/#contact"); }} />}
      {location.hash && <ScrollToContact />}
    </>
  );
}

function ScrollToContact() {
  const location = useLocation();
  useEffect(() => {
    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
    return () => window.clearTimeout(timer);
  }, [location]);
  return null;
}

function SiteHeader({ itemCount, onOpenCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setQuery(searchParams.get("q") || ""), [searchParams]);

  function submitSearch(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/");
    setMenuOpen(false);
  }

  return (
    <header className="site-header sticky top-0 z-40 border-b border-ink/5 bg-cream/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" aria-label="Maruti Chemicals home" className="flex shrink-0 items-center gap-2.5">
          <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-white"><FlaskConical size={21} /></span>
          <span><span className="block font-display text-[15px] font-extrabold leading-tight tracking-tight sm:text-[17px]">Maruti Chemicals</span><span className="hidden text-[8px] font-semibold uppercase tracking-[.15em] text-forest/70 sm:block">Healthcare · Pharma · Food</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-xs font-semibold text-ink/70 xl:flex">
          <Link className="nav-link" to="/">Home</Link><Link className="nav-link" to="/#about">About</Link><Link className="nav-link" to="/#industries">Industries</Link><Link className="nav-link" to="/#delivery">Our process</Link><Link className="nav-link" to="/#contact">Contact</Link>
        </nav>
        <form onSubmit={submitSearch} role="search" className="nav-search ml-auto flex h-10 min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-full border border-ink/10 bg-white/90 px-3 sm:px-4">
          <Search size={16} className="shrink-0 text-ink/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" aria-label="Search products" placeholder="Search products..." className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-ink/40 sm:text-[13px]" />
          <button type="submit" aria-label="Submit product search" className="hidden rounded-full bg-forest px-3 py-1.5 text-[10px] font-bold text-white sm:block">Search</button>
        </form>
        <button type="button" onClick={onOpenCart} className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-semibold transition hover:border-forest/40 hover:bg-sage/40 sm:px-3.5 sm:text-sm" aria-label={`Open enquiry list, ${itemCount} items`}>
          <ShoppingBag size={16} /><span className="hidden sm:inline">Enquiry</span>{itemCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-bold text-white">{itemCount}</span>}
        </button>
        <button type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 xl:hidden" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {menuOpen && <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-3 border-t border-ink/5 px-5 py-4 text-sm font-medium xl:hidden"><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link><Link to="/#about" onClick={() => setMenuOpen(false)}>About us</Link><Link to="/#industries" onClick={() => setMenuOpen(false)}>Industries</Link><Link to="/#delivery" onClick={() => setMenuOpen(false)}>Our process</Link><Link to="/#contact" onClick={() => setMenuOpen(false)}>Contact</Link></nav>}
    </header>
  );
}

function HomePage({ cartLines, onOpenCart, onSent }) {
  const navigate = useNavigate();
  return (
    <main>
      <Hero />
      <AboutSection />
      <section id="industries" className="industry-section scroll-mt-24 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro eyebrow="Industries we serve" title={<>Specialist supply for<br className="hidden sm:block" /> work that matters.</>} copy="Choose your industry to explore a focused product list and request details or a quote from our team." />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{categories.map((category, index) => <IndustryTile key={category.id} category={category} index={index} />)}</div>
        </div>
      </section>
      <DeliverySection />
      <WhySection />
      <FaqSection />
      <SiteFooter cartLines={cartLines} onOpenCart={onOpenCart} onSent={onSent} />
      <button type="button" onClick={() => navigate("/#contact")} className="floating-enquiry"><ShoppingBag size={16} /> Build an enquiry</button>
    </main>
  );
}

function Hero() {
  function moveScene(event) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--pointer-x", `${x * 24}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${y * 20}px`);
  }

  return (
    <section className="hero-live relative isolate overflow-hidden" onPointerMove={moveScene} onPointerLeave={(event) => { event.currentTarget.style.setProperty("--pointer-x", "0px"); event.currentTarget.style.setProperty("--pointer-y", "0px"); }}>
      <div className="hero-atmosphere" aria-hidden="true"><span className="hero-blob hero-blob-a" /><span className="hero-blob hero-blob-b" /><span className="hero-blob hero-blob-c" /><span className="hero-ring hero-ring-a" /><span className="hero-ring hero-ring-b" /><span className="hero-particle particle-a" /><span className="hero-particle particle-b" /><span className="hero-particle particle-c" /><span className="hero-glass-shape" /><span className="hero-powder" /></div>
      <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-14 lg:py-8">
        <div className="max-w-[700px] text-ink">
          <p className="hero-kicker"><span /> Healthcare · Pharmaceutical · Food industries</p>
          <h1 className="mt-7 font-display text-[clamp(2.7rem,7vw,6.3rem)] font-semibold leading-[.99] tracking-[-.07em]">Delivering trusted solutions for <span className="hero-heading-accent">healthier industries.</span></h1>
          <p className="mt-6 max-w-[560px] text-base leading-7 text-ink/75 sm:text-lg">Maruti Chemicals supplies specialized products that help pharmaceutical manufacturers, food processors, hospitals and laboratories support safety, quality and everyday operations.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#industries" className="hero-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">Explore industries <ArrowRight size={16} /></a><a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-forest/30 px-5 py-3 text-sm font-semibold text-forest transition hover:bg-white/60">Talk with our team <ArrowUpRight size={15} /></a></div>
          <p className="mt-8 flex items-center gap-2 text-xs text-ink/55"><span className="hero-live-dot" /> Responsive support from enquiry to delivery · Serving customers across India</p>
        </div>
        <div className="hero-right relative hidden min-h-[430px] lg:block" aria-hidden="true">
          <div className="hero-capsule capsule-one"><span /></div><div className="hero-capsule capsule-two"><span /></div>
          <div className="hero-glass-vial"><i /><b /><em /></div>
          <div className="hero-sample-card sample-card-one"><small>QUALITY</small><b>Thoughtful<br />product sourcing</b><ShieldCheck size={18} /></div>
          <div className="hero-sample-card sample-card-two"><small>BUILT AROUND YOU</small><b>Reliable<br />supply support</b><Sparkles size={17} /></div>
          <div className="hero-orbit-label">MARUTI CHEMICALS <span>·</span> INDIA</div>
        </div>
        <div className="hero-stats grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-2 lg:mt-6">
          <HeroStat value={company.experience} label="Years of industry experience" />
          <HeroStat value="5" label="Sectors served" />
          <HeroStat value={company.customers} label="Customers across India" />
          <HeroStat value={company.productCategories} label="Product categories" />
        </div>
      </div>
      <div className="hero-bottomline"><span>Quality · Reliability · Integrity</span><span>Scroll to explore ↓</span></div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return <div className="hero-stat"><strong>{value}</strong><span>{label}</span></div>;
}

function AboutSection() {
  return <section id="about" className="scroll-mt-24 px-5 py-10 sm:px-8 lg:px-10 lg:py-14"><div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.65fr_1.35fr] md:items-start">
    <div><p className="eyebrow">A little about us</p><h2 className="section-title mt-3">Good supply starts with listening.</h2></div>
    <div className="max-w-[800px]"><p className="text-[15px] leading-7 text-ink/70">Maruti Chemicals works with customers across India to source products for pharmaceutical production, food processing, hospitals, laboratories and healthcare facilities.</p><p className="mt-4 text-[15px] leading-7 text-ink/70">The company highlights quality, timely delivery and responsive support. Share your application and requirements with the team, and they’ll help you explore suitable options.</p><a href="#contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest">Meet your supply partner <ArrowRight size={15} /></a></div>
  </div></section>;
}

function SectionIntro({ eyebrow, title, copy }) {
  return <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2></div><p className="max-w-[470px] text-sm leading-6 text-ink/60">{copy}</p></div>;
}

function IndustryTile({ category, index }) {
  const icons = [<FlaskConical />, <Leaf />, <UsersRound />, <ShieldCheck />];
  return <Link to={`/industries/${category.id}`} className={`industry-tile industry-tile-${index + 1} group`}>
    <span className="industry-tile-number">0{index + 1}</span><span className="industry-tile-icon">{icons[index]}</span>
    <span className="mt-auto block"><strong>{category.name}</strong><span className="mt-2 block text-sm leading-6 text-ink/70">{category.description}</span><span className="industry-tile-link">Explore 10 products <ArrowUpRight size={15} /></span></span>
  </Link>;
}

function DeliverySection() {
  return <section id="delivery" className="delivery-section scroll-mt-24 overflow-hidden px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
    <div className="mx-auto max-w-[1320px]">
      <SectionIntro eyebrow="From requirement to reliable delivery" title={<>A process with<br className="hidden sm:block" /> people in the loop.</>} copy="A clear, considered flow from first conversation through to delivery and after-sales support." />
      <div className="delivery-film mt-8">
        <div className="delivery-track" aria-hidden="true"><span className="track-line" /><span className="delivery-van"><Truck size={23} /></span><span className="track-pulse pulse-one" /><span className="track-pulse pulse-two" /></div>
        <div className="delivery-steps">{deliverySteps.map((step, index) => <article key={step.title} className="delivery-step"><span className="delivery-step-number">0{index + 1}</span><span className="delivery-step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </div>
      <p className="mt-5 text-xs leading-5 text-ink/45">Process is illustrative; product checks, packaging and delivery arrangements depend on the confirmed order.</p>
    </div>
  </section>;
}

function WhySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const clickScrollTimer = useRef(0);

  useEffect(() => {
    const steps = Array.from(document.querySelectorAll(".why-scroll-step"));
    if (!steps.length) return undefined;
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      const viewportCenter = window.innerHeight / 2;
      const nearestStep = steps.reduce((nearest, step) => {
        const stepCenter = step.getBoundingClientRect().top + step.getBoundingClientRect().height / 2;
        const nearestCenter = nearest.getBoundingClientRect().top + nearest.getBoundingClientRect().height / 2;
        return Math.abs(stepCenter - viewportCenter) < Math.abs(nearestCenter - viewportCenter) ? step : nearest;
      });
      setActiveIndex(Number(nearestStep.dataset.whyIndex));
    }, {
      threshold: [0.1, 0.35, 0.65],
      rootMargin: "-35% 0px -35% 0px",
    });

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  function goToReason(index) {
    window.clearTimeout(clickScrollTimer.current);
    setActiveIndex(index);
    document.getElementById(`why-step-${index + 1}`)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    clickScrollTimer.current = window.setTimeout(() => setActiveIndex(index), 700);
  }

  const activeReason = whyReasons[activeIndex];

  return <section className="why-section px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
    <div className="mx-auto max-w-[1320px]">
      <SectionIntro eyebrow="Why choose Maruti Chemicals" title={<>Built on quality,<br />trust and reliability.</>} copy="Six reasons businesses choose Maruti Chemicals as a supply partner. Scroll through each card or select a number to bring its details forward." />
      <div className="why-story mt-7">
        <div className="why-stage">
          <nav className="why-progress" aria-label="Why choose Maruti Chemicals">
            {whyReasons.map((reason, index) => (
              <button
                key={reason.title}
                type="button"
                onClick={() => goToReason(index)}
                aria-label={`Go to reason ${index + 1}: ${reason.title}`}
                aria-current={activeIndex === index ? "step" : undefined}
                className={`why-progress-step${activeIndex === index ? " is-active" : ""}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </nav>
          <div className="why-showcase" aria-hidden="true">
            <span className="why-showcase-orbit why-showcase-orbit-one" />
            <span className="why-showcase-orbit why-showcase-orbit-two" />
            <span className="why-showcase-grain" />
            <div className="why-showcase-content" key={`visual-${activeIndex}`}>
              <span className="why-showcase-index">{String(activeIndex + 1).padStart(2, "0")} <i>/ 06</i></span>
              <span className="why-showcase-icon">{activeReason.icon}</span>
              <span className="why-showcase-label">MARUTI CHEMICALS <i>·</i> OUR APPROACH</span>
            </div>
          </div>
          <article className="why-detail-card" aria-live="polite" aria-atomic="true">
            <div className="why-detail-content" key={`copy-${activeIndex}`}>
              <p className="why-detail-kicker">WHY MARUTI CHEMICALS <span>·</span> {String(activeIndex + 1).padStart(2, "0")} / 06</p>
              <h3>{activeReason.title}</h3>
              <p className="why-detail-description">{activeReason.body}</p>
              <a href="#industries" className="why-detail-link">Explore our industries <ArrowUpRight size={16} /></a>
            </div>
          </article>
        </div>
        <div className="why-scroll-track" aria-hidden="true">
          {whyReasons.map((reason, index) => (
            <div
              key={reason.title}
              id={`why-step-${index + 1}`}
              data-why-index={index}
              className="why-scroll-step"
            />
          ))}
        </div>
      </div>
    </div>
  </section>;
}

function FaqSection() {
  return <section className="faq-section px-5 py-10 sm:px-8 lg:px-10 lg:py-14"><div className="mx-auto grid max-w-[1320px] gap-6 lg:grid-cols-[.7fr_1.3fr]">
    <div><p className="eyebrow">Questions, answered</p><h2 className="section-title mt-3">Let’s make the next step clear.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-ink/60">Can’t find your answer? Our team can talk through the details with you.</p><a href="#contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest">Ask us directly <ArrowRight size={15} /></a></div>
    <div className="divide-y divide-ink/10 border-y border-ink/10">{faqs.map((item) => <details key={item.question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-base font-bold"><span>{item.question}</span><ChevronDown size={18} className="shrink-0 text-forest transition group-open:rotate-180" /></summary><p className="max-w-[720px] pb-5 text-sm leading-6 text-ink/60">{item.answer}</p></details>)}</div>
  </div></section>;
}

function SiteFooter({ cartLines, onOpenCart, onSent }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const totalUnits = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  async function submit(event) {
    event.preventDefault();
    if (!cartLines.length) return;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cartLines.map((line) => ({ productId: line.product.id, categoryId: line.category.id, quantity: line.quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t send your enquiry. Please try again.");
      setStatus("success");
      setForm(emptyForm);
      onSent();
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "We couldn’t send your enquiry. Please try again.");
    }
  }

  return <footer id="contact" className="site-footer scroll-mt-24">
    <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-14 lg:py-14">
      <div className="footer-details"><p className="eyebrow !text-forest">Get in touch</p><h2 className="mt-3 max-w-[440px] font-display text-4xl font-semibold leading-tight tracking-[-.055em] text-ink">Let’s build better solutions together.</h2><p className="mt-4 max-w-[390px] text-sm leading-6 text-ink/70">Looking for healthcare supplies, pharmaceutical products or a specialized solution? Tell us what you need. We’ll help you take it from there.</p>
        <div className="mt-8 space-y-5 text-sm text-ink/80"><p><strong className="mb-1 block text-xs uppercase tracking-wider text-ink/55">Office · {company.contactName}</strong>{company.address[0]}<br />{company.address[1]}</p><a className="block hover:text-forest" href={`tel:${company.phones[0].replaceAll(" ", "")}`}>{company.phones[0]} · {company.phones[1]}</a><a className="block hover:text-forest" href={`mailto:${company.email}`}>{company.email}</a><p className="flex items-center gap-2 text-xs text-ink/55"><Clock3 size={14} />{company.businessHours}</p></div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/55"><Link to="/">Home</Link><Link to="/#about">About</Link><Link to="/#industries">Industries</Link><Link to="/#delivery">Our process</Link><Link to="/#contact">Contact</Link></div>
      </div>
      <div className="footer-form-wrap">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Enquiry form</p><h3 className="mt-2 font-display text-2xl font-bold">Tell us what’s on your list.</h3></div>{cartLines.length > 0 && <button type="button" className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-forest" onClick={onOpenCart}>{cartLines.length} product lines · {totalUnits} units <span className="ml-1 underline">Edit quantities</span></button>}</div>
        {!cartLines.length && <p className="mt-3 rounded-lg bg-sage/50 px-3 py-2 text-xs leading-5 text-ink/65">Add products to your enquiry list before submitting. You can enter the quantity for each item manually in the list.</p>}
        {status === "success" && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} /> Your enquiry has been sent. Thank you!</p>}
        {status === "error" && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <FooterField label="Name" name="name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <FooterField label="Company" name="companyName" value={form.companyName} onChange={(value) => setForm({ ...form, companyName: value })} required />
          <FooterField label="Email" name="email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
          <FooterField label="Phone" name="phone" type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <label className="field-label sm:col-span-2">Industry<select required value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} className="field-control mt-2"><option value="">Select your industry</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}<option value="Laboratory">Laboratory</option><option value="Other">Other</option></select></label>
          <label className="field-label sm:col-span-2">Product / message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={2000} rows={3} placeholder="Product name, quantities, specifications or questions..." className="field-control mt-2 resize-y" /></label>
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-[10px] leading-4 text-ink/45">We use your details only to respond to this enquiry.</span><button type="submit" disabled={!cartLines.length || status === "sending"} className="button-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{status === "sending" ? "Sending..." : "Send enquiry"} <ArrowRight size={15} /></button></div>
        </form>
      </div>
    </div>
    <div className="footer-bottom flex flex-col gap-3 border-t border-ink/10 px-5 py-5 text-xs text-ink/55 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-14"><span>© {new Date().getFullYear()} Maruti Chemicals · Ghaziabad, India</span><span>10+ years · 5 sectors · 250+ customers · figures published by Maruti Chemicals</span></div>
  </footer>;
}

function IndustryPage({ onAdd, cart, cartLines, onOpenCart, onSent }) {
  const { categoryId } = useParams();
  const category = categoryById.get(categoryId);
  const [query, setQuery] = useState("");
  const visible = (category?.productIds || []).map((id) => productById.get(id)).filter(Boolean).filter((product) => `${product.name} ${product.subtitle} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  if (!category) return <NotFound />;
  return <main className="category-page">
    <section className="category-hero"><div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:px-10 lg:py-10"><div><Link to="/#industries" className="inline-flex items-center gap-2 text-xs font-semibold text-forest"><ArrowLeft size={14} /> All industries</Link><p className="eyebrow mt-6">{category.shortName} solutions</p><h1 className="mt-3 max-w-[780px] font-display text-4xl font-semibold leading-tight tracking-[-.06em] sm:text-5xl">{category.name}</h1><p className="mt-4 max-w-[650px] text-sm leading-6 text-ink/65">{category.description}</p></div></div></section>
    <section className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Products for this industry</p><h2 className="section-title mt-2">Explore the range</h2><p className="mt-2 text-sm text-ink/55">{category.productIds.length} product listings · request details and a quote from our team</p></div><label className="search-box flex h-11 w-full max-w-[340px] items-center gap-2 rounded-full border border-ink/10 bg-white px-4"><Search size={16} className="text-ink/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={`Search ${category.name} products`} placeholder="Search this category..." className="w-full bg-transparent text-xs outline-none" /></label></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((product, index) => <ProductCard key={product.id} product={product} category={category} index={index} onAdd={() => onAdd(product.id, category.id)} inCart={cart.some((line) => line.productId === product.id && line.categoryId === category.id)} />)}</div>
    </section>
    <SiteFooter cartLines={cartLines} onOpenCart={onOpenCart} onSent={onSent} />
  </main>;
}

function SearchPage({ onAdd, cart, cartLines, onOpenCart, onSent }) {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const matches = products.filter((product) => {
    const industries = product.categoryIds.map((id) => categoryById.get(id)?.name).join(" ");
    return `${product.name} ${product.subtitle} ${product.description} ${industries}`.toLowerCase().includes(query.toLowerCase());
  });
  return <><main className="category-page min-h-[65vh]"><div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 lg:px-10"><Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-forest"><ArrowLeft size={14} /> Home</Link><p className="eyebrow mt-8">Product search</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Results for “{query}”</h1><p className="mt-2 text-sm text-ink/55">{matches.length} matching listings across all industries</p>{matches.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{matches.map((product, index) => { const category = categoryById.get(product.categoryIds[0]); return <ProductCard key={product.id} product={product} category={category} index={index} inCart={cart.some((line) => line.productId === product.id && line.categoryId === category.id)} onAdd={() => onAdd(product.id, category.id)} />; })}</div> : <p className="mt-8 rounded-2xl bg-white p-8 text-sm text-ink/60">No matching products. Try another search, or <Link to="/#industries" className="font-bold text-forest underline">browse industries</Link>.</p>}</div></main><SiteFooter cartLines={cartLines} onOpenCart={onOpenCart} onSent={onSent} /></>;
}

function ProductCard({ product, category, index, onAdd, inCart }) {
  return <article className={`catalog-product-card catalog-product-card-${index % 4} group`} style={{ "--card-delay": `${Math.min(index, 9) * 45}ms` }}>
    <div className="catalog-product-art" aria-hidden="true"><span className="product-art-orbit" /><span className={`product-art-object ${product.id === "liquid-sampling-bags" ? "art-bag" : product.id === "sterile-tape" ? "art-tape" : "art-sample"}`}><i /><b>{product.id === "liquid-sampling-bags" ? "SAMPLE" : product.id === "sterile-tape" ? "STERILE" : "MARUTI"}</b></span><span className="catalog-product-number">0{(index % 10) + 1}</span></div>
    <div className="catalog-product-copy"><div className="flex items-start justify-between gap-2"><span className="text-[9px] font-bold uppercase tracking-[.13em] text-forest/65">{category.name}</span>{product.illustrative && <span className="sample-pill">Sample</span>}</div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{product.name}</h3><p className="mt-2 text-xs leading-5 text-ink/55">{product.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">{product.applications.slice(0, 2).map((application) => <span key={application} className="product-chip">{application}</span>)}</div>
      <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4"><Link to={`/brochure/${product.id}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-forest">Product brief <ArrowUpRight size={13} /></Link><button type="button" onClick={onAdd} disabled={inCart} className="catalog-add-button">{inCart ? <><CheckCircle2 size={14} /> In list</> : <><ShoppingBag size={14} /> Add</>}</button></div>
    </div>
  </article>;
}

function CartDrawer({ lines, onClose, onSetQuantity, onRemove, onEnquire }) {
  const grouped = categories.map((category) => ({ ...category, lines: lines.filter((line) => line.category.id === category.id) })).filter((category) => category.lines.length);
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", keyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", keyDown); };
  }, [onClose]);
  return <div className="fixed inset-0 z-50 flex justify-end"><button aria-label="Close enquiry list" className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={onClose} />
    <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="drawer-panel relative flex h-full w-full max-w-[480px] flex-col bg-cream shadow-2xl">
      <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5"><div><p className="eyebrow">Your shortlist</p><h2 id="cart-title" className="mt-1 font-display text-xl font-bold">Enquiry list <span className="text-ink/45">({lines.length})</span></h2></div><button type="button" aria-label="Close enquiry list" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10"><X size={17} /></button></div>
      <div className="border-b border-ink/8 bg-sage/35 px-6 py-3"><p className="text-xs leading-5 text-ink/65">Enter the quantity you need in each box—no plus or minus buttons. Quantities are per product line.</p></div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{!lines.length ? <div className="flex h-full flex-col items-center justify-center text-center"><ClipboardList size={32} className="text-forest/60" /><h3 className="mt-4 font-display text-lg font-bold">Your list is empty.</h3><p className="mt-2 text-sm text-ink/55">Explore an industry and add products to request a quote.</p><Link to="/#industries" onClick={onClose} className="mt-4 text-sm font-bold text-forest underline">Browse industries</Link></div> :
        grouped.map((category) => <section key={category.id} className="mb-6"><h3 className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-ink/45">{category.name}</h3><div className="overflow-hidden rounded-xl border border-ink/8 bg-white">{category.lines.map((line, index) => <div key={`${line.product.id}-${line.category.id}`} className={`flex items-center gap-3 p-3.5 ${index ? "border-t border-ink/6" : ""}`}><span className="product-symbol flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"><FlaskConical size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{line.product.name}</p><p className="text-[10px] text-ink/45">{line.product.illustrative ? "Sample listing" : "Featured product"}</p></div><label className="flex flex-col gap-1 text-[9px] font-bold uppercase tracking-wide text-ink/45">Quantity<input type="number" min="1" max="100000" step="1" required aria-label={`${line.product.name} quantity`} value={line.quantity} onChange={(event) => onSetQuantity(line.product.id, line.category.id, Number(event.target.value))} className="quantity-input" /></label><button type="button" onClick={() => onRemove(line.product.id, line.category.id)} className="px-1 text-[10px] text-ink/40 hover:text-red-700" aria-label={`Remove ${line.product.name}`}>Remove</button></div>)}</div></section>)
      }</div>
      {lines.length > 0 && <div className="border-t border-ink/8 bg-white px-6 py-5"><p className="mb-3 text-xs text-ink/55">{lines.length} product lines · {units} total units. Final availability and prices are confirmed by the team.</p><button type="button" onClick={onEnquire} className="button-primary flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white">Continue to enquiry <ArrowRight size={16} /></button></div>}
    </aside>
  </div>;
}

function FooterField({ label, name, value, onChange, type = "text", required = false }) {
  return <label className="field-label">{label}{required && <span className="text-coral"> *</span>}<input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={type === "email" ? 254 : 120} className="field-control mt-2" /></label>;
}

function BrochurePage() {
  const product = productById.get(useParams().productId);
  if (!product) return <NotFound />;
  return <main className="min-h-[70vh] bg-[#eaf0eb] px-5 py-10"><article className="print-sheet mx-auto max-w-[800px] bg-white p-8 shadow-card sm:p-14">
    <Link to="/" className="flex items-center gap-2 border-b border-ink/10 pb-5 font-display font-bold"><FlaskConical size={19} className="text-forest" /> {company.name}</Link>
    <p className="eyebrow mt-12">{product.illustrative ? "Illustrative catalogue sample" : "Featured product"}</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{product.name}</h1><p className="mt-3 text-sm leading-6 text-ink/65">{product.description}</p>
    <div className="mt-8 grid gap-8 border-y border-ink/10 py-7 sm:grid-cols-2"><div><h2 className="font-display font-bold">Applications</h2><ul className="mt-3 space-y-2 text-sm text-ink/65">{product.applications.map((item) => <li key={item}>· {item}</li>)}</ul></div><div><h2 className="font-display font-bold">Product information</h2><ul className="mt-3 space-y-2 text-sm text-ink/65">{product.features.map((item) => <li key={item}>· {item}</li>)}</ul></div></div>
    <p className="mt-7 text-xs leading-5 text-ink/55">Request current product specifications, available sizes, quality documentation and regulatory information from Maruti Chemicals before ordering or use.</p>
    <div className="mt-7 flex gap-3 print:hidden"><button type="button" onClick={() => window.print()} className="button-primary rounded-full px-5 py-3 text-sm font-bold text-white">Print / save as PDF</button><Link to="/" className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold">Back to home</Link></div>
  </article></main>;
}

function NotFound() {
  return <main className="grid min-h-[60vh] place-content-center bg-cream px-5 text-center"><h1 className="font-display text-3xl font-bold">We couldn’t find that page.</h1><Link to="/" className="mt-4 text-sm font-bold text-forest underline">Return to Maruti Chemicals</Link></main>;
}

export default App;
