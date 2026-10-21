require("dotenv").config();

const path = require("node:path");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const session = require("express-session");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fdb = require("./firestore-db");

const app = express();
// Enable reverse proxy trust for Render, Cloudflare, Heroku, etc.
app.set("trust proxy", 1);
const port = Number(process.env.PORT) || 3000;
const contactEmail =
  process.env.CONTACT_EMAIL || "shreeshantinath.enterprises25@gmail.com";
const sessionSecret =
  process.env.SESSION_SECRET || "sse-jalore-session-secret-change-in-prod";
let databaseReady = true;
let viteServer;
const safetyDocuments = {
  policy: {
    slug: "safety-policy",
    title: "Safety Policy",
    pageTitle: "Safety Policy | Shree Shantinath Enterprises",
    description:
      "Read Shree Shantinath Enterprises' safety policy covering hazard assessment, PPE, training, emergency response and continuous improvement.",
    intro:
      "Our safety policy sets out a shared framework for protecting employees, contractors, visitors and stakeholders across construction project sites.",
    source: "/documents/Safety-Policy-SSE.pdf",
    sourceLabel: "Download the original Safety Policy PDF",
    sections: [
      {
        heading: "Our commitment",
        intro:
          "The policy's goal is zero harm through proactive risk management and continuous safety improvement.",
        items: [
          {
            title: "Prevent accidents",
            body: "Minimise risks and maintain a safe working environment.",
          },
          {
            title: "Meet applicable requirements",
            body: "Follow applicable legal requirements and industry safety standards.",
          },
          {
            title: "Keep improving",
            body: "Review safety practices and look for effective ways to strengthen them.",
          },
        ],
      },
      {
        heading: "Who and what it covers",
        intro:
          "The policy applies to employees, subcontractors, suppliers and visitors at company construction projects. It covers project activities from site preparation through building, installation and maintenance.",
        items: [],
      },
      {
        heading: "Everyone has a safety role",
        intro:
          "Safety is a shared responsibility, with clear duties at every level.",
        items: [
          {
            title: "Management",
            body: "Provide resources and training, and lead by example.",
          },
          {
            title: "Site supervisors",
            body: "Conduct briefings, enforce PPE requirements and monitor compliance.",
          },
          {
            title: "Employees and contractors",
            body: "Follow procedures, report hazards and take part in training.",
          },
          {
            title: "Safety officers",
            body: "Oversee risk assessments, incident investigations and audits.",
          },
        ],
      },
      {
        heading: "Assess hazards and control risks",
        intro:
          "Risks are assessed before work begins and revisited during operations. The policy calls out falls from height, electrical risks, machinery operation and material handling as hazards to identify and control.",
        items: [
          {
            title: "Identify",
            body: "Recognise potential dangers and keep the hazard register current.",
          },
          {
            title: "Assess",
            body: "Evaluate the likelihood and possible severity of harm.",
          },
          {
            title: "Control",
            body: "Use appropriate engineering and administrative controls, alongside PPE.",
          },
          {
            title: "Monitor",
            body: "Review whether controls remain effective as site conditions change.",
          },
        ],
      },
      {
        heading: "Personal protective equipment",
        intro:
          "Wear appropriate PPE for the task and site. The policy lists helmets, safety boots, high-visibility clothing, gloves, eye protection and harnesses where applicable.",
        items: [
          {
            title: "Use suitable equipment",
            body: "PPE should meet applicable standards and match the work being performed.",
          },
          {
            title: "Inspect and maintain",
            body: "Inspect PPE regularly, maintain it and replace it when needed.",
          },
          {
            title: "Know how to use it",
            body: "Personnel receive instruction on the correct use and disposal of PPE.",
          },
        ],
      },
      {
        heading: "Training and competency",
        intro:
          "New employees and contractors receive induction training on site-specific hazards and procedures. Refresher courses and toolbox talks reinforce safe practices, with specialised training for higher-risk work such as working at height, heavy machinery and electrical tasks. Training and certification records are maintained.",
        items: [],
      },
      {
        heading: "Report incidents and prepare for emergencies",
        intro:
          "Accidents, near misses and unsafe conditions should be reported promptly to site supervisors or safety officers so they can be addressed and investigated.",
        items: [
          {
            title: "Emergency arrangements",
            body: "Project sites should have marked evacuation routes, available first-aid facilities and clear communication protocols.",
          },
          {
            title: "Practice and review",
            body: "Emergency drills and procedure updates help personnel prepare to respond.",
          },
        ],
      },
      {
        heading: "Health, welfare and continuous improvement",
        intro:
          "The policy addresses clean drinking water, sanitation, rest areas, periodic medical check-ups, fatigue, heat stress, hazardous-substance exposure and mental wellbeing. Internal and external audits, safety indicators and feedback inform improvement; the policy is reviewed annually and updated when needed.",
        items: [],
      },
    ],
  },
  training: {
    slug: "safety-training",
    title: "Safety Training Process",
    pageTitle: "Safety Training | Shree Shantinath Enterprises",
    description:
      "Explore the safety training process described by Shree Shantinath Enterprises, from site induction and role-specific training to drills and refresher courses.",
    intro:
      "Training is designed to help people recognise site hazards, use safe work practices and respond effectively. The source document describes a staged process for construction teams.",
    source: "/documents/STP-SSE.pdf",
    sourceLabel: "Download the original Safety Training Process PDF",
    sections: [
      {
        heading: "01 · Induction for new employees",
        intro:
          "New starters receive a mandatory introduction before beginning site work.",
        items: [
          {
            title: "Site rules and emergencies",
            body: "Review company safety policies, site rules and emergency procedures.",
          },
          {
            title: "PPE and hazard awareness",
            body: "Cover correct PPE use and care, hazard signs, restricted areas and site-specific risks.",
          },
          {
            title: "Training acknowledgement",
            body: "Record that safety rules and induction training have been acknowledged.",
          },
        ],
      },
      {
        heading: "02 · Role-specific safety training",
        intro:
          "Training modules are tailored to roles including machine operators, scaffolders, electricians and general labourers.",
        items: [
          {
            title: "Tools and equipment",
            body: "Cover safe operation and maintenance of tools and machinery.",
          },
          {
            title: "Working at height",
            body: "Train workers on fall protection measures such as harnesses, safety nets and guardrails.",
          },
          {
            title: "Electrical safety and heat stress",
            body: "Address electrical hazards, lockout/tagout practices, live-circuit risks, hydration and heat-related illness awareness.",
          },
        ],
      },
      {
        heading: "03 · Drills and emergency preparedness",
        intro:
          "The process specifies quarterly evacuation drills for scenarios such as fire, structural collapse or medical emergencies, and first-aid training for designated responders.",
        items: [
          {
            title: "Routes and assembly points",
            body: "Communicate evacuation routes and assembly points through signage and briefings.",
          },
          {
            title: "Review the response plan",
            body: "Review emergency plans annually and after an incident, incorporating lessons and site changes.",
          },
        ],
      },
      {
        heading: "04 · Daily briefings and monitoring",
        intro:
          "Daily pre-shift toolbox talks highlight current hazards, safe work practices and changes in site conditions.",
        items: [
          {
            title: "Site inspections",
            body: "Supervisors check PPE use, equipment condition and housekeeping.",
          },
          {
            title: "Inspection checklist",
            body: "Use a systematic checklist to review equipment and work areas.",
          },
          {
            title: "Speak up",
            body: "Workers are encouraged to report unsafe conditions and near misses without fear of reprisal.",
          },
        ],
      },
      {
        heading: "05 · Incident reporting and investigation",
        intro:
          "Report accidents, injuries and unsafe acts promptly so assistance and investigation can begin without delay.",
        items: [
          {
            title: "Find root causes",
            body: "Investigations look beyond immediate events to identify underlying causes and prevent recurrence.",
          },
          {
            title: "Share lessons",
            body: "Communicate findings to employees to support collective learning.",
          },
          {
            title: "Keep records",
            body: "Document incidents and investigations for compliance and audit purposes.",
          },
        ],
      },
      {
        heading: "06 · Refresher training and skill development",
        intro:
          "Annual refresher courses update safety knowledge, while new equipment or work methods prompt specialised, hands-on training.",
        items: [
          {
            title: "Maintain competency",
            body: "Refresh existing knowledge and cover relevant changes in regulations, technology and safe practices.",
          },
          {
            title: "Record and certify",
            body: "Document inductions, role-specific modules and refreshers, and maintain completion and certification records.",
          },
        ],
      },
    ],
  },
  organization: {
    slug: "safety-organization",
    title: "Safety Organization",
    pageTitle: "Safety Organization | Shree Shantinath Enterprises",
    description:
      "Learn how Shree Shantinath Enterprises describes safety responsibilities, site supervision, worker training and safety communication.",
    intro:
      "The safety organization document describes a clear chain of responsibility, specialist oversight and safety integration across project teams.",
    source: "/documents/SOS-SSE.pdf",
    sourceLabel: "Download the original Safety Organization Structure PDF",
    sections: [
      {
        heading: "Safety leadership and responsibilities",
        intro:
          "The structure connects proprietor-level accountability with frontline site safety and worker participation.",
        items: [
          {
            title: "Proprietor",
            body: "Provides overall leadership and accountability for the safety framework.",
          },
          {
            title: "Safety manager",
            body: "Leads safety planning, policy development, program oversight and reporting, and is empowered to halt unsafe work and require corrective action.",
          },
          {
            title: "Safety officers and coordinators",
            body: "Support site inspections, hazard assessments, training, incident investigations, documentation, compliance tracking and audit support.",
          },
          {
            title: "Engineers and supervisors",
            body: "Integrate safety into technical planning, coordinate work, enforce site protocols and support emergency response.",
          },
          {
            title: "Skilled and unskilled workers",
            body: "Carry out work safely, use appropriate PPE, recognise hazards and report concerns, with training suited to their roles.",
          },
        ],
      },
      {
        heading: "Safety built into project work",
        intro:
          "Safety personnel are integrated with project teams from the outset. The document describes daily job safety analyses, cross-functional safety committees, and real-time incident reporting and corrective-action processes.",
        items: [
          {
            title: "Communication",
            body: "Regular safety meetings carry information from management to field teams.",
          },
          {
            title: "Accountability",
            body: "Each level is responsible for implementing and monitoring safety practices.",
          },
          {
            title: "Worker feedback",
            body: "Frontline observations and concerns should reach decision-makers to support ongoing improvement.",
          },
        ],
      },
      {
        heading: "Training matched to work",
        intro:
          "The organization document describes role-relevant training for the people doing and supervising the work.",
        items: [
          {
            title: "Technical and site leadership",
            body: "Engineers and supervisors support design review, safety integration, work coordination and site protocol enforcement.",
          },
          {
            title: "Trade-specific awareness",
            body: "Skilled trades receive training related to their work, including fall protection, power-tool safety, electrical safety and equipment operation.",
          },
          {
            title: "Foundational orientation",
            body: "General site workers receive orientation on manual handling, fall prevention, environmental hazards and PPE.",
          },
        ],
      },
      {
        heading: "Review, audits and performance",
        intro:
          "Regular internal and external audits help verify practices and identify gaps. Safety indicators, corrective actions and workforce feedback inform improvement and engagement.",
        items: [
          {
            title: "Training programs",
            body: "Provide initial and refresher training for different personnel levels.",
          },
          {
            title: "Safety audits",
            body: "Review compliance and identify opportunities to address gaps.",
          },
          {
            title: "Performance measures",
            body: "Use safety indicators to monitor leading and lagging performance.",
          },
        ],
      },
    ],
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "script-src-attr": ["'unsafe-inline'"],
        "connect-src": [
          "'self'",
          ...(process.env.NODE_ENV === "development"
            ? ["ws://localhost:*", "ws://127.0.0.1:*"]
            : []),
        ],
        "frame-src": ["'self'", "blob:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  }),
);
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (
        filePath.includes("assets") ||
        filePath.includes("favicons") ||
        filePath.includes("images")
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);
app.use((request, response, next) => {
  if (viteServer) {
    return viteServer.middlewares(request, response, next);
  }
  return next();
});
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(express.json({ limit: "32kb" }));
const adminSessionMiddleware = session({
  name: "sse_admin_session",
  secret: sessionSecret,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  },
});

app.use(
  ["/letterhead", "/admin"],
  (_request, response, next) => {
    response.set("X-Robots-Tag", "noindex, nofollow");
    if (!databaseReady) {
      return response
        .status(503)
        .send("The private admin area is unavailable until Firebase Firestore is ready.");
    }
    next();
  },
  adminSessionMiddleware,
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many sign-in attempts. Please try again in 15 minutes.",
});

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many enquiries from this network. Please try again in 15 minutes.",
  },
});

