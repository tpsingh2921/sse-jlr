require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

// Firebase Web SDK
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Check for Firebase Admin SDK Service Account credentials
let adminDb = null;
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  path.join(__dirname, "serviceAccountKey.json");

if (fs.existsSync(serviceAccountPath)) {
  try {
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    adminDb = admin.firestore();
    console.log("🔒 Connected to Cloud Firestore via Firebase Admin SDK (Privileged Service Account - Rules Bypassed).");
  } catch (err) {
    console.warn("Notice: Service account file found but initialization failed:", err.message);
  }
} else {
  console.log("ℹ️ Connected to Cloud Firestore via Firebase Web SDK. To enable 100% cloud lock-down, place serviceAccountKey.json in the project root.");
}

// Helper to generate sequential or unique IDs
function generateNumericId() {
  return String(Date.now());
}

// ----------------------------------------------------
// ENQUIRIES (sse_jlr)
// ----------------------------------------------------
async function saveEnquiry(data) {
  const id = generateNumericId();
  const payload = {
    id,
    name: data.name || "",
    company: data.company || "",
    email: data.email || "",
    phone: data.phone || "",
    projectType: data.projectType || "",
    location: data.location || "",
    timeline: data.timeline || "",
    requirements: data.requirements || "",
    createdAt: new Date().toISOString(),
  };

  if (adminDb) {
    await adminDb.collection("enquiries").doc(id).set(payload);
    return id;
  }

  const docRef = doc(db, "enquiries", id);
  await setDoc(docRef, payload);
  return id;
}

async function getEnquiries() {
  const docs = [];
  try {
    if (adminDb) {
      const snap = await adminDb.collection("enquiries").get();
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    } else {
      const colRef = collection(db, "enquiries");
      const snap = await getDocs(colRef);
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    }
    docs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.error("Error reading enquiries from Firestore:", err.message);
  }
  return docs;
}

async function getEnquiryById(id) {
  try {
    if (adminDb) {
      const snap = await adminDb.collection("enquiries").doc(String(id)).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    }
    const docSnap = await getDoc(doc(db, "enquiries", String(id)));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error("Error getting enquiry by id:", err.message);
    return null;
  }
}

async function deleteEnquiry(id) {
  try {
    if (adminDb) {
      const ref = adminDb.collection("enquiries").doc(String(id));
      const snap = await ref.get();
      if (!snap.exists) return false;
      await ref.delete();
      return true;
    }
    const docRef = doc(db, "enquiries", String(id));
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("Error deleting enquiry:", err.message);
    return false;
  }
}

async function updateEnquiryStatus(id, status) {
  try {
    const updateObj = {
      status: String(status || "New"),
      status_updated_at: new Date().toISOString(),
    };
    if (adminDb) {
      const ref = adminDb.collection("enquiries").doc(String(id));
      const snap = await ref.get();
      if (!snap.exists) return false;
      await ref.update(updateObj);
      return true;
    }
    const docRef = doc(db, "enquiries", String(id));
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    await updateDoc(docRef, updateObj);
    return true;
  } catch (err) {
    console.error("Error updating enquiry status in Firestore:", err.message);
    return false;
  }
}

// ----------------------------------------------------
// LETTERHEAD DOCUMENTS
// ----------------------------------------------------
async function getLetterheadDocuments() {
  const docs = [];
  try {
    if (adminDb) {
      const snap = await adminDb.collection("letterhead_documents").get();
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    } else {
      const colRef = collection(db, "letterhead_documents");
      const snap = await getDocs(colRef);
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    }
    docs.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  } catch (err) {
    console.error("Error getting letterheads:", err.message);
  }
  return docs;
}

async function getLetterheadDocumentById(id) {
  try {
    if (adminDb) {
      const snap = await adminDb.collection("letterhead_documents").doc(String(id)).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    }
    const docSnap = await getDoc(doc(db, "letterhead_documents", String(id)));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error("Error getting letterhead doc:", err.message);
    return null;
  }
}

async function createLetterheadDocument(values) {
  const id = generateNumericId();
  const now = new Date().toISOString();
  const docObj = {
    id,
    title: values.title || "",
    document_date: values.date || "",
    recipient: values.recipient || "",
    subject: values.subject || "",
    reference: values.reference || "",
    content: values.content || "",
    created_at: now,
    updated_at: now,
  };

  if (adminDb) {
    await adminDb.collection("letterhead_documents").doc(id).set(docObj);
    return id;
  }

  const docRef = doc(db, "letterhead_documents", id);
  await setDoc(docRef, docObj);
  return id;
}

