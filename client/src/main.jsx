import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const services = [
  {
    number: "01",
    icon: "↗",
    className: "service-green",
    title: <>Structural<br />enhancements</>,
    description:
      "Thoughtful alterations and additions for solar farms and robust wind turbine foundations.",
  },
  {
    number: "02",
    icon: "⌁",
    className: "service-yellow",
    title: <>Repair &amp;<br />refurbishment</>,
    description:
      "Restoration and upgrading work that helps existing renewable facilities keep delivering.",
  },
  {
    number: "03",
    icon: "◷",
    className: "service-lilac",
    title: <>Preventive<br />maintenance</>,
    description:
      "Scheduled, proactive care for civil infrastructure and long-term site performance.",
  },
  {
    number: "04",
    icon: "⌖",
    className: "service-peach",
    title: "Site development",
    description:
      "Site preparation, earthworks and precision foundation laying for new projects.",
  },
];

const strengths = [
  {
    number: "01",
    title: "Experienced leadership",
    description:
      "Focused leadership with a clear understanding of civil work in the renewable energy sector.",
  },
  {
    number: "02",
    title: "Flexible by nature",
    description:
      "Own-account or contract-based — the engagement adapts to the needs of your project.",
  },
  {
    number: "03",
    title: "Quality without compromise",
    description:
      "A consistent commitment to safety, quality standards and environmental responsibility.",
  },
  {
    number: "04",
    title: "Clear communication",
    description:
      "Responsive, client-focused coordination from the first conversation through delivery.",
  },
];

const sectors = [
  "Renewable energy contractors & developers",
  "Solar power plants & wind energy projects",
  "Infrastructure companies",
  "Government & private sector initiatives",
];

const safetyPages = [
  {
    number: "01 / POLICY",
    title: "Safety Policy",
    description:
      "Our approach to risk assessment, PPE, emergency readiness and continuous improvement.",
    href: "/safety-policy",
  },
  {
    number: "02 / PEOPLE",
    title: "Safety Training",
    description:
      "Induction, role-based learning, daily briefings, drills and refresher training.",
    href: "/safety-training",
  },
  {
    number: "03 / TEAMWORK",
    title: "Safety Organization",
    description:
      "How responsibilities, communication and oversight work together on site.",
    href: "/safety-organization",
  },
];