const fieldLimits = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  projectType: 100,
  location: 160,
  timeline: 100,
  requirements: 5000,
};

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function issueCsrfToken(request) {
  request.session.csrfToken = crypto.randomBytes(32).toString("hex");
  return request.session.csrfToken;
}

function requireAdmin(request, response, next) {
  if (request.session?.isLetterheadAdmin) {
    response.set("Cache-Control", "no-store");
    return next();
  }

  if (request.accepts("html")) {
    return response.redirect("/admin/login");
  }
  return response.status(401).json({ error: "Administrator sign-in required." });
}

function requireCsrf(request, response, next) {
  const providedToken = clean(request.body?._csrf);
  const expectedToken = request.session?.csrfToken;
  if (
    !providedToken ||
    !expectedToken ||
    providedToken.length !== expectedToken.length ||
    !crypto.timingSafeEqual(Buffer.from(providedToken), Buffer.from(expectedToken))
  ) {
    if (request.path.includes("login")) {
      return response.status(403).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Your session expired. Please sign in again.",
        message: "",
        mode: "login",
        pageTitle: "Admin Sign In",
        values: { email: clean(request.body?.email) },
      });
    }
    if (request.path.includes("forgot-password")) {
      return response.status(403).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Your session expired. Please enter your email again.",
        message: "",
        mode: "forgot-password",
        pageTitle: "Forgot Password",
        values: { email: clean(request.body?.email) },
      });
    }
    if (request.path.includes("verify-otp")) {
      return response.status(403).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Your session expired. Please sign in again.",
        message: "",
        mode: "verify-otp",
        pageTitle: "Security Verification",
        values: {},
      });
    }
    if (request.accepts("html")) {
      return response.redirect("/admin/login?error=session_expired");
    }
    return response.status(403).send("Your session expired. Please try again.");
  }
  return next();
}

function validateLetterheadDocument(body) {
  const values = {
    title: clean(body.title),
    date: clean(body.date),
    recipient: clean(body.recipient),
    subject: clean(body.subject),
    reference: clean(body.reference),
    content: typeof body.content === "string" ? body.content.trim() : "",
  };
  const limits = {
    title: 160,
    recipient: 500,
    subject: 300,
    reference: 100,
    content: 20000,
  };

  for (const [field, maxLength] of Object.entries(limits)) {
    if (values[field].length > maxLength) {
      return { values, error: `${field} must be ${maxLength} characters or fewer.` };
    }
  }

  if (!values.title || !values.content) {
    return { values, error: "Document title and letter content are required." };
  }

  if (values.date) {
    const date = new Date(`${values.date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== values.date
    ) {
      return { values, error: "Please enter a valid document date." };
    }
  }

  return { values };
}

function safeFilename(title) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${slug || "letterhead-document"}.pdf`;
}

function wrapPdfText(text, font, fontSize, maxWidth) {
  const lines = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const safeWord = printablePdfText(word);
      const candidate = line ? `${line} ${safeWord}` : safeWord;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        line = candidate;
        continue;
      }

      if (line) {
        lines.push(line);
      }
      line = "";
      for (const character of safeWord) {
        const candidateCharacter = line + character;
        if (font.widthOfTextAtSize(candidateCharacter, fontSize) > maxWidth && line) {
          lines.push(line);
          line = character;
        } else {
          line = candidateCharacter;
        }
      }
    }
    if (line) {
      lines.push(line);
    }
  }
  return lines;
}