async function updateLetterheadDocument(id, values) {
  const updateObj = {
    title: values.title || "",
    document_date: values.date || "",
    recipient: values.recipient || "",
    subject: values.subject || "",
    reference: values.reference || "",
    content: values.content || "",
    updated_at: new Date().toISOString(),
  };

  if (adminDb) {
    const ref = adminDb.collection("letterhead_documents").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.update(updateObj);
    return true;
  }

  const docRef = doc(db, "letterhead_documents", String(id));
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  await updateDoc(docRef, updateObj);
  return true;
}

async function deleteLetterheadDocument(id) {
  if (adminDb) {
    const ref = adminDb.collection("letterhead_documents").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.delete();
    return true;
  }

  const docRef = doc(db, "letterhead_documents", String(id));
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  await deleteDoc(docRef);
  return true;
}

// ----------------------------------------------------
// ADMINISTRATORS (admins)
// ----------------------------------------------------
async function getAdminCount() {
  try {
    if (adminDb) {
      const snap = await adminDb.collection("admins").get();
      return snap.size;
    }
    const snap = await getDocs(collection(db, "admins"));
    return snap.size;
  } catch (err) {
    console.error("Error getting admin count from Firestore:", err.message);
    return 1; // Default to 1 so registration is closed
  }
}

async function getAdminByEmail(email) {
  let found = null;
  try {
    if (adminDb) {
      const snap = await adminDb.collection("admins").get();
      snap.forEach((d) => {
        const data = d.data();
        if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
          found = { id: d.id, ...data };
        }
      });
      return found;
    }

    const snap = await getDocs(collection(db, "admins"));
    snap.forEach((d) => {
      const data = d.data();
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
        found = { id: d.id, ...data };
      }
    });
  } catch (err) {
    console.error("Error looking up admin by email:", err.message);
  }
  return found;
}

async function createAdmin(data) {
  const id = generateNumericId();
  const adminObj = {
    id,
    name: data.name || "",
    email: (data.email || "").toLowerCase(),
    mobile: data.mobile || "",
    password_hash: data.passwordHash || data.password_hash || "",
    is_verified: true,
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };

  if (adminDb) {
    await adminDb.collection("admins").doc(id).set(adminObj);
    return adminObj;
  }

  const docRef = doc(db, "admins", id);
  await setDoc(docRef, adminObj);
  return adminObj;
}

async function updateAdminPassword(email, newPasswordHash) {
  try {
    const admin = await getAdminByEmail(email);
    const updateObj = {
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    };

    if (admin) {
      if (adminDb) {
        await adminDb.collection("admins").doc(String(admin.id)).update(updateObj);
        return true;
      }
      const docRef = doc(db, "admins", String(admin.id));
      await updateDoc(docRef, updateObj);
      return true;
    } else {
      await createAdmin({
        email,
        name: "Harsh Vardhan",
        mobile: "+91 96363 20419",
        password_hash: newPasswordHash,
      });
      return true;
    }
  } catch (err) {
    console.error("Error updating admin password in Firestore:", err.message);
    return false;
  }
}

// ----------------------------------------------------
// TAX INVOICES (invoices)
// ----------------------------------------------------
async function getInvoices() {
  const docs = [];
  try {
    if (adminDb) {
      const snap = await adminDb.collection("invoices").get();
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    } else {
      const snap = await getDocs(collection(db, "invoices"));
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    }
    docs.sort((a, b) => new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0));
  } catch (err) {
    console.error("Error getting invoices:", err.message);
  }
  return docs;
}

async function getInvoiceById(id) {
  try {
    if (adminDb) {
      const snap = await adminDb.collection("invoices").doc(String(id)).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    }
    const docSnap = await getDoc(doc(db, "invoices", String(id)));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error("Error getting invoice by id:", err.message);
    return null;
  }
}

async function createInvoice(values, items) {
  const id = generateNumericId();
  const now = new Date().toISOString();
  const invObj = {
    id,
    invoice_number: values.invoice_number,
    invoice_date: values.invoice_date || "",
    due_date: values.due_date || "",
    work_order_no: values.work_order_no || "",
    work_order_date: values.work_order_date || "",
    client_name: values.client_name || "",
    client_gstin: values.client_gstin || "",
    client_pan: values.client_pan || "",
    client_address: values.client_address || "",
    client_state: values.client_state || "Rajasthan",
    client_state_code: values.client_state_code || "08",
    project_site: values.project_site || "",
    place_of_supply: values.place_of_supply || "Rajasthan (08)",
    reverse_charge: values.reverse_charge === true,
    items: items || [],
    subtotal: Number(values.subtotal || 0),
    cgst_rate: Number(values.cgst_rate || 0),
    cgst_amount: Number(values.cgst_amount || 0),
    sgst_rate: Number(values.sgst_rate || 0),
    sgst_amount: Number(values.sgst_amount || 0),
    igst_rate: Number(values.igst_rate || 0),
    igst_amount: Number(values.igst_amount || 0),
    total_amount: Number(values.total_amount || 0),
    amount_in_words: values.amount_in_words || "",
    bank_name: values.bank_name || "State Bank of India",
    bank_account_no: values.bank_account_no || "38920194821",
    bank_ifsc: values.bank_ifsc || "SBIN0031168",
    bank_branch: values.bank_branch || "Jalore Main Branch, Rajasthan",
    terms_conditions: values.terms_conditions || "",
    notes: values.notes || "",
    status: values.status || "Pending",
    created_at: now,
    updated_at: now,
  };

  if (adminDb) {
    await adminDb.collection("invoices").doc(id).set(invObj);
    return id;
  }

  const docRef = doc(db, "invoices", id);
  await setDoc(docRef, invObj);
  return id;
}

