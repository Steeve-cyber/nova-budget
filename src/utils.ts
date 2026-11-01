export type TypeTransaction = 'revenu' | 'depense';
export type FilterType = 'tous' | TypeTransaction;

export type Transaction = {
  id: number;
  titre: string;
  montant: number;
  categorie: string;
  type: TypeTransaction;
  date: string;
};

export type TransactionFormValues = Omit<Transaction, 'id' | 'type'>;

export type CategoryDefinition = {
  label: string;
  type: TypeTransaction;
  color: string;
  icon: string;
};

export const CATEGORIES: Record<string, CategoryDefinition> = {
  salaire: { label: 'Salaire', type: 'revenu', color: '#4f8cff', icon: 'briefcase' },
  freelance: { label: 'Freelance', type: 'revenu', color: '#8c6df2', icon: 'sparkles' },
  investissement: { label: 'Investissements', type: 'revenu', color: '#18a999', icon: 'chart' },
  logement: { label: 'Logement', type: 'depense', color: '#f28c52', icon: 'home' },
  loyer: { label: 'Logement', type: 'depense', color: '#f28c52', icon: 'home' },
  alimentation: { label: 'Alimentation', type: 'depense', color: '#f1b94b', icon: 'basket' },
  courses: { label: 'Alimentation', type: 'depense', color: '#f1b94b', icon: 'basket' },
  transport: { label: 'Transport', type: 'depense', color: '#43a8a0', icon: 'car' },
  sante: { label: 'Santé', type: 'depense', color: '#ef6e82', icon: 'heart' },
  loisirs: { label: 'Loisirs', type: 'depense', color: '#9171db', icon: 'sparkles' },
  abonnements: { label: 'Abonnements', type: 'depense', color: '#6d8cb8', icon: 'play' },
  shopping: { label: 'Shopping', type: 'depense', color: '#de7daa', icon: 'bag' },
  autre: { label: 'Autre', type: 'depense', color: '#8793a7', icon: 'dots' },
};

const STORAGE_KEY = 'transactions';

const dateLocale = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateDuMois = (decalage: number, jour: number): string => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() + decalage, 1);
  const maxDay = decalage === 0 ? now.getDate() : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  return dateLocale(new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(jour, maxDay)));
};

const makeDemoTransactions = (): Transaction[] => {
  const mois: Array<{ salaire: number; freelance: number; courses: number; transport: number; loisirs: number }> = [
    { salaire: 2680, freelance: 340, courses: 318, transport: 74, loisirs: 96 },
    { salaire: 2680, freelance: 510, courses: 352, transport: 82, loisirs: 128 },
    { salaire: 2680, freelance: 280, courses: 336, transport: 68, loisirs: 84 },
    { salaire: 2780, freelance: 620, courses: 372, transport: 92, loisirs: 146 },
    { salaire: 2780, freelance: 460, courses: 344, transport: 76, loisirs: 112 },
    { salaire: 2780, freelance: 390, courses: 286, transport: 54, loisirs: 68 },
  ];

  return mois.flatMap((values, index) => {
    const offset = index - (mois.length - 1);
    return [
      { id: index * 10 + 1, titre: 'Salaire mensuel', montant: values.salaire, categorie: 'salaire', type: 'revenu' as const, date: dateDuMois(offset, 1) },
      { id: index * 10 + 2, titre: 'Mission freelance', montant: values.freelance, categorie: 'freelance', type: 'revenu' as const, date: dateDuMois(offset, 12) },
      { id: index * 10 + 3, titre: 'Loyer & charges', montant: 980, categorie: 'logement', type: 'depense' as const, date: dateDuMois(offset, 3) },
      { id: index * 10 + 4, titre: 'Courses du mois', montant: values.courses, categorie: 'alimentation', type: 'depense' as const, date: dateDuMois(offset, 9) },
      { id: index * 10 + 5, titre: 'Transports', montant: values.transport, categorie: 'transport', type: 'depense' as const, date: dateDuMois(offset, 16) },
      { id: index * 10 + 6, titre: index === mois.length - 1 ? 'Abonnement musique' : 'Sorties & loisirs', montant: index === mois.length - 1 ? 11 : values.loisirs, categorie: index === mois.length - 1 ? 'abonnements' : 'loisirs', type: 'depense' as const, date: dateDuMois(offset, 22) },
    ];
  });
};

export const TRANSACTIONS_DEPART = makeDemoTransactions();

export function normaliserTransaction(value: unknown, index = 0): Transaction | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<Transaction>;
  const rawCategory = item.categorie === 'courses' ? 'alimentation' : item.categorie === 'loyer' ? 'logement' : item.categorie;
  const categorie = typeof rawCategory === 'string' && CATEGORIES[rawCategory] ? rawCategory : 'autre';
  const montant = Number(item.montant);
  if (!Number.isFinite(montant) || montant <= 0) return null;

  return {
    id: Number(item.id) || Date.now() + index,
    titre: String(item.titre ?? 'Transaction').trim() || 'Transaction',
    montant,
    categorie,
    type: item.type === 'revenu' || item.type === 'depense' ? item.type : CATEGORIES[categorie].type,
    date: typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : dateLocale(new Date()),
  };
}

export function chargerTransactions(): Transaction[] {
  if (typeof window === 'undefined') return TRANSACTIONS_DEPART;

  try {
    const stock = window.localStorage.getItem(STORAGE_KEY);
    if (stock === null) return TRANSACTIONS_DEPART;
    const parsed: unknown = JSON.parse(stock);
    if (!Array.isArray(parsed)) return TRANSACTIONS_DEPART;
    return parsed.map(normaliserTransaction).filter((item): item is Transaction => item !== null);
  } catch {
    return TRANSACTIONS_DEPART;
  }
}

export function sauvegarderTransactions(transactions: Transaction[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // L'application reste utilisable même si le navigateur bloque le stockage local.
  }
}

export function calculerTotaux(transactions: Transaction[]) {
  const revenus = transactions.filter((t) => t.type === 'revenu').reduce((sum, t) => sum + t.montant, 0);
  const depenses = transactions.filter((t) => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
  return { solde: revenus - depenses, revenus, depenses };
}

export function formaterMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(montant);
}

export function comparerParDate(a: Transaction, b: Transaction): number {
  return b.date.localeCompare(a.date) || b.id - a.id;
}

export function dateDuJour(): string {
  return dateLocale(new Date());
}

export function formaterDate(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat('fr-FR', options).format(parsed);
}