function printablePdfText(value) {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[·•]/g, "·")
    .replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
}

const { createLetterheadPdf } = require("./letterhead-pdf");
const { createInvoicePdf, numberToWordsINR } = require("./invoice-pdf");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(key, "hex"));
}

function checkAdminPassword(password, stored) {
  if (!password || !stored) return false;
  if (stored.includes(":")) {
    try {
      if (verifyPassword(password, stored)) return true;
    } catch (_e) {}
  }
  if (password === stored) return true;
  try {
    const sha = crypto.createHash("sha256").update(password).digest("hex");
    if (sha === stored) return true;
  } catch (_e) {}
  return false;
}

async function getAdminCount() {
  return await fdb.getAdminCount();
}

async function sendAdminOtpEmail({ to, otp, type = "login", name = "Administrator" }) {
  const isReg = type === "registration";
  const isReset = type === "reset";
  const subject = isReg
    ? `Shree Shantinath Enterprises — First-Time Admin Verification: ${otp}`
    : isReset
    ? `Shree Shantinath Enterprises — Password Reset OTP: ${otp}`
    : `Shree Shantinath Enterprises — Admin Login OTP: ${otp}`;
  const text = `Hello ${name},\n\nYour security verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, please call +91 96363 20419.`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7f9f6; padding: 28px 16px; color: #071a14;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #dce4de; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <div style="background: #0d2820; padding: 20px 24px; border-bottom: 3px solid #d4af37;">
          <h2 style="margin: 0; color: #ffffff; font-size: 16px; letter-spacing: 1px;">SHREE SHANTINATH ENTERPRISES</h2>
          <p style="margin: 4px 0 0; color: #f5cb74; font-size: 11px; letter-spacing: 1px;">ADMINISTRATION TWO-FACTOR AUTHENTICATION</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 14px;">Hello <strong>${escapeHtml(name)}</strong>,</p>
          <p style="margin: 0 0 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            ${isReg ? "Use the one-time code below to verify your email and complete your first-time admin registration:" : isReset ? "Use the one-time security code (OTP) below to reset your administrator password:" : "Use the one-time security code (OTP) below to authenticate your admin sign-in:"}
          </p>
          <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 22px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #0d2820;">${otp}</span>
            <p style="margin: 8px 0 0; font-size: 11px; color: #059669;">Valid for 10 minutes</p>
          </div>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
            Sent to: ${escapeHtml(to)}. If you did not initiate this, please call +91 96363 20419.
          </p>
        </div>
      </div>
    </div>
  `;

  console.log("\n========================================================");
  console.log(`🔐 [ADMIN ${type.toUpperCase()} OTP]: ${otp} for ${to}`);
  console.log("========================================================\n");

  const resendKey = process.env.RESEND_API_KEY;
  const emailSender = process.env.EMAIL_FROM || "onboarding@resend.dev";
  if (resendKey && emailSender) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailSender,
          to: [to],
          subject,
          text,
          html,
        }),
      });
    } catch (e) {
      console.warn("Resend email dispatch notice:", e.message);
    }
  }
}


async function sendInvoiceEmailToAdmin(invoice, recipientEmail) {
  if (!invoice) return;
  try {
    const to = recipientEmail || contactEmail || "shreeshantinath.enterprises25@gmail.com";
    const pdfBytes = await createInvoicePdf(invoice);
    const pdfBuffer = Buffer.isBuffer(pdfBytes) ? pdfBytes : Buffer.from(pdfBytes);
    const safeInvNo = invoice.invoice_number || `INV-${invoice.id}`;
    const filename = `Tax-Invoice-${String(safeInvNo).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    const subject = `Shree Shantinath Enterprises — Tax Invoice Saved: ${safeInvNo} (${invoice.client_name || "Client"})`;
    const text = `Hello Administrator,\n\nA GST Tax Invoice has been generated and saved.\n\nInvoice Number: ${safeInvNo}\nDate: ${invoice.invoice_date}\nClient: ${invoice.client_name}\nTotal Amount: INR ${Number(invoice.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n\nPlease find the official PDF attached.\n\nShree Shantinath Enterprises`;

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f7f9f6; padding: 28px 16px; color: #071a14;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #dce4de; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: #0d2820; padding: 20px 24px; border-bottom: 3px solid #d4af37;">
            <h2 style="margin: 0; color: #ffffff; font-size: 16px; letter-spacing: 1px;">SHREE SHANTINATH ENTERPRISES</h2>
            <p style="margin: 4px 0 0; color: #f5cb74; font-size: 11px; letter-spacing: 1px;">OFFICIAL GST TAX INVOICE DISPATCH</p>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 14px; font-size: 14px;">Hello <strong>Administrator</strong>,</p>
            <p style="margin: 0 0 18px; font-size: 13px; color: #475569; line-height: 1.6;">
              A GST Tax Invoice has been saved in the administrative portal. The official compliance PDF is attached to this email.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Invoice No:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0d2820;">${escapeHtml(safeInvNo)}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Invoice Date:</td><td style="padding: 8px 0; text-align: right;">${escapeHtml(invoice.invoice_date || "")}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Client Name:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${escapeHtml(invoice.client_name || "")}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Client GSTIN:</td><td style="padding: 8px 0; text-align: right;">${escapeHtml(invoice.client_gstin || "N/A")}</td></tr>
              <tr style="border-bottom: 2px solid #0d2820;"><td style="padding: 10px 0; font-size: 14px; font-weight: bold; color: #0d2820;">Total Invoice Amount:</td><td style="padding: 10px 0; font-size: 16px; font-weight: bold; text-align: right; color: #059669;">INR ${Number(invoice.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
            </table>
            <p style="margin: 0; font-size: 11px; color: #64748b;">
              Official record generated via Shree Shantinath Enterprises Portal.
            </p>
          </div>
        </div>
      </div>
    `;

    console.log(`\n📧 [INVOICE EMAIL]: Sending PDF for ${safeInvNo} to ${to}`);

    const resendKey = process.env.RESEND_API_KEY;
    const emailSender = process.env.EMAIL_FROM || "onboarding@resend.dev";
    if (resendKey && emailSender) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailSender,
          to: [to],
          subject,
          text,
          html,
          attachments: [
            {
              filename,
              content: pdfBuffer.toString("base64"),
            },
          ],
        }),
      });
      console.log(`✅ [INVOICE EMAIL DISPATCHED] via Resend to ${to}`);
    } else {
      console.log(`ℹ️ [INVOICE EMAIL]: PDF generated (${filename}, ${pdfBuffer.length} bytes). Email dispatch simulated.`);
    }
  } catch (err) {
    console.warn("Could not email invoice PDF to admin:", err.message);
  }
}

function calculateInvoiceFields(body) {
  const client_name = clean(body.client_name);
  const client_gstin = clean(body.client_gstin).toUpperCase();
  const client_pan = clean(body.client_pan).toUpperCase();
  const client_address = typeof body.client_address === "string" ? body.client_address.trim() : "";
  const client_state = clean(body.client_state) || "Rajasthan";
  const place_of_supply = clean(body.place_of_supply) || "Rajasthan (08)";
  const project_site = typeof body.project_site === "string" ? body.project_site.trim() : "";
  const invoice_number = clean(body.invoice_number);
  const invoice_date = clean(body.invoice_date) || new Date().toISOString().slice(0, 10);
  const due_date = clean(body.due_date) || null;
  const work_order_no = clean(body.work_order_no);
  const work_order_date = clean(body.work_order_date) || null;
  const reverse_charge = body.reverse_charge === "true" || body.reverse_charge === true;
  const status = clean(body.status) || "Pending";
  const tax_type = clean(body.tax_type) || "intra";

  const descArr = Array.isArray(body["item_description[]"]) ? body["item_description[]"] : [body["item_description[]"]].filter(Boolean);
  const sacArr = Array.isArray(body["item_sac[]"]) ? body["item_sac[]"] : [body["item_sac[]"]].filter(Boolean);
  const unitArr = Array.isArray(body["item_unit[]"]) ? body["item_unit[]"] : [body["item_unit[]"]].filter(Boolean);
  const qtyArr = Array.isArray(body["item_quantity[]"]) ? body["item_quantity[]"] : [body["item_quantity[]"]].filter(Boolean);
  const rateArr = Array.isArray(body["item_rate[]"]) ? body["item_rate[]"] : [body["item_rate[]"]].filter(Boolean);

  const items = [];
  let subtotal = 0;

  for (let i = 0; i < descArr.length; i++) {
    const desc = clean(descArr[i]);
    if (!desc) continue;
    const sac = clean(sacArr[i]) || "995434";
    const unit = clean(unitArr[i]) || "MW";
    const qty = Math.max(0, Number(qtyArr[i]) || 0);
    const rate = Math.max(0, Number(rateArr[i]) || 0);
    const amount = Math.round(qty * rate * 100) / 100;
    subtotal += amount;

    items.push({
      description: desc,
      sac_code: sac,
      unit,
      quantity: qty,
      rate,
      amount,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  let cgst_rate = 0, cgst_amount = 0;
  let sgst_rate = 0, sgst_amount = 0;
  let igst_rate = 0, igst_amount = 0;

  if (tax_type === "inter") {
    igst_rate = 18;
    igst_amount = Math.round(subtotal * 0.18 * 100) / 100;
  } else {
    cgst_rate = 9;
    cgst_amount = Math.round(subtotal * 0.09 * 100) / 100;
    sgst_rate = 9;
    sgst_amount = Math.round(subtotal * 0.09 * 100) / 100;
  }

  const total_amount = Math.round((subtotal + cgst_amount + sgst_amount + igst_amount) * 100) / 100;
  const amount_in_words = numberToWordsINR(total_amount);

  return {
    invoice_number,
    invoice_date,
    due_date,
    work_order_no,
    work_order_date,
    client_name,
    client_gstin,
    client_pan,
    client_address,
    client_state,
    place_of_supply,
    project_site,
    reverse_charge,
    items,
    subtotal,
    cgst_rate,
    cgst_amount,
    sgst_rate,
    sgst_amount,
    igst_rate,
    igst_amount,
    total_amount,
    amount_in_words,
    bank_name: clean(body.bank_name) || "State Bank of India",
    bank_account_no: clean(body.bank_account_no) || "38920194821",
    bank_ifsc: clean(body.bank_ifsc) || "SBIN0031168",
    bank_branch: clean(body.bank_branch) || "Jalore Main Branch, Rajasthan",
    terms_conditions: typeof body.terms_conditions === "string" ? body.terms_conditions.trim() : "",
    notes: typeof body.notes === "string" ? body.notes.trim() : "",
    status,
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function validateEnquiry(body) {
  const values = Object.fromEntries(
    Object.keys(fieldLimits).map((field) => [field, clean(body[field])]),
  );

  if (clean(body.website)) {
    return { values, error: "Unable to process this enquiry." };
  }

  for (const [field, maxLength] of Object.entries(fieldLimits)) {
    if (values[field].length > maxLength) {
      return {
        values,
        error: `${field} must be ${maxLength} characters or fewer.`,
      };
    }
  }

  if (!values.name || !values.email || !values.requirements) {
    return {
      values,
      error: "Please complete your name, email address, and project requirements.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { values, error: "Please enter a valid email address." };
  }

  return { values };
}

async function sendEnquiryEmail(enquiry) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
  }

  const fields = [
    ["Name", enquiry.name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Project type", enquiry.projectType],
    ["Project location", enquiry.location],
    ["Timeline", enquiry.timeline],
    ["Requirements", enquiry.requirements],
  ];
  const submittedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const formatValue = (value) =>
    value
      ? escapeHtml(value).replace(/\r?\n/g, "<br>")
      : '<span style="color:#778175">Not provided</span>';
  const html = `
    <div style="margin:0;background:#f5f6ef;padding:32px 16px;font-family:Arial,sans-serif;color:#20382e">
      <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e1e6dc">
        <div style="padding:24px 28px;background:#183c32;color:#fff">
          <p style="margin:0 0 8px;color:#e4c46f;font-size:12px;letter-spacing:2px">SHREE SHANTINATH ENTERPRISES</p>
          <h1 style="margin:0;font-size:22px;font-weight:600">New project enquiry</h1>
          <p style="margin:10px 0 0;color:#e5e9e1;font-size:13px">Received ${escapeHtml(submittedAt)} (IST)</p>
        </div>
        <div style="padding:24px 28px">
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6">
            <tbody>${fields
              .map(
                ([label, value], index) => `
                  <tr style="background:${index % 2 ? "#f5f6ef" : "#fff"}">
                    <th scope="row" style="width:165px;padding:12px;text-align:left;vertical-align:top;color:#536257;border-bottom:1px solid #e7e9e1">${label}</th>
                    <td style="padding:12px;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid #e7e9e1">${formatValue(value)}</td>
                  </tr>`,
              )
              .join("")}
            </tbody>
          </table>
          <p style="margin:20px 0 0;color:#778175;font-size:12px">Reply to this email to contact the client directly.</p>
        </div>
      </div>
    </div>`;
  const text = [
    "SHREE SHANTINATH ENTERPRISES — NEW PROJECT ENQUIRY",
    `Received: ${submittedAt} (IST)`,
    "",
    ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`),
    "",
    "Reply to this email to contact the client directly.",
  ].join("\n");

  const resendKey = process.env.RESEND_API_KEY;
  const emailSender = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailSender,
      to: [contactEmail],
      reply_to: enquiry.email,
      subject: `New project enquiry from ${enquiry.name}`,
      html,
      text,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      `Resend API returned ${response.status}: ${result.message || result.name || "Email delivery failed."}`,
    );
  }

  if (!result.id) {
    throw new Error("Resend accepted no email ID for the enquiry notification.");
  }

  return result.id;
}