async function updateInvoice(id, values, items) {
  const updateObj = {
    invoice_number: values.invoice_number,
    invoice_date: values.invoice_date || "",
    due_date: values.due_date || "",
    work_order_no: values.work_order_no || "",
    work_order_date: values.work_order_date || "",
    client_name: values.client_name || "",
    client_gstin: values.client_gstin || "",
    client_pan: values.client_pan || "",
    client_address: values.client_address || "",
    client_state: values.client_state || "Rajasthan",
    client_state_code: values.client_state_code || "08",
    project_site: values.project_site || "",
    place_of_supply: values.place_of_supply || "Rajasthan (08)",
    reverse_charge: values.reverse_charge === true,
    items: items || [],
    subtotal: Number(values.subtotal || 0),
    cgst_rate: Number(values.cgst_rate || 0),
    cgst_amount: Number(values.cgst_amount || 0),
    sgst_rate: Number(values.sgst_rate || 0),
    sgst_amount: Number(values.sgst_amount || 0),
    igst_rate: Number(values.igst_rate || 0),
    igst_amount: Number(values.igst_amount || 0),
    total_amount: Number(values.total_amount || 0),
    amount_in_words: values.amount_in_words || "",
    bank_name: values.bank_name || "State Bank of India",
    bank_account_no: values.bank_account_no || "38920194821",
    bank_ifsc: values.bank_ifsc || "SBIN0031168",
    bank_branch: values.bank_branch || "Jalore Main Branch, Rajasthan",
    terms_conditions: values.terms_conditions || "",
    notes: values.notes || "",
    status: values.status || "Pending",
    updated_at: new Date().toISOString(),
  };

  if (adminDb) {
    const ref = adminDb.collection("invoices").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.update(updateObj);
    return true;
  }

  const docRef = doc(db, "invoices", String(id));
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  await updateDoc(docRef, updateObj);
  return true;
}

async function deleteInvoice(id) {
  if (adminDb) {
    const ref = adminDb.collection("invoices").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return false;
    await ref.delete();
    return true;
  }

  const docRef = doc(db, "invoices", String(id));
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  await deleteDoc(docRef);
  return true;
}

// ----------------------------------------------------
// SESSIONS (sessions collection for express-session)
// ----------------------------------------------------
async function getSession(sid) {
  try {
    if (adminDb) {
      const snap = await adminDb.collection("sessions").doc(sid).get();
      if (!snap.exists) return null;
      const data = snap.data();
      if (data.expires && Date.now() > data.expires) {
        await adminDb.collection("sessions").doc(sid).delete();
        return null;
      }
      return data.sess;
    }

    const docSnap = await getDoc(doc(db, "sessions", sid));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    if (data.expires && Date.now() > data.expires) {
      await deleteDoc(doc(db, "sessions", sid));
      return null;
    }
    return data.sess;
  } catch (err) {
    return null;
  }
}

async function setSession(sid, sess, maxAgeMs = 8 * 60 * 60 * 1000) {
  try {
    const payload = {
      sess,
      expires: Date.now() + maxAgeMs,
      updated_at: new Date().toISOString(),
    };
    if (adminDb) {
      await adminDb.collection("sessions").doc(sid).set(payload);
      return;
    }
    const docRef = doc(db, "sessions", sid);
    await setDoc(docRef, payload);
  } catch (err) {
    console.error("Error setting session in Firestore:", err.message);
  }
}

async function destroySession(sid) {
  try {
    if (adminDb) {
      await adminDb.collection("sessions").doc(sid).delete();
      return;
    }
    await deleteDoc(doc(db, "sessions", sid));
  } catch (err) {
    // ignore
  }
}

module.exports = {
  db,
  adminDb,
  saveEnquiry,
  getEnquiries,
  getEnquiryById,
  deleteEnquiry,
  updateEnquiryStatus,
  getLetterheadDocuments,
  getLetterheadDocumentById,
  createLetterheadDocument,
  updateLetterheadDocument,
  deleteLetterheadDocument,
  getAdminCount,
  getAdminByEmail,
  createAdmin,
  updateAdminPassword,
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getSession,
  setSession,
  destroySession,
};
