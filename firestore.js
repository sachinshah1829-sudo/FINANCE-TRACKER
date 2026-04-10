import { app } from "./firebase-config.js";
import { 
  getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

// Auth gate
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    if (window.loadAll && !window.addLoaded) {
      window.loadAll();
      window.loadAddData && window.loadAddData();
    }
  } else {
    window.location.href = 'login.html';
  }
});

// Helper for UID
const getUid = () => {
  if (!currentUser) throw new Error("Not authenticated");
  return currentUser.uid;
};

// Logout helper for index.html
window.logout = () => signOut(auth);

const api = {};

/* Accounts */
api.getAccounts = async () => {
  const q = collection(db, "users", getUid(), "accounts");
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().name);
};
api.getAccountsFull = async () => {
  const q = collection(db, "users", getUid(), "accounts");
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ row: d.id, ...d.data() }));
};
api.addAccount = async (name, opening, type) => {
  await addDoc(collection(db, "users", getUid(), "accounts"), { name, openingBalance: Number(opening), currentBalance: Number(opening), type });
};
api.updateAccount = async (rowId, name, opening, type) => {
  await updateDoc(doc(db, "users", getUid(), "accounts", rowId), { name, openingBalance: Number(opening), type });
};
api.deleteAccount = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "accounts", rowId));
};

/* Categories */
api.getCategoriesByType = async () => {
  const q = collection(db, "users", getUid(), "categories");
  const snap = await getDocs(q);
  const expense = [], income = [];
  snap.docs.forEach(d => {
    if (d.data().type === 'EXPENSE') expense.push(d.data().name);
    else if (d.data().type === 'INCOME') income.push(d.data().name);
  });
  return { expense, income };
};
api.getCategoriesFull = async () => {
  const cats = await getDocs(collection(db, "users", getUid(), "categories"));
  const items = await getDocs(collection(db, "users", getUid(), "items"));
  const people = await getDocs(collection(db, "users", getUid(), "people"));
  return {
    categories: cats.docs.map(d => ({ row: d.id, ...d.data() })),
    items: items.docs.map(d => ({ row: d.id, ...d.data() })),
    people: people.docs.map(d => ({ row: d.id, ...d.data() }))
  };
};
api.addCategory = async (name, type) => {
  await addDoc(collection(db, "users", getUid(), "categories"), { name, type });
};
api.updateCategory = async (rowId, name, type) => {
  await updateDoc(doc(db, "users", getUid(), "categories", rowId), { name, type });
};
api.deleteCategory = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "categories", rowId));
};

/* Items & People */
api.getItems = async () => {
  const snap = await getDocs(collection(db, "users", getUid(), "items"));
  return snap.docs.map(d => d.data().value);
};
api.addItem = async (value) => {
  await addDoc(collection(db, "users", getUid(), "items"), { value });
};
api.updateItem = async (rowId, value) => {
  await updateDoc(doc(db, "users", getUid(), "items", rowId), { value });
};
api.deleteItem = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "items", rowId));
};

api.getPeople = async () => {
  const snap = await getDocs(collection(db, "users", getUid(), "people"));
  return snap.docs.map(d => d.data().value);
};
api.addPerson = async (value) => {
  await addDoc(collection(db, "users", getUid(), "people"), { value });
};
api.updatePerson = async (rowId, value) => {
  await updateDoc(doc(db, "users", getUid(), "people", rowId), { value });
};
api.deletePerson = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "people", rowId));
};

/* Templates */
api.getTemplates = async () => {
  const snap = await getDocs(collection(db, "users", getUid(), "templates"));
  const expense = [], income = [];
  snap.docs.forEach(d => {
    const t = d.data();
    if (t.type === 'EXPENSE') expense.push(t);
    else income.push(t);
  });
  return { expense, income };
};
api.getTemplatesFull = async () => {
  const snap = await getDocs(collection(db, "users", getUid(), "templates"));
  return snap.docs.map(d => ({ row: d.id, ...d.data() }));
};
api.addTemplate = async (type, name, account, category, item, amount, tofrom) => {
  await addDoc(collection(db, "users", getUid(), "templates"), { type, name, account, category, item, amount, tofrom });
};
api.updateTemplate = async (rowId, type, name, account, category, item, amount, tofrom) => {
  await updateDoc(doc(db, "users", getUid(), "templates", rowId), { type, name, account, category, item, amount, tofrom });
};
api.deleteTemplate = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "templates", rowId));
};
api.webSaveTemplate = async (type, name, account, category, item, amount, tofrom) => {
  await api.addTemplate(type, name, account, category, item, amount, tofrom);
};

/* Transactions */
async function ensureCategory(name, type) {
  if(!name) return;
  const nameUp = name.toUpperCase().trim();
  const cats = await getDocs(collection(db, "users", getUid(), "categories"));
  if(!cats.docs.some(d => d.data().name.toUpperCase().trim() === nameUp)) {
    await api.addCategory(nameUp, type);
  }
}