app.get("/", async (request, response, next) => {
  if (viteServer) {
    try {
      const source = await fs.readFile(
        path.join(__dirname, "client", "index.html"),
        "utf8",
      );
      const html = await viteServer.transformIndexHtml(request.originalUrl, source);
      return response.status(200).type("html").send(html);
    } catch (error) {
      return next(error);
    }
  }
    response.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response.sendFile(path.join(__dirname, "public", "react", "index.html"));
});

for (const document of Object.values(safetyDocuments)) {
  app.get(`/${document.slug}`, (_request, response) => {
    response.render("safety", { document, safetyDocuments });
  });
}

app.get("/letterhead/template", requireAdmin, async (_request, response) => {
  try {
    const pdf = await createLetterheadPdf({
      title: "",
      date: "",
      recipient: "",
      subject: "",
      reference: "",
      content: "",
    });
    response.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Shree-Shantinath-Letterhead.pdf"',
      "Cache-Control": "no-store",
    });
    return response.send(pdf);
  } catch (error) {
    console.error("Could not generate letterhead preview:", error);
    return response.status(500).send("Could not generate the letterhead preview.");
  }
});

app.get("/admin", (request, response) => {
  if (request.session?.isLetterheadAdmin) {
    return response.redirect("/letterhead");
  }
  return response.redirect("/admin/login");
});

app.get(["/admin/login", "/letterhead/login"], (request, response) => {
  if (request.session?.isLetterheadAdmin) {
    return response.redirect("/letterhead");
  }
  response.set("Cache-Control", "no-store");
  const csrfToken = issueCsrfToken(request);
  response.render("admin-login", {
    csrfToken,
    error: "",
    message: request.query.message || "",
    mode: "login",
    pageTitle: "Admin Sign In",
  });
});