function Emblem({ className = "" }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <img src="/images/brand-mark.svg" alt="" width="48" height="48" />
    </span>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p className={`eyebrow${light ? " eyebrow-light" : ""}`}>
      <span className="eyebrow-line" />
      {children}
    </p>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
    setPoliciesOpen(false);
  }

  return (
    <header className="site-header react-header">
      <div className="nav-wrap">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Shree Shantinath Enterprises home">
          <Emblem />
          <span className="brand-name">SHREE SHANTINATH <b>ENTERPRISES</b></span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
        <nav
          className={`primary-nav${menuOpen ? " is-open" : ""}`}
          id="primary-nav"
          aria-label="Main navigation"
        >
          <a href="#services" onClick={closeMenu}>What we do</a>
          <a href="#about" onClick={closeMenu}>Our approach</a>
          <a href="#sectors" onClick={closeMenu}>Who we serve</a>
          <div className={`nav-dropdown${policiesOpen ? " is-open" : ""}`}>
            <button
              type="button"
              aria-expanded={policiesOpen}
              onClick={() => setPoliciesOpen((open) => !open)}
            >
              Safety &amp; policies <span aria-hidden="true">⌄</span>
            </button>
            <div className="nav-dropdown-menu">
              <a href="/safety-policy">Safety Policy</a>
              <a href="/safety-training">Safety Training Process</a>
              <a href="/safety-organization">Safety Organization</a>
            </div>
          </div>
          <a href="/letterhead" onClick={closeMenu}>Letterhead</a>
          <a className="nav-cta" href="#contact" onClick={closeMenu}>
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function WindFarmIllustration() {
  return (
    <div className="hero-art" role="img" aria-label="Illustration of a solar farm and wind turbines at sunrise">
      <div className="hero-art-tag"><span className="hero-art-tag-dot" /> BUILT FOR CLEAN ENERGY</div>
      <div className="sun-glow" />
      <div className="sun" />
      <div className="hill hill-back" />
      <div className="hill hill-front" />
      <div className="windmill windmill-one"><div className="windmill-rotor"><i /><i /><i /><b /></div></div>
      <div className="windmill windmill-two"><div className="windmill-rotor"><i /><i /><i /><b /></div></div>
      <div className="solar-array"><span /><span /><span /></div>
      <div className="art-label">
        <span className="art-label-icon">✳</span>
        <span>Infrastructure<br /><b>for a better future</b></span>
      </div>
      <span className="art-coordinate">INDIA · RENEWABLE ENERGY</span>
      <div className="art-index"><span>01</span><span /> CLEAN ENERGY, BUILT TO LAST</div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy">
        <Eyebrow>BUILT FOR A BRIGHTER TOMORROW</Eyebrow>
        <h1>Strong foundations.<br /><span>Cleaner energy.</span></h1>
        <p className="hero-intro">
          Expert civil works that keep India&apos;s solar and wind projects
          growing, performing and ready for what comes next.
        </p>
        <div className="hero-actions">
          <a className="button button-dark" href="#contact">
            Discuss your project <span aria-hidden="true">↗</span>
          </a>
          <a className="text-link" href="#services">
            Explore our services <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-trust">
          <span className="trust-dot" /> Civil works for the renewable energy sector
        </div>
        <div className="hero-proof" aria-label="Our priorities">
          <span><b>01</b> Safety-led</span>
          <span><b>02</b> Site-ready</span>
          <span><b>03</b> Built to last</span>
        </div>
      </div>
      <WindFarmIllustration />
    </section>
  );
}

function IntroStrip() {
  return (
    <section className="intro-strip" aria-label="Company introduction">
      <div className="section-shell intro-inner">
        <p>
          We are <strong>Shree Shantinath Enterprises</strong> — a civil works
          partner for the people building a more sustainable energy future.
        </p>
        <a href="#about">A little about us <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="services section-shell section-pad" id="services">
      <div className="section-heading reveal">
        <div>
          <Eyebrow>WHAT WE DO</Eyebrow>
          <h2>Made to meet the<br /><span>demands of the field.</span></h2>
        </div>
        <p>
          Practical, dependable civil solutions for renewable energy assets —
          from first groundwork to long-term upkeep.
        </p>
      </div>
      <div className="service-grid">
        {services.map((service) => (
          <article className={`service-card ${service.className} reveal`} key={service.number}>
            <span className="card-number">{service.number}</span>
            <span className="service-icon" aria-hidden="true">{service.icon}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href="#contact" aria-label={`Enquire about ${service.description.split(" ")[0]} services`}>↗</a>
          </article>
        ))}
      </div>
      <div className="service-note"><span>✳</span> Own-account and contract-based project engagement</div>
    </section>
  );
}

function About() {
  return (
    <section className="about-band" id="about">
      <div className="section-shell about-layout">
        <div className="about-visual reveal" aria-label="Quality work, safer sites, lasting impact">
          <div className="about-orbit orbit-one" />
          <div className="about-orbit orbit-two" />
          <span className="about-sun">✳</span>
          <p className="about-stamp">BUILT WITH<br /><b>INTEGRITY</b></p>
          <div className="about-quote">“Quality work.<br />Safer sites.<br /><em>Lasting impact.</em></div>
          <span className="about-caption">SHREE SHANTINATH ENTERPRISES · ESTABLISHED WITH PURPOSE</span>
        </div>
        <div className="about-copy reveal">
          <Eyebrow>THE PEOPLE BEHIND THE WORK</Eyebrow>
          <h2>Grounded in experience.<br /><span>Focused on the future.</span></h2>
          <p>
            Shree Shantinath Enterprises is a proprietorship led by
            <strong> Harsh Vardhan</strong>. We specialise in civil alteration,
            addition, repair and maintenance for the renewable energy sector.
          </p>
          <p>
            Every project is approached with care, clear communication and a
            practical understanding of what it takes to deliver on site. We
            work on both an own-account and contract basis to suit the project.
          </p>
          <div className="about-facts">
            <div><span>01</span><b>Safety-first<br />execution</b></div>
            <div><span>02</span><b>Flexible<br />engagement</b></div>
            <div><span>03</span><b>Reliable<br />delivery</b></div>
          </div>
          <a className="text-link text-link-dark" href="#contact">
            Meet us on your next project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section className="values section-shell section-pad">
      <div className="values-heading reveal">
        <Eyebrow>WHY PARTNER WITH US</Eyebrow>
        <h2>A good project deserves<br /><span>a good partner.</span></h2>
      </div>
      <div className="values-list">
        {strengths.map((strength) => (
          <article className="value-row reveal" key={strength.number}>
            <span className="value-index">{strength.number}</span>
            <h3>{strength.title}</h3>
            <p>{strength.description}</p>
            <span className="value-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Market() {
  return (
    <section className="market" id="sectors">
      <div className="section-shell market-inner">
        <div className="market-copy reveal">
          <Eyebrow light>WHERE WE WORK</Eyebrow>
          <h2>Part of the<br /><span>energy transition.</span></h2>
          <p>
            We welcome partnerships with organisations moving renewable energy
            forward — and the teams doing the important work on the ground.
          </p>
          <a className="button button-light" href="#contact">
            Let&apos;s work together <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="market-list reveal">
          {sectors.map((sector, index) => (
            <div key={sector}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{sector}</b><i aria-hidden="true">↗</i>
            </div>
          ))}
        </div>
        <span className="market-spark" aria-hidden="true">✳</span>
      </div>
    </section>
  );
}

function Purpose() {
  return (
    <section className="purpose section-shell">
      <article className="purpose-card purpose-vision reveal">
        <span className="purpose-icon" aria-hidden="true">✳</span>
        <Eyebrow>OUR VISION</Eyebrow>
        <h2>Trusted partners<br />in a greener future.</h2>
        <p>
          To be a trusted leader in civil contracting for renewable energy —
          helping build sustainable infrastructure that powers a greener future.
        </p>
      </article>
      <article className="purpose-card purpose-mission reveal">
        <span className="purpose-icon" aria-hidden="true">↗</span>
        <Eyebrow>OUR MISSION</Eyebrow>
        <h2>Do the work.<br />Make it matter.</h2>
        <p>
          Deliver high-quality civil services with integrity, support India&apos;s
          renewable energy growth, build lasting partnerships and promote
          sustainable practices.
        </p>
      </article>
    </section>
  );
}

function Safety() {
  return (
    <section className="safety-preview section-shell">
      <div className="safety-preview-heading reveal">
        <div>
          <Eyebrow>SAFETY IS EVERYONE&apos;S BUSINESS</Eyebrow>
          <h2>Good work begins<br /><span>with working safely.</span></h2>
        </div>
        <p>
          Clear responsibilities, practical training and proactive risk
          management help our teams make safety part of every project.
        </p>
      </div>
      <div className="safety-preview-grid">
        {safetyPages.map((item) => (
          <a className="safety-preview-card reveal" href={item.href} key={item.href}>
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState({ message: "", type: "" });
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setStatus({ message: "", type: "" });

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "We could not send your enquiry.");
      }

      setStatus({ message: result.message, type: "success" });
      form.reset();
    } catch (error) {
      setStatus({
        message: error.message || "We could not send your enquiry. Please call +91 96363 20419.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact section-shell section-pad" id="contact">
      <div className="contact-layout">
        <div className="contact-copy reveal">
          <Eyebrow>LET&apos;S TALK</Eyebrow>
          <h2>Tell us what<br />you&apos;re <span>building.</span></h2>
          <p>
            Share a little about your project. We&apos;ll be in touch to understand
            what you need and how we can help.
          </p>
          <div className="contact-details">
            <a href="tel:+919636320419">
              <span className="detail-icon">↗</span>
              <span><small>GIVE US A CALL</small><b>+91 96363 20419</b></span>
            </a>
            <a href="mailto:shreeshantinath.enterprises25@gmail.com">
              <span className="detail-icon">@</span>
              <span><small>WRITE TO US</small><b>shreeshantinath.enterprises25@gmail.com</b></span>
            </a>
          </div>
          <div className="business-id">
            <span>PROPRIETOR</span>
            <b>Harsh Vardhan</b>
            <span>GSTIN&nbsp; 08BOKPV8974D1Z5</span>
            <span>PAN&nbsp; BOKPV8974D</span>
          </div>
        </div>
        <form className="contact-form reveal" id="enquiry-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h3>Project enquiry</h3><span>Fields marked * are required</span>
          </div>
          <div className="form-row">
            <label>Your name *<input name="name" autoComplete="name" placeholder="e.g. Priya Sharma" maxLength="120" required /></label>
            <label>Company<input name="company" autoComplete="organization" placeholder="Your organisation" maxLength="160" /></label>
          </div>
          <div className="form-row">
            <label>Email address *<input name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength="254" required /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+91" maxLength="40" /></label>
          </div>
          <div className="form-row">
            <label>Type of project
              <select name="projectType" defaultValue="">
                <option value="">Select a service</option>
                <option>Structural enhancements</option>
                <option>Repair &amp; refurbishment</option>
                <option>Preventive maintenance</option>
                <option>Site development</option>
                <option>Other civil works</option>
              </select>
            </label>
            <label>Project location<input name="location" placeholder="City, state" maxLength="160" /></label>
          </div>
          <label>Expected timeline
            <select name="timeline" defaultValue="">
              <option value="">Select a timeline</option>
              <option>As soon as possible</option>
              <option>Within 1–3 months</option>
              <option>Within 3–6 months</option>
              <option>Planning / exploring</option>
            </select>
          </label>
          <label>
            Tell us about your requirements *
            <textarea name="requirements" rows="4" placeholder="A few details about the work, site or support you need…" maxLength="5000" required />
          </label>
          <div className="website-field" aria-hidden="true">
            <label>Leave this field empty<input name="website" tabIndex="-1" autoComplete="off" /></label>
          </div>
          <div className="form-footer">
            <button className="button button-dark" type="submit" disabled={sending}>
              <span className="submit-label">{sending ? "Sending…" : "Send project enquiry"}</span>
              <span aria-hidden="true">↗</span>
            </button>
            <span className="form-privacy">Your details are used only to respond to your enquiry.</span>
          </div>
          <p className={`form-status${status.type ? ` is-${status.type}` : ""}`} role="status" aria-live="polite">
            {status.message}
          </p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-main">
        <a className="brand footer-brand" href="#home">
          <Emblem />
          <span className="brand-name">SHREE SHANTINATH <b>ENTERPRISES</b></span>
        </a>
        <p>Building sustainable energy<br />infrastructure together.</p>
        <a className="footer-top" href="#home">Back to top ↑</a>
      </div>
      <div className="section-shell footer-bottom">
        <span>© {new Date().getFullYear()} Shree Shantinath Enterprises</span>
        <span>QUALITY · SAFETY · SUSTAINABILITY</span>
        <span>GSTIN 08BOKPV8974D1Z5</span>
      </div>
    </footer>
  );
}

function App() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <IntroStrip />
        <Services />
        <About />
        <Strengths />
        <Market />
        <Purpose />
        <Safety />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>,
);