api.webCreateExpense = async (account, category, amount, item, toFrom) => {
  await addDoc(collection(db, "users", getUid(), "transactions"), {
    date: new Date().toISOString(), account, category, item, amount: -Math.abs(Number(amount)), toFrom
  });
  await recalcAccount(account);
  await ensureCategory(category, 'EXPENSE');
};
api.webCreateIncome = async (account, category, amount, item, toFrom) => {
  await addDoc(collection(db, "users", getUid(), "transactions"), {
    date: new Date().toISOString(), account, category, item, amount: Math.abs(Number(amount)), toFrom
  });
  await recalcAccount(account);
  await ensureCategory(category, 'INCOME');
};
api.webCreateTransfer = async (from, to, amount, item) => {
  const amt = Math.abs(Number(amount));
  const coll = collection(db, "users", getUid(), "transactions");
  await addDoc(coll, { date: new Date().toISOString(), account: from, category: 'TRANSFER', item, amount: -amt, toFrom: to });
  await addDoc(coll, { date: new Date().toISOString(), account: to, category: 'TRANSFER', item, amount: amt, toFrom: from });
  await recalcAccount(from);
  await recalcAccount(to);
};

api.getAllTransactions = async () => {
  const snap = await getDocs(query(collection(db, "users", getUid(), "transactions"), orderBy("date", "desc")));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      row: d.id,
      date: new Date(data.date).toLocaleDateString('en-GB'), // dd/MM/yyyy
      account: data.account,
      category: data.category,
      item: data.item,
      amount: data.amount,
      toFrom: data.toFrom,
      closingBalance: 0 // We'll compute this dynamically if needed
    };
  });
};
api.updateTransaction = async (rowId, account, category, item, amount, toFrom) => {
  await updateDoc(doc(db, "users", getUid(), "transactions", rowId), { account, category, item, amount: Number(amount), toFrom });
  await recalcAccount(account);
};
api.deleteTransaction = async (rowId) => {
  await deleteDoc(doc(db, "users", getUid(), "transactions", rowId));
};

/* Aggregations */
async function recalcAccount(accName) {
  const accSnap = await getDocs(query(collection(db, "users", getUid(), "accounts"), where("name", "==", accName)));
  if (accSnap.empty) return;
  const accDoc = accSnap.docs[0];
  const accData = accDoc.data();
  
  const txnsSnap = await getDocs(query(collection(db, "users", getUid(), "transactions"), where("account", "==", accName)));
  let sum = accData.openingBalance || 0;
  txnsSnap.docs.forEach(d => { sum += Number(d.data().amount); });
  
  await updateDoc(doc(db, "users", getUid(), "accounts", accDoc.id), { currentBalance: sum });
}

api.getDashboardData = async (month, year) => {
  const [txns, accs] = await Promise.all([
    getDocs(collection(db, "users", getUid(), "transactions")),
    api.getAccountsFull()
  ]);
  
  const sd = new Date(year, month - 1, 1).getTime();
  const ed = new Date(year, month, 0, 23, 59, 59).getTime();

  let totalExpense = 0;
  let dailyTotals = {};
  let catTotals = {};

  txns.docs.forEach(d => {
    const data = d.data();
    const tTime = new Date(data.date).getTime();
    if (tTime >= sd && tTime <= ed && data.category !== 'TRANSFER' && data.amount < 0) {
      const amt = Math.abs(data.amount);
      totalExpense += amt;
      const day = new Date(tTime).getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + amt;
      catTotals[data.category] = (catTotals[data.category] || 0) + amt;
    }
  });

  const avgDailyExpense = Object.keys(dailyTotals).length > 0 ? Math.round(totalExpense / Object.keys(dailyTotals).length) : 0;
  const heatmapDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) heatmapDays.push({ day: i, total: dailyTotals[i] || 0 });

  return {
    accounts: accs,
    heatmap: { days: heatmapDays, firstDayOfWeek: new Date(year, month - 1, 1).getDay() },
    avgDailyExpense,
    totalExpense,
    weeklyExpenses: [], // Simplified for now
    categoryExpenses: Object.entries(catTotals).map(([category, total]) => ({ category, total })).sort((a,b)=>b.total-a.total)
  };
};

api.getDashboardAccountLedger = async (month, year, accountName) => {
  const snap = await getDocs(query(collection(db, "users", getUid(), "transactions"), where("account", "==", accountName)));
  const sd = new Date(year, month - 1, 1).getTime();
  const ed = new Date(year, month, 0, 23, 59, 59).getTime();
  
  let txns = snap.docs.map(d => d.data());
  txns.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Need opening balance
  const accs = await api.getAccountsFull();
  const acc = accs.find(a => a.name === accountName);
  let bal = acc ? (acc.openingBalance || 0) : 0;
  
  const res = [];
  for (const t of txns) {
    bal += t.amount;
    const tt = new Date(t.date).getTime();
    if (tt >= sd && tt <= ed && t.category !== 'TRANSFER') {
      res.push({
        date: new Date(tt).toLocaleDateString('en-GB'),
        item: t.item, category: t.category, toFrom: t.toFrom, amount: t.amount, closingBalance: bal
      });
    }
  }
  return res.reverse();
};

api.getDashboardDayExpenses = async (month, year, day) => {
  const snap = await getDocs(collection(db, "users", getUid(), "transactions"));
  const dStart = new Date(year, month - 1, day).getTime();
  const dEnd = new Date(year, month - 1, day, 23, 59, 59).getTime();
  const res = [];
  snap.docs.forEach(doc => {
    const t = doc.data();
    const tt = new Date(t.date).getTime();
    if (tt >= dStart && tt <= dEnd && t.amount < 0 && t.category !== 'TRANSFER') {
      res.push(t);
    }
  });
  return res;
};

// ... add minimal mock for person transfer ...
api.getDashboardPersonTransferView = async (accountName) => [];

// Expose API
window.firebaseAPI = api;