app.post(
  ["/admin/login", "/letterhead/login"],
  loginLimiter,
  requireCsrf,
  async (request, response) => {
    const email = clean(request.body.email).toLowerCase();
    const password = clean(request.body.password);

    if (!email || !password) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Please enter your administrator email and password.",
        mode: "login",
        values: { email },
        pageTitle: "Admin Sign In",
      });
    }

    let admin = null;
    try {
      admin = await fdb.getAdminByEmail(email);
    } catch (e) {
      console.warn("Notice: Checking admin in Firestore:", e.message);
    }

    let validCredentials = false;
    let adminName = "Harsh Vardhan";
    let adminMobile = "+91 96363 20419";
    let adminId = "admin-1";

    if (admin && admin.password_hash) {
      if (checkAdminPassword(password, admin.password_hash)) {
        validCredentials = true;
        adminName = admin.name || adminName;
        adminMobile = admin.mobile || adminMobile;
        adminId = admin.id;
      }
    }

    if (!validCredentials) {
      return response.status(401).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Invalid email address or password. Please try again.",
        mode: "login",
        values: { email },
        pageTitle: "Admin Sign In",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    request.session.pendingLogin = {
      id: adminId,
      name: adminName,
      email: email,
      mobile: adminMobile,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    try {
      await sendAdminOtpEmail({ to: email, otp, type: "login", name: adminName });
    } catch (err) {
      console.warn("Could not dispatch login OTP:", err.message);
    }

    return response.redirect("/admin/verify-otp");
  },
);

app.get(["/admin/verify-otp", "/letterhead/verify-otp"], (request, response) => {
  if (!request.session?.pendingLogin) {
    return response.redirect("/admin/login");
  }
  response.set("Cache-Control", "no-store");
  return response.render("admin-login", {
    csrfToken: issueCsrfToken(request),
    error: "",
    message: request.query.message || "",
    mode: "verify-otp",
    pendingEmail: request.session.pendingLogin.email,
    pageTitle: "Two-Factor Verification",
  });
});

app.post(
  ["/admin/verify-otp", "/letterhead/verify-otp"],
  requireCsrf,
  (request, response, next) => {
    const pending = request.session?.pendingLogin;
    if (!pending || Date.now() > pending.expiresAt) {
      delete request.session.pendingLogin;
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Security OTP expired. Please sign in again.",
        mode: "login",
        pageTitle: "Admin Sign In",
      });
    }

    const enteredOtp = clean(request.body.otp);
    if (!enteredOtp || enteredOtp !== pending.otp) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Incorrect 6-digit OTP code. Please check your email or server log and try again.",
        mode: "verify-otp",
        pendingEmail: pending.email,
        pageTitle: "Two-Factor Verification",
      });
    }

    const adminUser = {
      id: pending.id,
      name: pending.name,
      email: pending.email,
      mobile: pending.mobile,
    };

    delete request.session.pendingLogin;
    request.session.regenerate((err) => {
      if (err) return next(err);
      request.session.isLetterheadAdmin = true;
      request.session.adminUser = adminUser;
      request.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        return response.redirect("/letterhead");
      });
    });
  },
);

app.post(["/admin/resend-otp", "/letterhead/resend-otp"], requireCsrf, async (request, response) => {
  const pending = request.session?.pendingLogin;
  if (!pending) {
    return response.redirect("/admin/login");
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = newOtp;
  pending.expiresAt = Date.now() + 10 * 60 * 1000;

  try {
    await sendAdminOtpEmail({
      to: pending.email,
      otp: newOtp,
      type: "login",
      name: pending.name,
    });
  } catch (err) {
    console.warn("Could not resend OTP:", err.message);
  }

  return response.redirect("/admin/verify-otp?message=A+new+security+OTP+has+been+sent");
});

// ----------------------------------------------------
// FORGOT & RESET PASSWORD ROUTES
// ----------------------------------------------------
app.get(["/admin/forgot-password", "/letterhead/forgot-password"], (request, response) => {
  if (request.session?.isLetterheadAdmin) {
    return response.redirect("/letterhead");
  }
  response.set("Cache-Control", "no-store");
  return response.render("admin-login", {
    csrfToken: issueCsrfToken(request),
    error: "",
    message: request.query.message || "",
    mode: "forgot-password",
    pageTitle: "Forgot Password",
    values: {},
  });
});

app.post(
  ["/admin/forgot-password", "/letterhead/forgot-password"],
  loginLimiter,
  requireCsrf,
  async (request, response) => {
    const email = clean(request.body.email).toLowerCase();
    if (!email) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Please enter your administrator email ID.",
        mode: "forgot-password",
        pageTitle: "Forgot Password",
        values: { email },
      });
    }

    let admin = null;
    try {
      admin = await fdb.getAdminByEmail(email);
    } catch (e) {
      console.warn("Notice checking admin in database:", e.message);
    }

    const isMasterEmail =
      email === contactEmail.toLowerCase() ||
      email === "shreeshantinath.enterprises25@gmail.com";

    if (!admin && !isMasterEmail) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "No administrator found with this email ID. Please check the address or contact support.",
        mode: "forgot-password",
        pageTitle: "Forgot Password",
        values: { email },
      });
    }

    const adminName = admin?.name || "Harsh Vardhan";
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    request.session.pendingReset = {
      email,
      name: adminName,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    try {
      await sendAdminOtpEmail({
        to: email,
        otp,
        type: "reset",
        name: adminName,
      });
    } catch (err) {
      console.warn("Could not dispatch reset OTP:", err.message);
    }

    return response.redirect("/admin/reset-password");
  }
);

app.get(["/admin/reset-password", "/letterhead/reset-password"], (request, response) => {
  if (!request.session?.pendingReset) {
    return response.redirect("/admin/forgot-password");
  }
  response.set("Cache-Control", "no-store");
  return response.render("admin-login", {
    csrfToken: issueCsrfToken(request),
    error: "",
    message: request.query.message || "",
    mode: "reset-password",
    pendingEmail: request.session.pendingReset.email,
    pageTitle: "Reset Password",
  });
});

app.post(
  ["/admin/reset-password", "/letterhead/reset-password"],
  requireCsrf,
  async (request, response) => {
    const pending = request.session?.pendingReset;
    if (!pending || Date.now() > pending.expiresAt) {
      delete request.session.pendingReset;
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Reset verification code expired. Please request a new code.",
        mode: "forgot-password",
        pageTitle: "Forgot Password",
      });
    }

    const enteredOtp = clean(request.body.otp);
    const newPassword = clean(request.body.newPassword);
    const confirmPassword = clean(request.body.confirmPassword);

    if (!enteredOtp || enteredOtp !== pending.otp) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Incorrect 6-digit verification code. Please check your email or server log and try again.",
        mode: "reset-password",
        pendingEmail: pending.email,
        pageTitle: "Reset Password",
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "New password must be at least 8 characters long.",
        mode: "reset-password",
        pendingEmail: pending.email,
        pageTitle: "Reset Password",
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).render("admin-login", {
        csrfToken: issueCsrfToken(request),
        error: "Passwords do not match. Please verify and re-enter.",
        mode: "reset-password",
        pendingEmail: pending.email,
        pageTitle: "Reset Password",
      });
    }

    const newHash = hashPassword(newPassword);

    try {
      await fdb.updateAdminPassword(pending.email, newHash);
    } catch (e) {
      console.warn("Could not save new password in Firestore:", e.message);
    }

    delete request.session.pendingReset;

    return response.redirect("/admin/login?message=Password+updated+successfully.+Please+sign+in+with+your+new+password.");
  }
);


