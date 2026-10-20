
function getRunningFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = April
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `FY ${startYear}–${String(endYear).slice(-2)}`;
}

import React, { useState, useEffect, useId, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Sun,
  Wind,
  Zap,
  Shield,
  ShieldCheck,
  HardHat,
  Compass,
  Wrench,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Sliders,
  Layers,
  FileText,
  Download,
  Copy,
  Check,
  Moon,
  RefreshCw,
  AlertCircle,
  Truck,
  Ruler,
  Award,
  ArrowDown
} from "lucide-react";
import "./styles.css";

// --- DATA DEFINITIONS ---

const statsData = [
  {
    value: "100%",
    label: "Safety Compliance",
    subtext: "STP & SOS Certified protocols",
    icon: ShieldCheck,
  },
  {
    value: "750+ MW",
    label: "Capacity Supported",
    subtext: "Solar & Wind civil foundations",
    icon: Zap,
  },
  {
    value: "< 10 Days",
    label: "Rapid Mobilization",
    subtext: "Machinery & squads site-ready",
    icon: Truck,
  },
  {
    value: "0 LTI",
    label: "Zero Lost Time Injuries",
    subtext: "Uncompromising site safety",
    icon: Award,
  },
];

const servicesList = [
  {
    id: "structural",
    number: "01",
    tag: "High-Tolerance Civil",
    title: "Structural Enhancements & Additions",
    shortDesc: "Engineered foundation alterations, inverter plinths, and wind turbine anchor reinforcements.",
    longDesc: "Precision structural alterations and heavy-duty load-bearing additions engineered for utility-scale solar farms and wind turbine foundations. We deliver reinforced concrete bases, inverter room platforms, transformer yard foundations, and substation switchyard plinths with strict millimeter-tolerance leveling.",
    accentColor: "emerald",
    icon: HardHat,
    specs: [
      "Heavy equipment & WTG foundation post-tensioning",
      "Inverter & transformer pad construction with oil pit sumps",
      "Substation switchyard civil plinths and firewalls",
      "Solar tracker & fixed-tilt pile foundations in rocky strata"
    ],
    machinery: "Hydraulic piling rigs, transit mixers, concrete vibrators, laser leveling equipment",
  },
  {
    id: "repair",
    number: "02",
    tag: "Restoration & Upkeep",
    title: "Repair, Refurbishment & Retrofitting",
    shortDesc: "Specialist crack remediation, epoxy structural grouting, and foundation stabilization.",
    longDesc: "Comprehensive civil rehabilitation that restores aging or weathered clean energy assets to peak operational safety. From deep foundation stabilization and micro-piling to epoxy concrete grouting, weathering repair, and waterproofing of critical cable trenches.",
    accentColor: "amber",
    icon: Wrench,
    specs: [
      "High-strength epoxy pressure grouting for concrete cracks",
      "Foundation leveling corrections & subgrade stabilization",
      "Waterproofing & sealing of inverter control rooms & cable ducts",
      "Tracker anchor bolt restoration and torque re-anchoring"
    ],
    machinery: "Epoxy injection pumps, core drilling machines, rebound hammers, crack monitors",
  },
  {
    id: "maintenance",
    number: "03",
    tag: "Proactive Site Care",
    title: "Preventive Maintenance & Site Care",
    shortDesc: "Scheduled storm drainage desilting, perimeter stability, and structural inspections.",
    longDesc: "Proactive civil asset stewardship preventing expensive site shutdowns. We execute seasonal pre-monsoon storm water desilting, perimeter drainage slope corrections, boundary berm reinforcement, access road grading, and regular civil integrity audits.",
    accentColor: "cyan",
    icon: Activity,
    specs: [
      "Monsoon drainage clearing & contour trench desilting",
      "Erosion prevention on sloping terrain and berm retention",
      "Internal site road re-graveling & dust mitigation",
      "Perimeter security fencing & flood-bund reinforcement"
    ],
    machinery: "Motor graders, mini-excavators, vibrating rollers, water tankers",
  },
  {
    id: "site-dev",
    number: "04",
    tag: "Turnkey Civil Works",
    title: "Turnkey Site Development & Earthworks",
    shortDesc: "Bulk earthmoving, precision contour grading, arterial roads, and ground preparation.",
    longDesc: "Full-lifecycle groundwork from raw desert, scrubland, or rocky terrain to a laser-leveled, ready-to-mount clean energy facility. We manage topsoil stripping, cut-and-fill bulk earthworks, compaction, heavy-haul internal road networks, and storm water management.",
    accentColor: "gold",
    icon: Compass,
    specs: [
      "Topographic grading & precision cut-and-fill balancing",
      "Heavy-haul arterial roads designed for 100T+ WTG crane movements",
      "Subsurface storm water drains, culverts & retention ponds",
      "Perimeter security trenching & solar PV block clearing"
    ],
    machinery: "Excavators (20T), bulldozers, tandem rollers, dumpers, soil compactors",
  },
  {
    id: "govt-civil",
    number: "05",
    tag: "Public Infrastructure",
    title: "Government Civil Contracts & PWD Works",
    shortDesc: "Public infrastructure, PWD civil works, concrete roads, drainage channels, and municipal utilities.",
    longDesc: "Full-compliance civil contracting for state government departments, municipal corporations, PWD/CPWD, and public sector undertakings. We execute reinforced concrete roads (CC/PQC), arterial storm water drainage channels, government institutional foundations, security boundary berms, and public infrastructure with complete statutory compliance.",
    accentColor: "gold",
    icon: Building2,
    specs: [
      "PWD / CPWD reinforced cement concrete pavement & drainage works",
      "Arterial storm drainage channels, culverts & flood retention structures",
      "Government institutional foundations, perimeter boundary walls & security gates",
      "Public utility civil earthworks, water retaining plinths & transformer yards"
    ],
    machinery: "Transit mixers, batching plants, tandem vibratory rollers, total stations, excavators",
  },
];

