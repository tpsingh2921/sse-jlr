require("dotenv").config();

const path = require("node:path");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { Pool, types } = require("pg");
types.setTypeParser(1082, (value) => value);

const app = express();
const port = Number(process.env.PORT) || 3000;
const contactEmail =
  process.env.CONTACT_EMAIL || "shreeshantinath.enterprises25@gmail.com";
const letterheadPassword = process.env.LETTERHEAD_ADMIN_PASSWORD || "";
const sessionSecret = process.env.SESSION_SECRET || "";
let databaseReady = false;
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
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || "Web Dev",
      },
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
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
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));
app.use((request, response, next) => {
  if (viteServer) {
    return viteServer.middlewares(request, response, next);
  }
  return next();
});
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(express.json({ limit: "32kb" }));
app.use(
  "/letterhead",
  (_request, response, next) => {
    response.set("X-Robots-Tag", "noindex, nofollow");
    if (!databaseReady) {
      return response
        .status(503)
        .send("The private document library is unavailable until PostgreSQL is ready.");
    }
    next();
  },
  session({
    name: "sse_letterhead_session",
    store: new PgSession({
      pool,
      tableName: "letterhead_sessions",
      createTableIfMissing: false,
    }),
    secret: sessionSecret || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/letterhead",
    },
  }),
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
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
    return response.redirect("/letterhead/login");
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