// ----------------------------------------------------
// CLIENT ENQUIRIES ADMIN MANAGEMENT
// ----------------------------------------------------
app.get("/admin/enquiries", requireAdmin, async (request, response) => {
  response.set("Cache-Control", "no-store");
  try {
    const enquiries = await fdb.getEnquiries();
    const csrfToken = issueCsrfToken(request);
    response.render("enquiries-list", {
      enquiries,
      csrfToken,
      deleted: request.query.deleted === "1",
      statusUpdated: request.query.statusUpdated === "1",
      created: request.query.created === "1",
      error: request.query.error || null,
      adminUser: request.session?.adminUser || null,
      pageTitle: "Client Enquiries",
    });
  } catch (err) {
    console.error("Could not fetch enquiries:", err);
    response.status(503).send("Could not load client enquiries.");
  }
});

// Export Client Enquiries with format and date range filtering
app.get("/admin/enquiries/export", requireAdmin, async (request, response) => {
  try {
    const allEnquiries = await fdb.getEnquiries();
    const format = (clean(request.query.format) || "csv").toLowerCase();
    const period = (clean(request.query.period) || "all").toLowerCase();
    const startDateStr = clean(request.query.startDate);
    const endDateStr = clean(request.query.endDate);

    const now = Date.now();
    const filtered = allEnquiries.filter((item) => {
      if (!item.createdAt) return true;
      const itemTime = new Date(item.createdAt).getTime();
      if (Number.isNaN(itemTime)) return true;

      if (period === "week") {
        return now - itemTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (period === "month") {
        return now - itemTime <= 30 * 24 * 60 * 60 * 1000;
      }
      if (period === "year") {
        return now - itemTime <= 365 * 24 * 60 * 60 * 1000;
      }
      if (period === "custom") {
        if (startDateStr) {
          const start = new Date(`${startDateStr}T00:00:00Z`).getTime();
          if (!Number.isNaN(start) && itemTime < start) return false;
        }
        if (endDateStr) {
          const end = new Date(`${endDateStr}T23:59:59Z`).getTime();
          if (!Number.isNaN(end) && itemTime > end) return false;
        }
        return true;
      }
      return true;
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader(
        "Content-Disposition",
        `attachment; filename="SSE-Client-Enquiries-${period}-${timestamp}.json"`
      );
      return response.send(JSON.stringify(filtered, null, 2));
    }

    // Default: CSV format with UTF-8 BOM for Microsoft Excel
    const headers = [
      "Lead ID",
      "Submission Date (IST)",
      "Client Name",
      "Company / Organization",
      "Email Address",
      "Phone Number",
      "Project Category",
      "Project Location",
      "Timeline",
      "Status",
      "Requirements & Scope Description",
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const cleanStr = String(str).replace(/"/g, '""');
      return `"${cleanStr}"`;
    };

    const csvRows = [
      headers.join(","),
      ...filtered.map((e) => {
        const istDate = e.createdAt
          ? new Date(e.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            })
          : "Undated";
        return [
          escapeCsv(e.id),
          escapeCsv(istDate),
          escapeCsv(e.name),
          escapeCsv(e.company),
          escapeCsv(e.email),
          escapeCsv(e.phone),
          escapeCsv(e.projectType),
          escapeCsv(e.location),
          escapeCsv(e.timeline),
          escapeCsv(e.status || "New"),
          escapeCsv(e.requirements),
        ].join(",");
      }),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\r\n");
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="SSE-Client-Enquiries-${period}-${timestamp}.csv"`
    );
    return response.send(csvContent);
  } catch (err) {
    console.error("Error exporting enquiries:", err);
    return response.status(500).send("Could not export enquiries.");
  }
});


app.post(
  "/admin/enquiries/new",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    try {
      const name = clean(request.body.name);
      if (!name) {
        return response.redirect(
          "/admin/enquiries?error=" + encodeURIComponent("Client or contact name is required.")
        );
      }

      const leadData = {
        name,
        company: clean(request.body.company) || "",
        email: clean(request.body.email) || "",
        phone: clean(request.body.phone) || "",
        projectType: clean(request.body.projectType) || "",
        location: clean(request.body.location) || "",
        timeline: clean(request.body.timeline) || "",
        requirements: clean(request.body.requirements) || "",
        status: clean(request.body.status) || "New",
        source: clean(request.body.source) || "Manual Admin Entry",
        createdAt: new Date().toISOString(),
      };

      await fdb.saveEnquiry(leadData);
      return response.redirect("/admin/enquiries?created=1");
    } catch (err) {
      console.error("Could not create client lead manually:", err);
      return response.redirect(
        "/admin/enquiries?error=" + encodeURIComponent("Could not save client lead. Please try again.")
      );
    }
  },
);

app.post(
  "/admin/enquiries/:id/status",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    try {
      const status = clean(request.body.status) || "New";
      await fdb.updateEnquiryStatus(request.params.id, status);
      return response.redirect("/admin/enquiries?statusUpdated=1");
    } catch (err) {
      console.error("Could not update enquiry status:", err);
      return response.redirect("/admin/enquiries");
    }
  },
);

app.post(
  "/admin/enquiries/:id/delete",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    try {
      const ok = await fdb.deleteEnquiry(request.params.id);
      if (!ok) {
        return response.status(404).send("Enquiry not found.");
      }
      return response.redirect("/admin/enquiries?deleted=1");
    } catch (err) {
      console.error("Could not delete enquiry:", err);
      return response.status(503).send("Could not delete enquiry.");
    }
  },
);

app.all(
  ["/letterhead/logout", "/admin/logout"],
  (request, response, next) => {
    if (request.session) {
      request.session.destroy((error) => {
        if (error) {
          return next(error);
        }
        response.clearCookie("sse_admin_session", { path: "/" });
        return response.redirect("/admin/login?message=Signed+out+successfully.");
      });
    } else {
      response.clearCookie("sse_admin_session", { path: "/" });
      return response.redirect("/admin/login");
    }
  },
);

app.get("/letterhead", requireAdmin, async (request, response) => {
  try {
    const documents = await fdb.getLetterheadDocuments();
    return response.render("letterhead-list", {
      documents,
      csrfToken: issueCsrfToken(request),
      adminUser: request.session.adminUser,
      deleted: request.query.deleted === "1",
    });
  } catch (error) {
    console.error("Could not load letterhead documents from Firestore:", error);
    return response.status(503).send("Could not load letterhead documents.");
  }
});

app.get(
  "/letterhead/documents/new",
  requireAdmin,
  (request, response) => {
    response.render("letterhead-editor", {
      document: {
        title: "",
        document_date: new Date().toISOString().slice(0, 10),
        recipient: "",
        subject: "",
        reference: "",
        content: "",
      },
      csrfToken: issueCsrfToken(request),
      adminUser: request.session.adminUser,
      isNew: true,
      error: "",
      saved: false,
    });
  },
);

app.post(
  "/letterhead/documents",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    const { values, error } = validateLetterheadDocument(request.body);
    if (error) {
      return response.status(400).render("letterhead-editor", {
        document: { ...values, document_date: values.date },
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: true,
        error,
        saved: false,
      });
    }

    try {
      const docId = await fdb.createLetterheadDocument(values);
      return response.redirect(
        `/letterhead/documents/${docId}/edit?saved=1`,
      );
    } catch (databaseError) {
      console.error("Could not create letterhead document in Firestore:", databaseError);
      return response.status(503).send("Could not save the document.");
    }
  },
);

app.get(
  "/letterhead/documents/:id/edit",
  requireAdmin,
  async (request, response) => {
    try {
      const document = await fdb.getLetterheadDocumentById(request.params.id);
      if (!document) {
        return response.status(404).send("Document not found.");
      }
      return response.render("letterhead-editor", {
        document,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: false,
        error: "",
        saved: request.query.saved === "1",
      });
    } catch (error) {
      console.error("Could not load letterhead document from Firestore:", error);
      return response.status(503).send("Could not load the document.");
    }
  },
);

app.post(
  "/letterhead/documents/:id",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    if (!/^\d+$/.test(request.params.id)) {
      return response.status(404).send("Document not found.");
    }
    const { values, error } = validateLetterheadDocument(request.body);
    if (error) {
      return response.status(400).render("letterhead-editor", {
        document: {
          ...values,
          id: request.params.id,
          document_date: values.date,
        },
        csrfToken: issueCsrfToken(request),
        isNew: false,
        error,
        saved: false,
      });
    }
    try {
      const updated = await fdb.updateLetterheadDocument(request.params.id, values);
      if (!updated) {
        return response.status(404).send("Document not found.");
      }
      return response.redirect(
        `/letterhead/documents/${request.params.id}/edit?saved=1`,
      );
    } catch (databaseError) {
      console.error("Could not update letterhead document in Firestore:", databaseError);
      return response.status(503).send("Could not save the document.");
    }
  },
);

app.get(
  "/letterhead/documents/:id/download",
  requireAdmin,
  async (request, response) => {
    try {
      const document = await fdb.getLetterheadDocumentById(request.params.id);
      if (!document) {
        return response.status(404).send("Document not found.");
      }
      const pdf = await createLetterheadPdf({
        title: document.title,
        date: document.document_date
          ? new Date(document.document_date).toISOString().slice(0, 10)
          : "",
        recipient: document.recipient,
        subject: document.subject,
        reference: document.reference,
        content: document.content,
      });
      response.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename(document.title)}"`,
        "Cache-Control": "no-store",
      });
      return response.send(pdf);
    } catch (error) {
      console.error("Could not generate letterhead PDF:", error);
      return response
        .status(422)
        .send("Could not generate the PDF. Please check the document text.");
    }
  },
);

app.post(
  "/letterhead/documents/:id/delete",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    try {
      const deleted = await fdb.deleteLetterheadDocument(request.params.id);
      if (!deleted) {
        return response.status(404).send("Document not found.");
      }
      return response.redirect("/letterhead?deleted=1");
    } catch (error) {
      console.error("Could not delete letterhead document from Firestore:", error);
      return response.status(503).send("Could not delete the document.");
    }
  },
);