const executionPhases = [
  {
    step: "01",
    phase: "Site Survey & Geotech Analysis",
    description: "Detailed topographic mapping, soil resistivity, rock profiling, and drainage catchment study to optimize civil design.",
    highlight: "Zero surprises on ground",
  },
  {
    step: "02",
    phase: "Bulk Earthworks & Arterial Roads",
    description: "Laser-guided clearing, grading, cut-and-fill leveling, and heavy-duty compacted access roads ready for crane delivery.",
    highlight: "100T+ crane-bearing roads",
  },
  {
    step: "03",
    phase: "Reinforced Civil Execution",
    description: "High-grade M25/M35 concrete pouring, anchor bolt templates with millimeter precision, curing, and trenching.",
    highlight: "±2mm tolerance standards",
  },
  {
    step: "04",
    phase: "Quality Audits & Safety Sign-off",
    description: "Compressive cube testing, ultrasonic integrity checks, comprehensive STP safety audits, and formal handover.",
    highlight: "100% Tender compliance",
  },
];

const safetyDocuments = [
  {
    slug: "safety-policy",
    code: "POL-01",
    title: "Corporate Safety Policy",
    desc: "Rigorous occupational health, environmental risk mitigation, mandatory PPE protocols, and zero-compromise safety standards.",
    download: "/documents/Safety-Policy-SSE.pdf",
    badge: "Official Signed Policy",
  },
  {
    slug: "safety-training",
    code: "TRN-02",
    title: "Safety Training Process",
    desc: "Daily Tool-Box Talks (TBT), site safety induction for every worker, specialized heavy machinery training, and emergency drills.",
    download: "/documents/STP-SSE.pdf",
    badge: "Operational Protocol",
  },
  {
    slug: "safety-organization",
    code: "ORG-03",
    title: "Safety Organization Structure",
    desc: "Dedicated site safety supervisors, incident reporting hierarchy, and emergency rapid response team coordination.",
    download: "/documents/SOS-SSE.pdf",
    badge: "Governance Hierarchy",
  },
];

const faqs = [
  {
    question: "How quickly can Shree Shantinath Enterprises mobilize to our project site?",
    answer:
      "We maintain dedicated civil squads and machinery relationships across Rajasthan, Gujarat, and major renewable hubs across India. For urgent repairs or scheduled project milestones, initial mobilization typically commences within 7 to 10 days following contract finalization.",
  },
  {
    question: "Do you operate on both own-account and contractor/subcontractor models?",
    answer:
      "Yes. We offer complete flexibility to align with your procurement framework. We execute works on an own-account turnkey basis (providing machinery, skilled labor, and supervision) or as a specialized civil sub-contractor for Tier-1 EPC developers like Tata Power Renewable, Adani, ReNew, and others.",
  },
  {
    question: "What compliance and tax credentials are in place for vendor empanelment?",
    answer:
      "Shree Shantinath Enterprises is a registered MSME contractor with active GSTIN (08BOKPV8974D1Z5), and established Vendor Registration Forms (VRF). We provide complete audit-ready documentation including Safety Policies, STP, and SOS.",
  },
  {
    question: "How do you handle challenging terrain like rocky strata or desert sand?",
    answer:
      "Having extensive field execution experience in Western India, we utilize specialized rock-drilling hydraulic augers, heavy vibratory compactors, geotextile stabilization layers, and customized trench profiles suited to arid, high-wind, and shifting soil conditions.",
  },
];

// --- UTILITY COMPONENTS ---

function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className={`copy-pill-btn ${className} ${copied ? "is-copied" : ""}`}
      onClick={handleCopy}
      title={`Copy ${text}`}
      aria-label={`Copy ${text}`}
    >
      {copied ? <Check size={12} className="copy-icon check-green" /> : <Copy size={12} className="copy-icon" />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}

// --- INTERACTIVE CLEAN ENERGY ANIMATED GRAPHICS COMPONENT ---