async function createLetterheadPdf(document) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const markFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sealImage = await pdf.embedPng(
    await fs.readFile(path.join(__dirname, "public", "images", "company-seal.png")),
  );
  const width = 595.28;
  const height = 841.89;
  const margin = 58;
  const bodyWidth = width - margin * 2;
  const bodyTop = 656;
  const footerTop = 126;
  const lineHeight = 17.5;
  const fontSize = 10.5;
  const ink = rgb(0.11, 0.19, 0.16);
  const green = rgb(0.09, 0.23, 0.19);
  const muted = rgb(0.39, 0.45, 0.41);
  const gold = rgb(0.84, 0.66, 0.25);
  const paper = rgb(0.98, 0.98, 0.95);
  let page;
  let y;

  const drawBrandMark = (target, x, centerY) => {
    target.drawCircle({
      x: x + 24,
      y: centerY,
      size: 16.5,
      color: green,
      borderColor: gold,
      borderWidth: 1.6,
    });
    target.drawCircle({
      x: x + 24,
      y: centerY,
      size: 12.8,
      borderColor: rgb(0.89, 0.77, 0.44),
      borderWidth: 0.7,
    });
    target.drawText("S", {
      x: x + 24 - markFont.widthOfTextAtSize("S", 19) / 2,
      y: centerY - 6.5,
      size: 19,
      font: markFont,
      color: paper,
    });
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 8;
      target.drawLine({
        start: {
          x: x + 24 + Math.cos(angle) * 19,
          y: centerY + Math.sin(angle) * 19,
        },
        end: {
          x: x + 24 + Math.cos(angle) * 22,
          y: centerY + Math.sin(angle) * 22,
        },
        thickness: 1.4,
        color: gold,
      });
    }
  };

  const addPage = () => {
    page = pdf.addPage([width, height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: paper,
    });
    page.drawRectangle({
      x: 0,
      y: height - 127,
      width,
      height: 127,
      color: green,
    });
    page.drawRectangle({
      x: 0,
      y: height - 132,
      width,
      height: 5,
      color: gold,
    });
    drawBrandMark(page, margin, height - 59);
    page.drawText("SHREE SHANTINATH", {
      x: margin + 57,
      y: height - 50,
      size: 16.5,
      font: boldFont,
      color: paper,
      characterSpacing: 1.05,
    });
    page.drawText("ENTERPRISES", {
      x: margin + 58,
      y: height - 70,
      size: 10,
      font: boldFont,
      color: gold,
      characterSpacing: 3.3,
    });
    page.drawText("CIVIL WORKS  ·  RENEWABLE ENERGY", {
      x: margin + 58,
      y: height - 91,
      size: 7,
      font,
      color: rgb(0.83, 0.88, 0.82),
      characterSpacing: 1,
    });
    const gst = "GSTIN  08BOKPV8974D1Z5";
    page.drawText(gst, {
      x: width - margin - boldFont.widthOfTextAtSize(gst, 7),
      y: height - 50,
      size: 7,
      font: boldFont,
      color: gold,
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 99,
      color: green,
    });
    page.drawRectangle({
      x: 0,
      y: 99,
      width,
      height: 3,
      color: gold,
    });
    page.drawText("LET’S BUILD A GREENER FUTURE.", {
      x: margin,
      y: 69,
      size: 8,
      font: boldFont,
      color: gold,
      characterSpacing: 0.8,
    });
    page.drawText("+91 96363 20419   ·   +91 78771 27423", {
      x: margin,
      y: 48,
      size: 8,
      font: boldFont,
      color: paper,
    });
    page.drawText("shreeshantinath.enterprises25@gmail.com", {
      x: margin,
      y: 32,
      size: 8,
      font,
      color: rgb(0.87, 0.9, 0.85),
    });
    page.drawText("JALORE, RAJASTHAN  ·  INDIA", {
      x: margin,
      y: 15,
      size: 6.5,
      font,
      color: rgb(0.72, 0.8, 0.73),
      characterSpacing: 1.05,
    });
    y = bodyTop;
  };
  const ensureSpace = async () => {
    if (y < footerTop) {
      await addPage();
    }
  };
  const drawWrapped = async (text, selectedFont = font, size = fontSize) => {
    const lines = wrapPdfText(text, selectedFont, size, bodyWidth);
    for (const line of lines) {
      await ensureSpace();
      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size,
          font: selectedFont,
          color: ink,
        });
      }
      y -= lineHeight;
    }
  };

  addPage();
  if (document.title) {
    page.drawRectangle({
      x: margin,
      y: y - 9,
      width: 3,
      height: 26,
      color: gold,
    });
  }
  if (document.date) {
    page.drawText(
      new Date(`${document.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      { x: margin, y, size: 9, font, color: muted },
    );
    y -= lineHeight * 2;
  }
  if (document.recipient) {
    await drawWrapped(document.recipient);
    y -= lineHeight;
  }
  if (document.reference) {
    await drawWrapped(`Reference: ${document.reference}`, boldFont, fontSize);
    y -= lineHeight;
  }
  if (document.subject) {
    ensureSpace();
    page.drawText("SUBJECT", {
      x: margin,
      y,
      size: 7,
      font: boldFont,
      color: muted,
      characterSpacing: 1,
    });
    y -= 14;
    await drawWrapped(document.subject, boldFont, 11);
    y -= lineHeight;
  } else if (document.title) {
    ensureSpace();
    page.drawText("SUBJECT", {
      x: margin,
      y,
      size: 7,
      font: boldFont,
      color: muted,
      characterSpacing: 1,
    });
    y -= 14;
    await drawWrapped(document.title, boldFont, 11);
    y -= lineHeight;
  }
  page.drawLine({
    start: { x: margin, y: y + 3 },
    end: { x: width - margin, y: y + 3 },
    thickness: 0.7,
    color: rgb(0.86, 0.87, 0.82),
  });
  y -= 14;
  await drawWrapped(document.content);
  const sealWidth = 104;
  const sealHeight = sealWidth * (sealImage.height / sealImage.width);
  const sealBottom = footerTop + 8;
  if (y < sealBottom + sealHeight + lineHeight) {
    await addPage();
  }
  page.drawImage(sealImage, {
    x: width - margin - sealWidth,
    y: sealBottom,
    width: sealWidth,
    height: sealHeight,
    opacity: 0.86,
  });

  return Buffer.from(await pdf.save());
}

function compareAdminPassword(value) {
  const configuredHash = crypto
    .createHash("sha256")
    .update(letterheadPassword)
    .digest();
  const suppliedHash = crypto
    .createHash("sha256")
    .update(value)
    .digest();
  return crypto.timingSafeEqual(suppliedHash, configuredHash);
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
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

app.get("/letterhead/login", (request, response) => {
  if (request.session?.isLetterheadAdmin) {
    return response.redirect("/letterhead");
  }
  response.set("Cache-Control", "no-store");
  const csrfToken = issueCsrfToken(request);
  response.render("letterhead-login", {
    csrfToken,
    error: "",
    configured:
      letterheadPassword.length >= 16 && sessionSecret.length >= 32,
  });
});

app.post(
  "/letterhead/login",
  loginLimiter,
  requireCsrf,
  (request, response, next) => {
    if (letterheadPassword.length < 16 || sessionSecret.length < 32) {
      return response.status(503).render("letterhead-login", {
        csrfToken: issueCsrfToken(request),
        error:
          "Admin access is not configured. Set LETTERHEAD_ADMIN_PASSWORD (at least 16 characters) and SESSION_SECRET (at least 32 characters) in the local .env file.",
        configured: false,
      });
    }

    if (!compareAdminPassword(clean(request.body.password))) {
      return response.status(401).render("letterhead-login", {
        csrfToken: issueCsrfToken(request),
        error: "Incorrect admin password. Please try again.",
        configured: true,
      });
    }

    request.session.regenerate((error) => {
      if (error) {
        return next(error);
      }
      request.session.isLetterheadAdmin = true;
      const csrfToken = issueCsrfToken(request);
      request.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }
        response.redirect("/letterhead");
      });
    });
  },
);

app.post(
  "/letterhead/logout",
  requireAdmin,
  requireCsrf,
  (request, response, next) => {
    request.session.destroy((error) => {
      if (error) {
        return next(error);
      }
      response.clearCookie("sse_letterhead_session", { path: "/letterhead" });
      response.redirect("/letterhead/login");
    });
  },
);

app.get("/letterhead", requireAdmin, async (request, response) => {
  if (!databaseReady) {
    return response.status(503).send("PostgreSQL is not available.");
  }
  try {
    const result = await pool.query(
      `SELECT id, title, document_date, updated_at
       FROM letterhead_documents
       ORDER BY updated_at DESC, id DESC`,
    );
    return response.render("letterhead-list", {
      documents: result.rows,
      csrfToken: issueCsrfToken(request),
      deleted: request.query.deleted === "1",
    });
  } catch (error) {
    console.error("Could not load letterhead documents:", error);
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
        isNew: true,
        error,
        saved: false,
      });
    }
    if (!databaseReady) {
      return response.status(503).send("PostgreSQL is not available.");
    }

    try {
      const result = await pool.query(
        `INSERT INTO letterhead_documents
          (title, document_date, recipient, subject, reference, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          values.title,
          values.date || null,
          values.recipient,
          values.subject,
          values.reference,
          values.content,
        ],
      );
      return response.redirect(
        `/letterhead/documents/${result.rows[0].id}/edit?saved=1`,
      );
    } catch (databaseError) {
      console.error("Could not create letterhead document:", databaseError);
      return response.status(503).send("Could not save the document.");
    }
  },
);