function validateInvoicePayload(body) {
  const values = {
    invoice_number: clean(body.invoice_number),
    invoice_date: clean(body.invoice_date) || new Date().toISOString().slice(0, 10),
    due_date: clean(body.due_date) || null,
    work_order_no: clean(body.work_order_no || body.po_number),
    work_order_date: clean(body.work_order_date || body.po_date) || null,
    client_name: clean(body.client_name),
    client_gstin: clean(body.client_gstin).toUpperCase(),
    client_pan: clean(body.client_pan).toUpperCase(),
    client_address: clean(body.client_address),
    client_state: clean(body.client_state) || "Rajasthan",
    client_state_code: clean(body.client_state_code) || "08",
    project_site: clean(body.project_site || body.project_name),
    place_of_supply: clean(body.place_of_supply) || "Rajasthan (08)",
    reverse_charge: body.reverse_charge === "true" || body.reverse_charge === "YES",
    status: ["Pending", "Paid", "Cancelled"].includes(body.status)
      ? body.status
      : "Pending",
    bank_name: clean(body.bank_name) || "State Bank of India",
    bank_account_no: clean(body.bank_account_no || body.bank_account_number) || "38920194821",
    bank_ifsc: clean(body.bank_ifsc) || "SBIN0031168",
    bank_branch: clean(body.bank_branch) || "Jalore Main Branch, Rajasthan",
    terms_conditions: typeof (body.terms_conditions || body.terms) === "string" ? (body.terms_conditions || body.terms).trim() : "",
    notes: typeof body.notes === "string" ? body.notes.trim() : "",
  };

  if (!values.invoice_number) {
    return { values, items: [], error: "Invoice Number is required." };
  }
  if (!values.client_name) {
    return { values, items: [], error: "Billed Client / Firm Name is required." };
  }

  // Parse dynamic line items - supports both array format from editor and plain arrays
  let descriptions = Array.isArray(body["item_description[]"])
    ? body["item_description[]"]
    : Array.isArray(body.item_description)
      ? body.item_description
      : [body["item_description[]"] || body.item_description].filter(Boolean);

  let sacs = Array.isArray(body["item_sac[]"])
    ? body["item_sac[]"]
    : Array.isArray(body.item_sac)
      ? body.item_sac
      : [body["item_sac[]"] || body.item_sac].filter(Boolean);

  let units = Array.isArray(body["item_unit[]"])
    ? body["item_unit[]"]
    : Array.isArray(body.item_unit)
      ? body.item_unit
      : [body["item_unit[]"] || body.item_unit].filter(Boolean);

  let quantities = Array.isArray(body["item_quantity[]"])
    ? body["item_quantity[]"]
    : Array.isArray(body.item_qty)
      ? body.item_qty
      : [body["item_quantity[]"] || body.item_qty].filter(Boolean);

  let rates = Array.isArray(body["item_rate[]"])
    ? body["item_rate[]"]
    : Array.isArray(body.item_rate)
      ? body.item_rate
      : [body["item_rate[]"] || body.item_rate].filter(Boolean);

  const items = [];
  let subtotal = 0;

  for (let i = 0; i < descriptions.length; i++) {
    const desc = clean(descriptions[i]);
    if (!desc) continue;
    const sac_code = clean(sacs[i]) || "995434";
    const unit = clean(units[i]) || "Nos";
    const quantity = parseFloat(quantities[i]) || 1;
    const rate = parseFloat(rates[i]) || 0;
    const amount = Math.round(quantity * rate * 100) / 100;
    subtotal += amount;

    items.push({
      description: desc,
      sac_code,
      unit,
      quantity,
      rate,
      amount,
    });
  }

  if (items.length === 0) {
    return { values, items: [], error: "Please add at least one line item with a description and rate." };
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const isInter = body.tax_type === "inter" || body.tax_type === "INTER";
  let cgst_rate = isInter ? 0 : 9;
  let sgst_rate = isInter ? 0 : 9;
  let igst_rate = isInter ? 18 : 0;

  let cgst_amount = isInter ? 0 : Math.round(subtotal * 0.09 * 100) / 100;
  let sgst_amount = isInter ? 0 : Math.round(subtotal * 0.09 * 100) / 100;
  let igst_amount = isInter ? Math.round(subtotal * 0.18 * 100) / 100 : 0;

  const total_tax = Math.round((cgst_amount + sgst_amount + igst_amount) * 100) / 100;
  const total_amount = Math.round((subtotal + total_tax) * 100) / 100;
  const amount_in_words = numberToWordsINR(total_amount);

  values.items = items;
  values.subtotal = subtotal;
  values.cgst_rate = cgst_rate;
  values.cgst_amount = cgst_amount;
  values.sgst_rate = sgst_rate;
  values.sgst_amount = sgst_amount;
  values.igst_rate = igst_rate;
  values.igst_amount = igst_amount;
  values.total_amount = total_amount;
  values.amount_in_words = amount_in_words;

  return { values, items, error: "" };
}

// Invoices Dashboard
app.get("/admin/invoices", requireAdmin, async (request, response) => {
  try {
    const invoices = await fdb.getInvoices();
    const totalRevenue = invoices
      .filter((inv) => inv.status !== "Cancelled")
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
    const paidRevenue = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
    const pendingRevenue = invoices
      .filter((inv) => inv.status === "Pending")
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    const stats = {
      totalRevenue,
      totalCount: invoices.length,
      paidRevenue,
      paidCount: invoices.filter((inv) => inv.status === "Paid").length,
      pendingRevenue,
      pendingCount: invoices.filter((inv) => inv.status === "Pending").length,
    };

    return response.render("invoices-list", {
      invoices,
      stats,
      csrfToken: issueCsrfToken(request),
      adminUser: request.session.adminUser,
      deleted: request.query.deleted === "1",
    });
  } catch (error) {
    console.error("Could not load invoices from Firestore:", error);
    return response.status(503).send("Could not load invoices.");
  }
});

// New Invoice Page
app.get("/admin/invoices/new", requireAdmin, (request, response) => {
  const today = new Date().toISOString().slice(0, 10);
  const serial = Math.floor(100 + Math.random() * 900);
  const defaultInvoiceNumber = `SSE/2026-27/${serial}`;

  response.render("invoice-editor", {
    invoice: {
      invoice_number: defaultInvoiceNumber,
      invoice_date: today,
      due_date: "",
      work_order_no: "",
      work_order_date: "",
      client_name: "",
      client_gstin: "",
      client_pan: "",
      client_address: "",
      client_state: "Rajasthan",
      client_state_code: "08",
      project_site: "250 MW Solar PV Plant, Nokha, Bikaner, Rajasthan",
      place_of_supply: "Rajasthan (08)",
      reverse_charge: false,
      status: "Pending",
      items: [
        {
          description: "Civil Foundation & MMS Piling Works for Solar PV Power Plant as per approved engineering drawings",
          sac_code: "995434",
          unit: "MW",
          quantity: 5,
          rate: 185000,
          amount: 925000,
        },
      ],
      subtotal: 925000,
      cgst_rate: 9,
      cgst_amount: 83250,
      sgst_rate: 9,
      sgst_amount: 83250,
      igst_rate: 0,
      igst_amount: 0,
      total_amount: 1091500,
      bank_name: "State Bank of India",
      bank_account_no: "38920194821",
      bank_ifsc: "SBIN0031168",
      bank_branch: "Jalore Main Branch, Rajasthan",
      terms_conditions: "1. Certified that the particulars given above are true and correct.\n2. Payment terms: 100% within 30 days of invoice presentation.\n3. Interest @ 18% p.a. applicable on delayed payments.\n4. Subject to Jalore / Jodhpur jurisdiction only.",
      notes: "Certified by Resident EPC Project Manager.",
    },
    csrfToken: issueCsrfToken(request),
    adminUser: request.session.adminUser,
    isNew: true,
    error: "",
    saved: false,
  });
});

// Create Invoice
app.post(
  "/admin/invoices",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    const { values, items, error } = validateInvoicePayload(request.body);
    if (error) {
      return response.status(400).render("invoice-editor", {
        invoice: values,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: true,
        error,
        saved: false,
      });
    }

    try {
      const docId = await fdb.createInvoice(values, items);
      fdb.getInvoiceById(docId).then((savedInv) => {
        if (savedInv) {
          sendInvoiceEmailToAdmin(savedInv, request.session?.adminUser?.email);
        }
      }).catch((e) => console.warn("Notice sending invoice email:", e.message));
      return response.redirect(`/admin/invoices/${docId}`);
    } catch (databaseError) {
      console.error("Could not create invoice in Firestore:", databaseError);
      return response.status(503).render("invoice-editor", {
        invoice: values,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: true,
        error: "Database error while saving invoice: " + databaseError.message,
        saved: false,
      });
    }
  },
);