function InteractiveRenewableLandscape() {
  const [turbineSpeed, setTurbineSpeed] = useState("normal"); // 'slow', 'normal', 'fast'
  const [lightingMode, setLightingMode] = useState("sunrise"); // 'sunrise', 'noon', 'twilight'
  const [activeCallout, setActiveCallout] = useState(0);

  const callouts = [
    { title: "Solar Array Trackers", desc: "Precision foundation piles engineered for high wind gust loads" },
    { title: "Wind Turbine Plinths", desc: "High-grade M35 mass concrete bases with high tensile anchors" },
    { title: "Substation Switchyard", desc: "Laser-leveled transformer plinths and fire protection berms" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCallout((prev) => (prev + 1) % callouts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const speedClass =
    turbineSpeed === "slow" ? "speed-slow" : turbineSpeed === "fast" ? "speed-fast" : "speed-normal";

  return (
    <div className={`hero-canvas-card ${lightingMode}`}>
      {/* Top HUD badge */}
      <div className="canvas-hud-top">
        <div className="hud-badge-live">
          <span className="live-radar-dot" />
          <span className="hud-live-text">TELEMETRY: ACTIVE CIVIL FIELD</span>
        </div>
        <div className="hud-controls">
          <button
            type="button"
            className="hud-ctrl-btn"
            onClick={() =>
              setLightingMode((prev) =>
                prev === "sunrise" ? "noon" : prev === "noon" ? "twilight" : "sunrise"
              )
            }
            title="Cycle Lighting Atmosphere"
          >
            <Sun size={13} />
            <span>{lightingMode === "sunrise" ? "Morning Glow" : lightingMode === "noon" ? "High Noon" : "Dusk Horizon"}</span>
          </button>
          <button
            type="button"
            className="hud-ctrl-btn"
            onClick={() =>
              setTurbineSpeed((prev) =>
                prev === "normal" ? "fast" : prev === "fast" ? "slow" : "normal"
              )
            }
            title="Adjust Wind Turbine Rotation"
          >
            <Wind size={13} />
            <span>{turbineSpeed.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Art */}
      <div className="canvas-viewport">
        {/* Sky & Sun elements */}
        <div className="canvas-sun-wrap">
          <div className="sun-halo" />
          <div className="sun-core" />
          <div className="sun-rays-pulse" />
        </div>

        {/* Ambient floating clean-energy particle motes */}
        <div className="floating-motes-wrap" aria-hidden="true">
          <span className="mote mote-1" />
          <span className="mote mote-2" />
          <span className="mote mote-3" />
          <span className="mote mote-4" />
          <span className="mote mote-5" />
        </div>

        {/* Hills Layer Back */}
        <div className="hills-layer hills-back" />

        {/* Wind Turbines */}
        <div className={`wind-turbine turbine-primary ${speedClass}`}>
          <div className="turbine-tower">
            <span className="turbine-beacon" />
          </div>
          <div className="turbine-head">
            <div className="turbine-hub" />
            <div className="turbine-blades">
              <span className="blade blade-1" />
              <span className="blade blade-2" />
              <span className="blade blade-3" />
            </div>
          </div>
        </div>

        <div className={`wind-turbine turbine-secondary ${speedClass}`}>
          <div className="turbine-tower">
            <span className="turbine-beacon" />
          </div>
          <div className="turbine-head">
            <div className="turbine-hub" />
            <div className="turbine-blades">
              <span className="blade blade-1" />
              <span className="blade blade-2" />
              <span className="blade blade-3" />
            </div>
          </div>
        </div>

        <div className={`wind-turbine turbine-tertiary ${speedClass}`}>
          <div className="turbine-tower">
            <span className="turbine-beacon" />
          </div>
          <div className="turbine-head">
            <div className="turbine-hub" />
            <div className="turbine-blades">
              <span className="blade blade-1" />
              <span className="blade blade-2" />
              <span className="blade blade-3" />
            </div>
          </div>
        </div>

        {/* Hills Layer Front */}
        <div className="hills-layer hills-front" />

        {/* 3D Solar PV Farm Arrays with Reflective Light Gleam */}
        <div className="solar-pv-farm">
          <div className="solar-table table-1">
            <div className="solar-cells-grid">
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
            </div>
            <div className="solar-sheen-sweep" />
          </div>
          <div className="solar-table table-2">
            <div className="solar-cells-grid">
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
            </div>
            <div className="solar-sheen-sweep" />
          </div>
          <div className="solar-table table-3">
            <div className="solar-cells-grid">
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
              <span className="cell" />
            </div>
            <div className="solar-sheen-sweep" />
          </div>
        </div>

        {/* Power Grid Energy Conduit Trails (Animated Pulse) */}
        <div className="energy-grid-conduit" aria-hidden="true">
          <svg className="energy-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
            <path
              className="conduit-line"
              d="M 80 170 Q 220 140 340 160 T 520 135"
              fill="none"
              stroke="rgba(245, 158, 11, 0.45)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <circle className="energy-particle particle-a" r="4" fill="#fbbf24" />
            <circle className="energy-particle particle-b" r="4" fill="#34d399" />
          </svg>
        </div>

        {/* Step-up Substation / Inverter House Miniature Visual */}
        <div className="substation-block">
          <div className="substation-body">
            <span className="substation-roof" />
            <span className="substation-plinth" />
            <div className="substation-lights">
              <span className="led led-green" />
              <span className="led led-yellow" />
            </div>
          </div>
          <span className="substation-label">INVERTER PLINTH 33kV</span>
        </div>
      </div>

      {/* Floating Telemetry Interactive Card on Bottom */}
      <div className="canvas-telemetry-bottom">
        <div className="telemetry-info">
          <span className="telemetry-badge">
            <Zap size={11} className="telemetry-icon" />
            FEATURED ENGINEERING DETAIL
          </span>
          <h4 className="telemetry-title">{callouts[activeCallout].title}</h4>
          <p className="telemetry-desc">{callouts[activeCallout].desc}</p>
        </div>
        <div className="telemetry-dots">
          {callouts.map((c, i) => (
            <button
              key={c.title}
              type="button"
              className={`telemetry-dot ${i === activeCallout ? "is-active" : ""}`}
              onClick={() => setActiveCallout(i)}
              aria-label={`Show ${c.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- INTERACTIVE PROJECT ESTIMATOR & SCOPE BUILDER COMPONENT ---

function ProjectScopeEstimator({ onSelectScope }) {
  const [assetType, setAssetType] = useState("solar");
  const [scopeType, setScopeType] = useState("foundation");
  const [capacity, setCapacity] = useState("medium");

  const assetOptions = [
    { id: "solar", label: "Utility Solar PV", icon: Sun, desc: "Ground mount & tracker arrays" },
    { id: "wind", label: "Wind Turbine Facility", icon: Wind, desc: "High-capacity WTG towers" },
    { id: "hybrid", label: "Hybrid Clean Park", icon: Zap, desc: "Co-located solar + wind" },
    { id: "substation", label: "Substation / BESS", icon: Building2, desc: "Inverter rooms & battery plinths" },
    { id: "govt", label: "Govt. Civil & PWD", icon: Building2, desc: "Public works, roads, drains & structures" },
  ];

  const scopeOptions = [
    { id: "turnkey", label: "Turnkey Site Dev", desc: "Grading, roads, drainage & piling" },
    { id: "foundation", label: "Civil Foundations Only", desc: "Piles, plinths, inverter pads" },
    { id: "repair", label: "Retrofit & Repair", desc: "Foundation rehabilitation & grouting" },
    { id: "maintenance", label: "Annual Maintenance (AMC)", desc: "Drainage desilting & road upkeep" },
  ];

  const capacityOptions = [
    { id: "small", label: "5 – 25 MW", timeframe: "7–10 Days", personnel: "20–35 Personnel" },
    { id: "medium", label: "25 – 100 MW", timeframe: "10–14 Days", personnel: "40–80 Personnel" },
    { id: "large", label: "100 – 500+ MW", timeframe: "14–21 Days", personnel: "100+ Turnkey Squad" },
  ];

  const selectedCapacity = capacityOptions.find((c) => c.id === capacity);
  const selectedAsset = assetOptions.find((a) => a.id === assetType);
  const selectedScope = scopeOptions.find((s) => s.id === scopeType);

  const handleApplyToForm = () => {
    const summary = `${selectedAsset.label} (${selectedCapacity.label}) - ${selectedScope.label}`;
    onSelectScope(summary, selectedScope.label);
    const formElement = document.getElementById("contact");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="estimator-section section-shell" id="estimator">
      <div className="estimator-container reveal">
        <div className="estimator-header">
          <div className="estimator-badge">
            <Sliders size={14} className="badge-icon" />
            <span>INTERACTIVE CIVIL SCOPE CALCULATOR</span>
          </div>
          <h2>Configure Your Project Scope &amp; Mobilization</h2>
          <p>
            Select your renewable asset type, technical civil requirements, and target capacity to see instant squad deployment specifications and transfer directly into your project inquiry.
          </p>
        </div>

        <div className="estimator-grid">
          {/* Controls Column */}
          <div className="estimator-controls">
            {/* Asset Selector */}
            <div className="config-block">
              <label className="config-label">
                <span className="step-num">Step 1</span> Select Renewable Asset Type
              </label>
              <div className="chips-grid chips-2x2">
                {assetOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`chip-card ${assetType === opt.id ? "is-selected" : ""}`}
                      onClick={() => setAssetType(opt.id)}
                    >
                      <Icon size={18} className="chip-icon" />
                      <div className="chip-text">
                        <strong>{opt.label}</strong>
                        <small>{opt.desc}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scope Selector */}
            <div className="config-block">
              <label className="config-label">
                <span className="step-num">Step 2</span> Target Civil Scope
              </label>
              <div className="chips-grid chips-2x2">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`chip-card ${scopeType === opt.id ? "is-selected" : ""}`}
                    onClick={() => setScopeType(opt.id)}
                  >
                    <Layers size={16} className="chip-icon" />
                    <div className="chip-text">
                      <strong>{opt.label}</strong>
                      <small>{opt.desc}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity Selector */}
            <div className="config-block">
              <label className="config-label">
                <span className="step-num">Step 3</span> Capacity / Scale
              </label>
              <div className="chips-grid chips-3col">
                {capacityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`chip-card chip-scale ${capacity === opt.id ? "is-selected" : ""}`}
                    onClick={() => setCapacity(opt.id)}
                  >
                    <strong>{opt.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="estimator-summary-card">
            <div className="summary-glow-ring" />
            <div className="summary-top">
              <span className="summary-badge">ESTIMATED MOBILIZATION SPEC</span>
              <h3>{selectedAsset.label}</h3>
              <p className="summary-scope-title">{selectedScope.label}</p>
            </div>

            <div className="summary-metrics">
              <div className="metric-box">
                <Clock size={16} className="metric-icon" />
                <div>
                  <small>MOBILIZATION READINESS</small>
                  <strong>{selectedCapacity.timeframe}</strong>
                </div>
              </div>
              <div className="metric-box">
                <HardHat size={16} className="metric-icon" />
                <div>
                  <small>ESTIMATED SQUAD DEPLOYED</small>
                  <strong>{selectedCapacity.personnel}</strong>
                </div>
              </div>
            </div>

            <div className="summary-deliverables">
              <h4>Included Project Deliverables:</h4>
              <ul>
                <li>
                  <CheckCircle2 size={13} className="check-icon" />
                  <span>Site topography verification &amp; laser alignment</span>
                </li>
                <li>
                  <CheckCircle2 size={13} className="check-icon" />
                  <span>STP-compliant daily Safety briefings &amp; PPE enforcement</span>
                </li>
                <li>
                  <CheckCircle2 size={13} className="check-icon" />
                  <span>Heavy equipment deployment (Excavators, Rollers, Mixers)</span>
                </li>
                <li>
                  <CheckCircle2 size={13} className="check-icon" />
                  <span>M25/M35 concrete test cube documentation &amp; handoff</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="button button-accent button-wide"
              onClick={handleApplyToForm}
            >
              <span>Transfer Scope to Project Inquiry</span>
              <ArrowDown size={14} />
            </button>
            <span className="summary-footnote">
              * Non-binding scope preview. Final engineering estimate provided upon tender drawing review.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- MAIN APPLICATION COMPONENT ---

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sse_theme");
      if (saved) return saved === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode");
      localStorage.setItem("sse_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("sse_theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState("structural");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    projectType: "",
    location: "",
    timeline: "",
    requirements: "",
    website: "", // honeypot
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  // Scroll Progress Effect
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal On Scroll Effect
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
      { threshold: 0.1 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const handleScopeSelect = (scopeDescription, serviceName) => {
    setFormData((prev) => ({
      ...prev,
      projectType: serviceName || prev.projectType,
      requirements: prev.requirements
        ? `${prev.requirements}\n\n[Configured Scope]: ${scopeDescription}`
        : `[Configured Scope]: ${scopeDescription}\n\nPlease share your bill of quantities (BOQ) or schedule a call to review tender drawings.`,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ message: "", type: "" });

    try {
      let submitted = false;
      let result = null;

      try {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          result = await response.json().catch(() => ({}));
          if (response.ok) {
            submitted = true;
          }
        }
      } catch (apiErr) {
        // Fall back to direct Firestore write
      }

      if (!submitted) {
        const { initializeApp, getApps } = await import("firebase/app");
        const { getFirestore, collection, addDoc } = await import("firebase/firestore");
        const firebaseConfig = {
          apiKey: "AIzaSyAwTh01aFwrYz-E2MIjkiLgfEW2PzO_H94",
          authDomain: "sse-jalore.firebaseapp.com",
          projectId: "sse-jalore",
          storageBucket: "sse-jalore.firebasestorage.app",
          messagingSenderId: "818092722547",
          appId: "1:818092722547:web:859f55072478a31b491d06",
        };
        const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        await addDoc(collection(db, "enquiries"), {
          name: formData.name,
          company: formData.company || "",
          email: formData.email,
          phone: formData.phone || "",
          projectType: formData.projectType || "",
          location: formData.location || "",
          timeline: formData.timeline || "",
          requirements: formData.requirements,
          status: "New",
          created_at: new Date().toISOString(),
          source: "firebase-hosting-web",
        });
        submitted = true;
      }

      setStatus({
        message: result?.message || "Thank you! Your project enquiry has been submitted.",
        type: "success",
      });
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        projectType: "",
        location: "",
        timeline: "",
        requirements: "",
        website: "",
      });
    } catch (err) {
      setStatus({
        message: err.message || "Could not submit inquiry. Please call +91 96363 20419.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modern-site-wrapper">
      {/* Top Scroll Indicator Progress Bar */}
      <div
        className="top-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Floating Header */}
      <header className="modern-header">
        <div className="nav-container">
          <a href="#home" className="modern-brand" aria-label="Shree Shantinath Enterprises Home">
            <span className="brand-logo-frame">
              <img src="/images/brand-mark.svg" alt="" width="38" height="38" />
            </span>
            <div className="brand-copy">
              <span className="brand-title">SHREE SHANTINATH</span>
              <span className="brand-subtitle">ENTERPRISES</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="modern-nav-links" aria-label="Primary Navigation">
            <a href="#services" className="nav-item">Services</a>
            <a href="#estimator" className="nav-item nav-pill-item">
              <Sliders size={13} className="nav-pill-icon" />
              <span>Scope Estimator</span>
            </a>
            <a href="#approach" className="nav-item">Our Approach</a>
            <a href="#process" className="nav-item">Execution Process</a>

            {/* Safety Dropdown */}
            <div
              className={`nav-dropdown-wrap ${safetyMenuOpen ? "is-open" : ""}`}
              onMouseEnter={() => setSafetyMenuOpen(true)}
              onMouseLeave={() => setSafetyMenuOpen(false)}
            >
              <button
                type="button"
                className="nav-item nav-dropdown-btn"
                onClick={() => setSafetyMenuOpen((v) => !v)}
                aria-expanded={safetyMenuOpen}
              >
                <span>Safety &amp; Compliance</span>
                <ChevronDown size={14} className="dropdown-chevron" />
              </button>
              <div className="dropdown-glass-menu">
                <a href="/safety-policy" className="dropdown-link">
                  <ShieldCheck size={14} />
                  <div>
                    <strong>Safety Policy</strong>
                    <small>Zero-harm compliance &amp; risk governance</small>
                  </div>
                </a>
                <a href="/safety-training" className="dropdown-link">
                  <HardHat size={14} />
                  <div>
                    <strong>Safety Training Process</strong>
                    <small>Daily TBT, site drills &amp; worker induction</small>
                  </div>
                </a>
                <a href="/safety-organization" className="dropdown-link">
                  <Award size={14} />
                  <div>
                    <strong>Safety Organization</strong>
                    <small>On-site safety chain of command</small>
                  </div>
                </a>
              </div>
            </div>

            <a href="/admin/login" className="nav-item nav-pill-item" title="Administrative letterhead, invoices, and client leads portal"><span className="nav-pill-icon">⚡</span><span>Admin Login</span></a>
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light theme" : "Switch to gradient dark theme"}
              title={darkMode ? "Switch to light theme" : "Switch to gradient dark theme"}
            >
              {darkMode ? <Sun size={14} className="sun-icon" /> : <Moon size={14} className="moon-icon" />}
              <span className="theme-toggle-label">{darkMode ? "Light" : "Dark"}</span>
            </button>
            <a href="tel:+919636320419" className="phone-pill-link" title="Call directly">
              <Phone size={13} />
              <span>+91 96363 20419</span>
            </a>
            <a href="#contact" className="button button-accent button-sm">
              <span>Start Project</span>
              <ArrowUpRight size={14} />
            </a>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`burger-bar ${mobileMenuOpen ? "bar-1-open" : ""}`} />
              <span className={`burger-bar ${mobileMenuOpen ? "bar-2-open" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="mobile-drawer-inner">
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>What We Do</a>
            <a href="#estimator" onClick={() => setMobileMenuOpen(false)}>Interactive Scope Estimator</a>
            <a href="#approach" onClick={() => setMobileMenuOpen(false)}>Our Approach</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)}>Execution Workflow</a>
            <div style={{ padding: "8px 0" }}>
              <button
                type="button"
                className="theme-toggle-btn"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                {darkMode ? <Sun size={14} className="sun-icon" /> : <Moon size={14} className="moon-icon" />}
                <span>{darkMode ? "Switch to Light Mode" : "Switch to Gradient Dark Mode"}</span>
              </button>
            </div>
            <div className="mobile-drawer-sub">
              <span className="sub-header">Safety Frameworks:</span>
              <a href="/safety-policy">Safety Policy</a>
              <a href="/safety-training">Safety Training Process</a>
              <a href="/safety-organization">Safety Organization</a>
            </div>
            <a href="/admin/login" onClick={() => setMobileMenuOpen(false)}>⚡ Admin Login (Letterhead &amp; Invoices)</a>
            <div className="mobile-drawer-footer">
              <a href="#contact" className="button button-accent button-wide" onClick={() => setMobileMenuOpen(false)}>
                Discuss Your Project <ArrowUpRight size={14} />
              </a>
              <a href="tel:+919636320419" className="mobile-call-link">
                <Phone size={14} /> Call +91 96363 20419
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        {/* HERO SECTION */}
        <section className="modern-hero section-shell" id="home">
          <div className="hero-content-col reveal">
            {/* Live Operational Status Tag */}
            <div className="hero-status-pill">
              <span className="pulsing-beacon-dot" />
              <span className="status-label">{getRunningFinancialYear()} READY · GOVT. REGISTERED CIVIL & RENEWABLE INFRASTRUCTURE</span>
            </div>

            <h1 className="hero-display-title">
              Civil Infrastructure for Govt. Contracts &amp;{" "}
              <span className="gradient-highlight">Clean Energy.</span>
            </h1>

            <p className="hero-lead-text">
              Specialist heavy civil works, government PWD contracts, high-tolerance foundations, rapid repair, and turnkey infrastructure engineered for public works, utility-scale solar farms, and wind energy.
            </p>

            <div className="hero-actions-row">
              <a href="#estimator" className="button button-accent hero-primary-btn">
                <span>Configure Project Scope</span>
                <Sliders size={15} />
              </a>
              <a href="#contact" className="button button-glass hero-secondary-btn">
                <span>Start Direct Inquiry</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Quick Credentials / Trust Bar */}
            <div className="hero-trust-badges">
              <div className="trust-badge-item">
                <ShieldCheck size={16} className="badge-icon-green" />
                <span>Zero-Harm Safety (STP &amp; SOS)</span>
              </div>
              <div className="trust-badge-item">
                <Award size={16} className="badge-icon-gold" />
                <span>Registered MSME &amp; GST Certified</span>
              </div>
              <div className="trust-badge-item">
                <Truck size={16} className="badge-icon-cyan" />
                <span>Rapid Pan-India Mobilization</span>
              </div>
            </div>
          </div>

          {/* Hero Animated Graphics Col */}
          <div className="hero-graphic-col reveal">
            <InteractiveRenewableLandscape />
          </div>
        </section>

        {/* METRICS & CREDENTIALS COUNTER BAND */}
        <section className="metrics-ticker-section">
          <div className="section-shell">
            <div className="metrics-ticker-grid">
              {statsData.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="metric-ticker-card reveal" style={{ animationDelay: `${i * 120}ms` }}>
                    <div className="metric-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <div className="metric-data">
                      <span className="metric-val">{stat.value}</span>
                      <strong className="metric-name">{stat.label}</strong>
                      <small className="metric-sub">{stat.subtext}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERACTIVE SCOPE ESTIMATOR SECTION */}
        <ProjectScopeEstimator onSelectScope={handleScopeSelect} />

        {/* SERVICES SECTION WITH INTERACTIVE DETAIL CARDS */}
        <section className="modern-services-section section-shell" id="services">
          <div className="section-title-wrap reveal">
            <div className="section-eyebrow">
              <span className="eyebrow-dash" />
              <span>CORE CIVIL CAPABILITIES</span>
            </div>
            <h2>Engineered for the Rigors of Clean Energy Infrastructure</h2>
            <p>
              From first ground penetration and bulk earthworks to high-tolerance precision foundation pours and long-term asset refurbishment.
            </p>
          </div>

          {/* Interactive Service Filter Tabs */}
          <div className="services-tab-bar reveal">
            {servicesList.map((srv) => (
              <button
                key={srv.id}
                type="button"
                className={`service-tab-btn ${activeServiceTab === srv.id ? "is-active" : ""}`}
                onClick={() => setActiveServiceTab(srv.id)}
              >
                <span>{srv.number}.</span> {srv.title.split("&")[0]}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="services-showcase-grid">
            {servicesList.map((service) => {
              const Icon = service.icon;
              const isSelected = activeServiceTab === service.id;
              return (
                <article
                  key={service.id}
                  className={`service-featured-card card-${service.accentColor} ${isSelected ? "is-focused" : ""} reveal`}
                  onClick={() => setActiveServiceTab(service.id)}
                >
                  <div className="card-top-header">
                    <span className="card-number-tag">{service.number}</span>
                    <span className="card-sub-tag">{service.tag}</span>
                    <div className="card-icon-bubble">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-short-desc">{service.shortDesc}</p>
                  <p className="card-long-desc">{service.longDesc}</p>

                  <div className="card-specs-box">
                    <strong>Key Field Deliverables:</strong>
                    <ul>
                      {service.specs.map((sp) => (
                        <li key={sp}>
                          <Check size={13} className="spec-check" />
                          <span>{sp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-machinery-box">
                    <Truck size={14} className="machinery-icon" />
                    <span><b>Machinery Readiness:</b> {service.machinery}</span>
                  </div>

                  <div className="card-cta-footer">
                    <button
                      type="button"
                      className="card-inquire-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScopeSelect(service.title, service.title);
                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span>Inquire About {service.title.split(" ")[0]}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="service-footnote-strip reveal">
            <div className="footnote-item">
              <span className="sparkle-icon">✳</span>
              <span>Available for both <b>Own-Account Execution</b> and <b>EPC Sub-contracting</b></span>
            </div>
            <div className="footnote-item">
              <span className="sparkle-icon">✳</span>
              <span>Full compliance with Tata Power Renewable, Adani, ReNew &amp; NTPC site regulations</span>
            </div>
          </div>
        </section>

        {/* EXECUTION WORKFLOW TIMELINE */}
        <section className="workflow-section section-shell" id="process">
          <div className="section-title-wrap reveal">
            <div className="section-eyebrow">
              <span className="eyebrow-dash" />
              <span>THE ENGINEERING WORKFLOW</span>
            </div>
            <h2>From Raw Topography to Energized Generation</h2>
            <p>
              A proven 4-stage execution model designed to eliminate site delays, guarantee civil tolerances, and pass client quality audits on the first inspection.
            </p>
          </div>

          <div className="timeline-grid reveal">
            {executionPhases.map((phase, idx) => (
              <div key={phase.step} className="timeline-step-card">
                <div className="step-badge-row">
                  <span className="step-counter">{phase.step}</span>
                  <span className="step-highlight-pill">{phase.highlight}</span>
                </div>
                <h3 className="step-title">{phase.phase}</h3>
                <p className="step-desc">{phase.description}</p>
                <div className="step-connector" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        {/* APPROACH / WHY PARTNER WITH US */}
        <section className="approach-section" id="approach">
          <div className="section-shell">
            <div className="approach-layout">
              <div className="approach-copy-col reveal">
                <div className="section-eyebrow">
                  <span className="eyebrow-dash" />
                  <span>THE SSE ADVANTAGE</span>
                </div>
                <h2>Experienced Leadership Grounded in Field Reality</h2>
                <p>
                  Shree Shantinath Enterprises is an established civil contracting proprietorship led by <strong>Harsh Vardhan</strong>. We specialize exclusively in the renewable energy sector, understanding the unique time pressures, remote site logistics, and unforgiving soil dynamics that solar and wind developers face.
                </p>
                <p>
                  Every foundation poured, access road leveled, or stormwater berm compacted is executed with uncompromising integrity, strict safety oversight, and open communication.
                </p>

                <div className="approach-key-pillars">
                  <div className="pillar-item">
                    <div className="pillar-num">01</div>
                    <div>
                      <strong>Dual Engagement Agility</strong>
                      <p>Turnkey lump-sum or equipment &amp; squad unit-rate contracts tailored to your BOQ.</p>
                    </div>
                  </div>
                  <div className="pillar-item">
                    <div className="pillar-num">02</div>
                    <div>
                      <strong>Harsh-Terrain Mastery</strong>
                      <p>Specialized rock drilling, sand dune anchoring, and black-cotton soil solutions.</p>
                    </div>
                  </div>
                  <div className="pillar-item">
                    <div className="pillar-num">03</div>
                    <div>
                      <strong>Audit-Ready Documentation</strong>
                      <p>Full GST, MSME, VRF, STP, and test cube compressive strength certs on delivery.</p>
                    </div>
                  </div>
                </div>

                <div className="leadership-credentials">
                  <div className="leader-meta">
                    <span className="meta-label">PROPRIETOR &amp; PRINCIPAL</span>
                    <strong className="meta-name">Harsh Vardhan</strong>
                  </div>
                  <div className="leader-tax">
                    <div className="tax-item">
                      <span>GSTIN:</span> <b>08BOKPV8974D1Z5</b>
                      <CopyButton text="08BOKPV8974D1Z5" label="Copy" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Approach Visual Showcase Card */}
              <div className="approach-visual-col reveal">
                <div className="glass-showcase-panel">
                  <div className="panel-stamp">
                    <ShieldCheck size={16} />
                    <span>BUILT WITH INTEGRITY · ESTABLISHED FOR CLEAN ENERGY</span>
                  </div>
                  <blockquote className="panel-quote">
                    &ldquo;Quality civil engineering is invisible when done right — but it is the bedrock that allows a 500 MW solar plant to endure 25 years of desert sun, monsoon storms, and grid duty.&rdquo;
                  </blockquote>
                  <div className="panel-stats-list">
                    <div className="panel-stat-item">
                      <Ruler size={16} className="stat-ic" />
                      <div>
                        <strong>±2mm Foundation Tolerances</strong>
                        <small>Strict laser leveling for turbine anchor rings</small>
                      </div>
                    </div>
                    <div className="panel-stat-item">
                      <ShieldCheck size={16} className="stat-ic" />
                      <div>
                        <strong>100% Mandatory Safety Induction</strong>
                        <small>Every engineer &amp; worker trained before site entry</small>
                      </div>
                    </div>
                    <div className="panel-stat-item">
                      <Truck size={16} className="stat-ic" />
                      <div>
                        <strong>Complete In-House Fleet Coordination</strong>
                        <small>Graders, excavators, transit mixers and compactor rollers</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY & COMPLIANCE SECTION */}
        <section className="safety-hub-section section-shell" id="safety">
          <div className="section-title-wrap reveal">
            <div className="section-eyebrow">
              <span className="eyebrow-dash" />
              <span>SAFETY GOVERNANCE &amp; CERTIFICATION</span>
            </div>
            <h2>Zero Compromise. Total On-Site Responsibility.</h2>
            <p>
              In renewable energy civil contracting, speed never comes before safety. Review our verified Safety Frameworks and download tender-ready policy documentation.
            </p>
          </div>

          <div className="safety-cards-grid">
            {safetyDocuments.map((doc) => (
              <div key={doc.slug} className="safety-governance-card reveal">
                <div className="safety-card-top">
                  <span className="doc-code">{doc.code}</span>
                  <span className="doc-badge">{doc.badge}</span>
                </div>
                <h3 className="safety-card-title">{doc.title}</h3>
                <p className="safety-card-desc">{doc.desc}</p>
                <div className="safety-card-actions">
                  <a href={`/${doc.slug}`} className="view-policy-btn">
                    <span>Read Policy Details</span>
                    <ArrowRight size={14} />
                  </a>
                  <a
                    href={doc.download}
                    download
                    className="download-pdf-btn"
                    title={`Download ${doc.title} PDF`}
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="faq-section section-shell">
          <div className="section-title-wrap reveal">
            <div className="section-eyebrow">
              <span className="eyebrow-dash" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2>Clear Answers for Clean Energy Developers &amp; EPCs</h2>
          </div>

          <div className="faq-accordion-list reveal">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={faq.question} className={`faq-item-card ${isExpanded ? "is-expanded" : ""}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    aria-expanded={isExpanded}
                  >
                    <span className="faq-question-text">{faq.question}</span>
                    <span className="faq-chevron-icon">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="faq-answer-body">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* PROJECT CONSULTATION & ENQUIRY FORM */}
        <section className="contact-section section-shell" id="contact">
          <div className="contact-glass-grid">
            {/* Left Contact Information Column */}
            <div className="contact-info-col reveal">
              <div className="section-eyebrow">
                <span className="eyebrow-dash" />
                <span>START A CONVERSATION</span>
              </div>
              <h2>Tell Us What You&apos;re <span className="gradient-highlight">Building.</span></h2>
              <p className="contact-lead">
                Whether you need urgent storm repair, WTG foundation additions, or turnkey site development for an upcoming solar park tender, we are ready to assist.
              </p>

              <div className="direct-contact-tiles">
                <a href="tel:+919636320419" className="direct-tile">
                  <div className="tile-icon-box">
                    <Phone size={18} />
                  </div>
                  <div className="tile-info">
                    <small>DIRECT LINE (CALL / WHATSAPP)</small>
                    <strong>+91 96363 20419</strong>
                  </div>
                  <CopyButton text="+919636320419" label="Copy" className="tile-copy" />
                </a>

                <a href="mailto:shreeshantinath.enterprises25@gmail.com" className="direct-tile">
                  <div className="tile-icon-box">
                    <Mail size={18} />
                  </div>
                  <div className="tile-info">
                    <small>OFFICIAL INQUIRY INBOX</small>
                    <strong>shreeshantinath.enterprises25@gmail.com</strong>
                  </div>
                  <CopyButton text="shreeshantinath.enterprises25@gmail.com" label="Copy" className="tile-copy" />
                </a>

                <div className="direct-tile location-tile">
                  <div className="tile-icon-box">
                    <MapPin size={18} />
                  </div>
                  <div className="tile-info">
                    <small>OPERATIONAL HEADQUARTERS</small>
                    <strong>Rajasthan, India</strong>
                    <span className="coverage-pill">Serving Solar &amp; Wind Facilities Pan-India</span>
                  </div>
                </div>
              </div>

              {/* Tax & Legal Badges */}
              <div className="legal-credentials-box">
                <div className="cred-item">
                  <span className="cred-label">GST IDENTIFICATION NUMBER</span>
                  <strong className="cred-val">08BOKPV8974D1Z5</strong>
                </div>
                <div className="cred-item">
                  <span className="cred-label">STATE JURISDICTION</span>
                  <strong className="cred-val">Rajasthan (State Code: 08)</strong>
                </div>
                <div className="cred-item">
                  <span className="cred-label">ENTERPRISE CATEGORY</span>
                  <strong className="cred-val">Registered MSME Contractor</strong>
                </div>
              </div>
            </div>

            {/* Right Contact Form Column */}
            <div className="contact-form-col reveal">
              <form className="modern-enquiry-form" onSubmit={handleSubmit}>
                <div className="form-header-bar">
                  <h3>Project Inquiry &amp; Scope Review</h3>
                  <span className="required-hint">* Required fields</span>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <input
                      id="name-input"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Write your full name here (e.g. Vikramaditya Singh / Priya Sharma)"
                      maxLength={120}
                      value={formData.name}
                      onChange={handleFormChange}
                      aria-label="Your Full Name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <input
                      id="company-input"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Write your organization or EPC company (e.g. Renew / Tata Power / Adani Green)"
                      maxLength={160}
                      value={formData.company}
                      onChange={handleFormChange}
                      aria-label="Organization or Company"
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <input
                      id="email-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Write your official business email ID (e.g. contact@adani.com)"
                      maxLength={254}
                      value={formData.email}
                      onChange={handleFormChange}
                      aria-label="Official Business Email"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <input
                      id="phone-input"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Write your direct mobile / WhatsApp number (e.g. +91 96363 20419)"
                      maxLength={40}
                      value={formData.phone}
                      onChange={handleFormChange}
                      aria-label="Phone Number"
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <select
                      id="project-type-select"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleFormChange}
                      aria-label="Primary Service Needed"
                    >
                      <option value="">Select primary service category (e.g. Structural Enhancements, Piling)</option>
                      <option value="Structural enhancements">Structural Enhancements &amp; Plinths</option>
                      <option value="Repair & refurbishment">Repair, Refurbishment &amp; Grouting</option>
                      <option value="Preventive maintenance">Preventive Maintenance &amp; Drainage</option>
                      <option value="Site development">Turnkey Site Development &amp; Earthworks</option>
                      <option value="Other civil works">Other Specialized Civil Works</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <input
                      id="location-input"
                      name="location"
                      type="text"
                      placeholder="Write project site location (e.g. Bhadla Solar Park, Jodhpur, Rajasthan)"
                      maxLength={160}
                      value={formData.location}
                      onChange={handleFormChange}
                      aria-label="Project Site Location"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <select
                    id="timeline-select"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleFormChange}
                    aria-label="Target Execution Timeline"
                  >
                    <option value="">Select target execution timeline (e.g. Within 1 to 3 Months)</option>
                    <option value="As soon as possible">Immediate / Emergency Mobilization (ASAP)</option>
                    <option value="Within 1–3 months">Within 1 to 3 Months</option>
                    <option value="Within 3–6 months">Within 3 to 6 Months</option>
                    <option value="Planning / exploring">Planning / Budgetary Tender Stage</option>
                  </select>
                </div>

                <div className="form-field">
                  <textarea
                    id="requirements-input"
                    name="requirements"
                    rows={4}
                    placeholder="Write your project requirements and scope here (e.g. 50 MW Solar MMS piling, invertor room foundation, batching plant mobilization, trenching & boundary development...)"
                    maxLength={5000}
                    value={formData.requirements}
                    onChange={handleFormChange}
                    aria-label="Project Scope and Specifications"
                    required
                  />
                </div>

                {/* Honeypot field for anti-spam */}
                <div className="website-field" aria-hidden="true">
                  <input
                    id="website-field"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleFormChange}
                    aria-label="Anti-spam field"
                  />
                </div>

                <div className="form-action-row">
                  <button
                    type="submit"
                    className="button button-accent button-submit"
                    disabled={sending}
                  >
                    <span>{sending ? "Transmitting Scope..." : "Submit Project Inquiry"}</span>
                    {sending ? <RefreshCw size={15} className="spin-icon" /> : <ArrowUpRight size={15} />}
                  </button>
                  <span className="privacy-badge">
                    <ShieldCheck size={13} />
                    <span>Inquiry sent directly to executive leadership</span>
                  </span>
                </div>

                {/* Form feedback status */}
                {status.message && (
                  <div className={`form-feedback-pill ${status.type === "success" ? "is-success" : "is-error"}`}>
                    {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{status.message}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="modern-footer">
        <div className="section-shell">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <a href="#home" className="modern-brand">
                <span className="brand-logo-frame">
                  <img src="/images/brand-mark.svg" alt="" width="36" height="36" />
                </span>
                <div className="brand-copy">
                  <span className="brand-title">SHREE SHANTINATH</span>
                  <span className="brand-subtitle">ENTERPRISES</span>
                </div>
              </a>
              <p className="footer-tagline">
                Civil works, alteration, repair, maintenance, and heavy site development for India&apos;s clean energy future.
              </p>
              <div className="footer-tax-row">
                <span>GSTIN: 08BOKPV8974D1Z5</span>
                
              </div>
            </div>

            <div className="footer-links-col">
              <h4>Civil Services</h4>
              <ul>
                <li><a href="#services">Structural Enhancements</a></li>
                <li><a href="#services">Repair &amp; Refurbishment</a></li>
                <li><a href="#services">Preventive Maintenance</a></li>
                <li><a href="#services">Site Development &amp; Earthworks</a></li>
                <li><a href="#estimator">Interactive Scope Estimator</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4>Safety &amp; Compliance</h4>
              <ul>
                <li><a href="/safety-policy">Safety Policy (POL-01)</a></li>
                <li><a href="/safety-training">Safety Training Process (TRN-02)</a></li>
                <li><a href="/safety-organization">Safety Organization (ORG-03)</a></li>
                <li><a href="/documents/Safety-Policy-SSE.pdf" download>Download Safety Policy</a></li>
                <li><a href="/letterhead">⚡ Admin Login</a></li>
              </ul>
            </div>

            <div className="footer-contact-col">
              <h4>Direct Contact</h4>
              <p>
                <strong>Harsh Vardhan</strong><br />
                Proprietor, Shree Shantinath Enterprises
              </p>
              <a href="tel:+919636320419" className="footer-phone-link">
                <Phone size={13} /> +91 96363 20419
              </a>
              <a href="mailto:shreeshantinath.enterprises25@gmail.com" className="footer-email-link">
                <Mail size={13} /> shreeshantinath.enterprises25@gmail.com
              </a>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} Shree Shantinath Enterprises. All rights reserved.</span>
            <span className="footer-values">QUALITY &bull; SAFETY &bull; SUSTAINABILITY</span>
            <a href="#home" className="back-to-top-link">
              <span>Back to Top</span>
              <ArrowRight size={12} className="up-arrow" />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Quick Action Pill */}
      <aside className="floating-quick-dock" aria-label="Quick contact actions">
        <a
          href="https://wa.me/919636320419?text=Hello%20Shree%20Shantinath%20Enterprises,%20I%20would%20like%20to%20discuss%20a%20renewable%20energy%20civil%20works%20project."
          target="_blank"
          rel="noopener noreferrer"
          className="dock-btn dock-whatsapp"
          title="Chat on WhatsApp"
        >
          <Zap size={16} />
          <span>Quick WhatsApp</span>
        </a>
        <a href="tel:+919636320419" className="dock-btn dock-phone" title="Call Harsh Vardhan directly">
          <Phone size={16} />
          <span>Call Now</span>
        </a>
      </aside>
    </div>
  );
}

// Mount the App
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