app.get(
  "/letterhead/documents/:id/edit",
  requireAdmin,
  async (request, response) => {
    if (!/^\d+$/.test(request.params.id)) {
      return response.status(404).send("Document not found.");
    }
    if (!databaseReady) {
      return response.status(503).send("PostgreSQL is not available.");
    }
    try {
      const result = await pool.query(
        "SELECT * FROM letterhead_documents WHERE id = $1",
        [request.params.id],
      );
      if (!result.rowCount) {
        return response.status(404).send("Document not found.");
      }
      return response.render("letterhead-editor", {
        document: result.rows[0],
        csrfToken: issueCsrfToken(request),
        isNew: false,
        error: "",
        saved: request.query.saved === "1",
      });
    } catch (error) {
      console.error("Could not load letterhead document:", error);
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
    if (!databaseReady) {
      return response.status(503).send("PostgreSQL is not available.");
    }
    try {
      const result = await pool.query(
        `UPDATE letterhead_documents
         SET title = $1, document_date = $2, recipient = $3, subject = $4,
             reference = $5, content = $6, updated_at = NOW()
         WHERE id = $7`,
        [
          values.title,
          values.date || null,
          values.recipient,
          values.subject,
          values.reference,
          values.content,
          request.params.id,
        ],
      );
      if (!result.rowCount) {
        return response.status(404).send("Document not found.");
      }
      return response.redirect(
        `/letterhead/documents/${request.params.id}/edit?saved=1`,
      );
    } catch (databaseError) {
      console.error("Could not update letterhead document:", databaseError);
      return response.status(503).send("Could not save the document.");
    }
  },
);

app.get(
  "/letterhead/documents/:id/download",
  requireAdmin,
  async (request, response) => {
    if (!/^\d+$/.test(request.params.id)) {
      return response.status(404).send("Document not found.");
    }
    if (!databaseReady) {
      return response.status(503).send("PostgreSQL is not available.");
    }
    try {
      const result = await pool.query(
        "SELECT * FROM letterhead_documents WHERE id = $1",
        [request.params.id],
      );
      if (!result.rowCount) {
        return response.status(404).send("Document not found.");
      }
      const document = result.rows[0];
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
    if (!/^\d+$/.test(request.params.id)) {
      return response.status(404).send("Document not found.");
    }
    if (!databaseReady) {
      return response.status(503).send("PostgreSQL is not available.");
    }
    try {
      const result = await pool.query(
        "DELETE FROM letterhead_documents WHERE id = $1",
        [request.params.id],
      );
      if (!result.rowCount) {
        return response.status(404).send("Document not found.");
      }
      return response.redirect("/letterhead?deleted=1");
    } catch (error) {
      console.error("Could not delete letterhead document:", error);
      return response.status(503).send("Could not delete the document.");
    }
  },
);

app.post("/api/enquiries", enquiryLimiter, async (request, response) => {
  const { values, error } = validateEnquiry(request.body);
  if (error) {
    return response.status(400).json({ error });
  }

  if (!databaseReady) {
    return response.status(503).json({
      error:
        "Enquiry storage is temporarily unavailable. Please call +91 96363 20419 or try again later.",
    });
  }

  try {
    await pool.query(
      `INSERT INTO sse_jlr
        (name, company, email, phone, project_type, location, timeline, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        values.name,
        values.company,
        values.email,
        values.phone,
        values.projectType,
        values.location,
        values.timeline,
        values.requirements,
      ],
    );
  } catch (error) {
    console.error("Could not save project enquiry to PostgreSQL:", error);
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
    if (viteServer) {
      console.log("React development mode is enabled with Vite HMR.");
    }
  });

  pool
    .query(`
    CREATE TABLE IF NOT EXISTS sse_jlr (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      company VARCHAR(160) NOT NULL DEFAULT '',
      email VARCHAR(254) NOT NULL,
      phone VARCHAR(40) NOT NULL DEFAULT '',
      project_type VARCHAR(100) NOT NULL DEFAULT '',
      location VARCHAR(160) NOT NULL DEFAULT '',
      timeline VARCHAR(100) NOT NULL DEFAULT '',
      requirements TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
    .then(() =>
      pool.query(`
        CREATE TABLE IF NOT EXISTS letterhead_documents (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(160) NOT NULL,
          document_date DATE,
          recipient VARCHAR(500) NOT NULL DEFAULT '',
          subject VARCHAR(300) NOT NULL DEFAULT '',
          reference VARCHAR(100) NOT NULL DEFAULT '',
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `),
    )
    .then(() =>
      pool.query(`
        CREATE TABLE IF NOT EXISTS letterhead_sessions (
          sid VARCHAR NOT NULL COLLATE "default",
          sess JSON NOT NULL,
          expire TIMESTAMP(6) NOT NULL,
          CONSTRAINT letterhead_sessions_pkey PRIMARY KEY (sid)
        )
      `),
    )
    .then(() =>
      pool.query(`
        CREATE INDEX IF NOT EXISTS letterhead_sessions_expire_idx
        ON letterhead_sessions (expire)
      `),
    )
    .then(() => {
      databaseReady = true;
      console.log(
        "PostgreSQL is ready; enquiries and letterhead documents are available.",
      );
    })
    .catch((error) => {
      console.error(
        "PostgreSQL initialization failed; the website is available, but enquiries cannot be stored until the database is configured.",
        error,
      );
    });
}

start().catch((error) => {
  console.error("Could not start the website:", error);
  process.exitCode = 1;
});