// View Invoice (Printable HTML)
app.get(
  "/admin/invoices/:id",
  requireAdmin,
  async (request, response) => {
    try {
      const invoice = await fdb.getInvoiceById(request.params.id);
      if (!invoice) {
        return response.status(404).send("Invoice not found.");
      }
      if (!invoice.amount_in_words) {
        invoice.amount_in_words = numberToWordsINR(invoice.total_amount);
      }

      return response.render("invoice-view", {
        invoice,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
      });
    } catch (error) {
      console.error("Could not load invoice view from Firestore:", error);
      return response.status(503).send("Could not load invoice.");
    }
  },
);

// Edit Invoice Page
app.get(
  "/admin/invoices/:id/edit",
  requireAdmin,
  async (request, response) => {
    try {
      const invoice = await fdb.getInvoiceById(request.params.id);
      if (!invoice) {
        return response.status(404).send("Invoice not found.");
      }
      return response.render("invoice-editor", {
        invoice,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: false,
        error: "",
        saved: request.query.saved === "1",
      });
    } catch (error) {
      console.error("Could not load invoice for editing from Firestore:", error);
      return response.status(503).send("Could not load invoice.");
    }
  },
);

// Update Invoice
app.post(
  "/admin/invoices/:id",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    const { values, items, error } = validateInvoicePayload(request.body);
    if (error) {
      values.id = request.params.id;
      return response.status(400).render("invoice-editor", {
        invoice: values,
        csrfToken: issueCsrfToken(request),
        adminUser: request.session.adminUser,
        isNew: false,
        error,
        saved: false,
      });
    }
    try {
      const updated = await fdb.updateInvoice(request.params.id, values, items);
      if (!updated) {
        return response.status(404).send("Invoice not found.");
      }
      fdb.getInvoiceById(request.params.id).then((savedInv) => {
        if (savedInv) {
          sendInvoiceEmailToAdmin(savedInv, request.session?.adminUser?.email);
        }
      }).catch((e) => console.warn("Notice sending invoice email:", e.message));
      return response.redirect(`/admin/invoices/${request.params.id}`);
    } catch (databaseError) {
      console.error("Could not update invoice in Firestore:", databaseError);
      return response.status(503).send("Could not update invoice.");
    }
  },
);

// Download Invoice PDF
app.get(
  "/admin/invoices/:id/download",
  requireAdmin,
  async (request, response) => {
    try {
      const invoice = await fdb.getInvoiceById(request.params.id);
      if (!invoice) {
        return response.status(404).send("Invoice not found.");
      }
      const pdf = await createInvoicePdf(invoice);
      const filename = `Invoice-${String(invoice.invoice_number || "INV").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

      response.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      });
      return response.send(pdf);
    } catch (error) {
      console.error("Could not generate invoice PDF:", error);
      return response.status(422).send("Could not generate Invoice PDF.");
    }
  },
);

// Delete Invoice
app.post(
  "/admin/invoices/:id/delete",
  requireAdmin,
  requireCsrf,
  async (request, response) => {
    try {
      const deleted = await fdb.deleteInvoice(request.params.id);
      if (!deleted) {
        return response.status(404).send("Invoice not found.");
      }
      return response.redirect("/admin/invoices?deleted=1");
    } catch (error) {
      console.error("Could not delete invoice from Firestore:", error);
      return response.status(503).send("Could not delete invoice.");
    }
  },
);

app.post("/api/enquiries", enquiryLimiter, async (request, response) => {
  const { values, error } = validateEnquiry(request.body);
  if (error) {
    return response.status(400).json({ error });
  }

  try {
    await fdb.saveEnquiry(values);
  } catch (error) {
    console.error("Could not save project enquiry to Firestore:", error);
    return response.status(503).json({
      error:
        "We could not save your enquiry right now. Please call +91 96363 20419 or try again later.",
    });
  }

  try {
    const emailId = await sendEnquiryEmail(values);
    console.info("Project enquiry email sent through Resend:", emailId);
  } catch (error) {
    console.error("Enquiry saved, but email notification failed:", error);
    return response.status(502).json({
      error:
        "Your enquiry has been saved, but we could not send an email notification. Please also call +91 96363 20419.",
      saved: true,
    });
  }

  return response.status(201).json({
    message: "Thank you. Your project enquiry has been sent successfully.",
  });
});

app.use((_request, response) => {
  response.status(404).send("Page not found.");
});

// Export the Express app for Firebase Cloud Functions
module.exports = { app };

// Only start the server when running directly (not as a Cloud Function)
if (require.main === module) {
  async function start() {
    if (process.env.NODE_ENV === "development") {
      const { createServer } = await import("vite");
      viteServer = await createServer({
        configFile: path.join(__dirname, "vite.config.mjs"),
        server: { middlewareMode: true },
        appType: "custom",
      });
    }

    app.listen(port, () => {
      console.log(`Shree Shantinath Enterprises website listening on http://localhost:${port}`);
      console.log("Connected to Firebase Cloud Firestore (projectId: sse-jalore).");
      if (viteServer) {
        console.log("React development mode is enabled with Vite HMR.");
      }
    });
  }

  start().catch((error) => {
    console.error("Could not start the website:", error);
    process.exitCode = 1;
  });
}
