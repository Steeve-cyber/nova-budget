import { useEffect, useMemo, useState } from 'react';
import CategoryBreakdown from './CategoryBreakdown';
import {
  CATEGORIES,
  calculerTotaux,
  chargerTransactions,
  comparerParDate,
  dateDuJour,
  formaterDate,
  formaterMontant,
  sauvegarderTransactions,
} from './utils';
import type { FilterType, Transaction, TransactionFormValues, TypeTransaction } from './utils';
import './App.css';

type Page = 'accueil' | 'transactions' | 'budgets' | 'analyses';
type IconName = 'grid' | 'arrows' | 'wallet' | 'chart' | 'plus' | 'download' | 'search' | 'bell' | 'sparkles' | 'arrowUp' | 'arrowDown' | 'briefcase' | 'home' | 'basket' | 'car' | 'heart' | 'play' | 'bag' | 'dots' | 'pencil' | 'trash' | 'close' | 'check' | 'undo' | 'trend' | 'calendar' | 'chevron' | 'target';

const paths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  arrows: <><path d="M7 7h11l-3-3" /><path d="M18 7l-3 3M17 17H6l3 3" /><path d="m6 17 3-3" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 14h2" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /><path d="M17 6h4v4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  sparkles: <><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  arrowUp: <><path d="M12 19V5m0 0L6 11m6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14m0 0 6-6m-6 6-6-6" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></>,
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
  basket: <><path d="m3 10 2 10h14l2-10H3Z" /><path d="m8 10 4-7 4 7M9 14v3m6-3v3" /></>,
  car: <><path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><path d="M3 11h18v7H3zM6 18v2m12-2v2M6 14h2m8 0h2" /></>,
  heart: <><path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /><path d="M3 12h5l2-3 3 6 2-3h6" /></>,
  play: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m10 9 5 3-5 3V9Z" /></>,
  bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  pencil: <><path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z" /><path d="m14.5 6 3.5 3.5" /></>,
  trash: <><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h9a7 7 0 0 1 0 14h-2" /></>,
  trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M15 6h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
};

function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navigation: Array<{ id: Page; label: string; icon: IconName }> = [
  { id: 'accueil', label: 'Vue d’ensemble', icon: 'grid' },
  { id: 'transactions', label: 'Transactions', icon: 'arrows' },
  { id: 'budgets', label: 'Budgets', icon: 'wallet' },
  { id: 'analyses', label: 'Analyses', icon: 'chart' },
];

const budgetPlans = [
  { categorie: 'logement', limite: 1100 },
  { categorie: 'alimentation', limite: 420 },
  { categorie: 'transport', limite: 160 },
  { categorie: 'loisirs', limite: 180 },
  { categorie: 'abonnements', limite: 75 },
  { categorie: 'sante', limite: 100 },
  { categorie: 'shopping', limite: 220 },
  { categorie: 'autre', limite: 150 },
];

const BUDGET_STORAGE_KEY = 'nova-budget-limits';

function chargerBudgets(): Record<string, number> {
  try {
    const saved = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!saved) return {};
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isFinite(Number(value)) && Number(value) > 0).map(([key, value]) => [key, Number(value)]));
  } catch {
    return {};
  }
}

const monthDate = (offset: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
};

const monthLabel = (date: Date, short = true) => new Intl.DateTimeFormat('fr-FR', { month: short ? 'short' : 'long' }).format(date).replace('.', '');

function getMonthlyData(transactions: Transaction[]) {
  return Array.from({ length: 6 }, (_, index) => {
    const month = monthDate(index - 5);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const entries = transactions.filter((transaction) => transaction.date.startsWith(key));
    return {
      label: monthLabel(month),
      revenus: entries.filter((item) => item.type === 'revenu').reduce((sum, item) => sum + item.montant, 0),
      depenses: entries.filter((item) => item.type === 'depense').reduce((sum, item) => sum + item.montant, 0),
    };
  });
}

function buildLine(values: number[], max: number) {
  return values.map((value, index) => {
    const x = 38 + index * 128;
    const y = 196 - (value / max) * 164;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

function TrendChart({ data }: { data: ReturnType<typeof getMonthlyData> }) {
  const max = Math.max(100, ...data.flatMap((item) => [item.revenus, item.depenses])) * 1.12;
  const revenueLine = buildLine(data.map((item) => item.revenus), max);
  const expenseLine = buildLine(data.map((item) => item.depenses), max);
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">VOTRE ÉVOLUTION</p><h2>Revenus & dépenses</h2></div>
        <span className="period-pill"><Icon name="calendar" size={15} /> 6 derniers mois</span>
      </div>
      <div className="chart-legend"><span><i className="legend-dot income-dot" /> Revenus</span><span><i className="legend-dot expense-dot" /> Dépenses</span></div>
      <div className="chart-wrap" role="img" aria-label="Graphique des revenus et dépenses des six derniers mois">
        <svg className="trend-chart" viewBox="0 0 720 236" preserveAspectRatio="none">
          {[32, 86, 141, 196].map((y) => <line key={y} x1="38" x2="678" y1={y} y2={y} className="chart-gridline" />)}
          <path d={`${revenueLine} L 678 196 L 38 196 Z`} className="chart-area income-area" />
          <path d={`${expenseLine} L 678 196 L 38 196 Z`} className="chart-area expense-area" />
          <path d={revenueLine} className="chart-line income-line" />
          <path d={expenseLine} className="chart-line expense-line" />
          {data.map((item, index) => {
            const x = 38 + index * 128;
            const incomeY = 196 - (item.revenus / max) * 164;
            const expenseY = 196 - (item.depenses / max) * 164;
            return <g key={item.label}><circle cx={x} cy={incomeY} r="4" className="chart-point income-point" /><circle cx={x} cy={expenseY} r="4" className="chart-point expense-point" /></g>;
          })}
        </svg>
        <div className="chart-months">{data.map((item) => <span key={item.label}>{item.label}</span>)}</div>
      </div>
      <div className="chart-footer"><span>Un aperçu clair de votre équilibre financier</span><span><Icon name="trend" size={15} /> Actualisé en temps réel</span></div>
    </section>
  );
}

function TransactionRows({
  transactions,
  onEdit,
  onDelete,
  compact = false,
}: {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  compact?: boolean;
}) {
  if (!transactions.length) {
    return <div className="empty-state"><span className="empty-icon"><Icon name="arrows" size={22} /></span><strong>Aucune transaction ici</strong><p>Essayez de modifier vos filtres ou ajoutez une opération.</p></div>;
  }

  return <div className={`transaction-table ${compact ? 'transaction-table-compact' : ''}`}>
    {transactions.map((transaction) => {
      const category = CATEGORIES[transaction.categorie] ?? CATEGORIES.autre;
      return <div className="transaction-row" key={transaction.id}>
        <span className="category-icon" style={{ '--category-color': category.color } as React.CSSProperties}><Icon name={category.icon as IconName} size={18} /></span>
        <div className="transaction-main"><strong>{transaction.titre}</strong><span>{category.label} <i>·</i> {formaterDate(transaction.date, { day: 'numeric', month: 'short', year: compact ? undefined : 'numeric' })}</span></div>
        <span className={`type-chip ${transaction.type}`}>{transaction.type === 'revenu' ? 'Revenu' : 'Dépense'}</span>
        <strong className={`transaction-amount ${transaction.type}`}>{transaction.type === 'revenu' ? '+' : '−'}{formaterMontant(transaction.montant)}</strong>
        <div className="row-actions">
          <button className="icon-button" type="button" aria-label={`Modifier ${transaction.titre}`} title="Modifier" onClick={() => onEdit(transaction)}><Icon name="pencil" size={16} /></button>
          <button className="icon-button danger-action" type="button" aria-label={`Supprimer ${transaction.titre}`} title="Supprimer" onClick={() => onDelete(transaction)}><Icon name="trash" size={16} /></button>
        </div>
      </div>;
    })}
  </div>;
}

function TransactionDialog({
  transaction,
  onClose,
  onSave,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (values: TransactionFormValues, type: TypeTransaction) => void;
}) {
  const [type, setType] = useState<TypeTransaction>(transaction?.type ?? 'depense');
  const [titre, setTitre] = useState(transaction?.titre ?? '');
  const [montant, setMontant] = useState(transaction ? String(transaction.montant) : '');
  const [categorie, setCategorie] = useState(transaction?.categorie ?? 'alimentation');
  const [date, setDate] = useState(transaction?.date ?? dateDuJour());
  const [error, setError] = useState('');
  const getCategories = (transactionType: TypeTransaction) => Object.entries(CATEGORIES).filter(([key, item]) => item.type === transactionType && !['loyer', 'courses'].includes(key));
  const categories = getCategories(type);
  const changeType = (nextType: TypeTransaction) => {
    setType(nextType);
    const nextCategories = getCategories(nextType);
    if (!nextCategories.some(([key]) => key === categorie)) setCategorie(nextCategories[0]?.[0] ?? 'autre');
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(montant);
    if (!titre.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !date) {
      setError('Vérifiez le libellé, le montant et la date.');
      return;
    }
    onSave({ titre: titre.trim(), montant: parsedAmount, categorie, date }, type);
  };

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title">
      <div className="modal-heading"><div><p className="eyebrow">{transaction ? 'METTRE À JOUR' : 'NOUVELLE OPÉRATION'}</p><h2 id="transaction-dialog-title">{transaction ? 'Modifier la transaction' : 'Ajouter une transaction'}</h2></div><button className="icon-button" type="button" aria-label="Fermer" onClick={onClose}><Icon name="close" /></button></div>
      <div className="type-switch" role="group" aria-label="Type de transaction">
        <button type="button" className={type === 'depense' ? 'selected expense-selected' : ''} onClick={() => changeType('depense')}><Icon name="arrowDown" size={17} /> Dépense</button>
        <button type="button" className={type === 'revenu' ? 'selected income-selected' : ''} onClick={() => changeType('revenu')}><Icon name="arrowUp" size={17} /> Revenu</button>
      </div>
      <form onSubmit={submit} className="transaction-form">
        <label className="field"><span>Libellé</span><input autoFocus value={titre} onChange={(event) => setTitre(event.target.value)} placeholder={type === 'revenu' ? 'Ex. Salaire, mission…' : 'Ex. Courses, abonnement…'} maxLength={70} required /></label>
        <div className="form-grid">
          <label className="field"><span>Montant</span><div className="amount-input"><input type="number" inputMode="decimal" min="0.01" step="0.01" value={montant} onChange={(event) => setMontant(event.target.value)} placeholder="0,00" required /><span>EUR</span></div></label>
          <label className="field"><span>Catégorie</span><select value={categorie} onChange={(event) => setCategorie(event.target.value)}>{categories.map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
        </div>
        <label className="field"><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Annuler</button><button className="button button-primary" type="submit"><Icon name="check" size={17} /> {transaction ? 'Enregistrer les changements' : 'Ajouter la transaction'}</button></div>
      </form>
    </section>
  </div>;
}

function BudgetList({ transactions, limit = 4, budgetLimits }: { transactions: Transaction[]; limit?: number; budgetLimits: Record<string, number> }) {
  const spending = useMemo(() => transactions.filter((item) => item.type === 'depense'), [transactions]);
  const visiblePlans = budgetPlans.slice(0, limit);
  return <div className="budget-list">{visiblePlans.map((plan) => {
    const category = CATEGORIES[plan.categorie];
    const monthlyLimit = budgetLimits[plan.categorie] ?? plan.limite;
    const spent = spending.filter((item) => item.categorie === plan.categorie || (plan.categorie === 'alimentation' && item.categorie === 'courses') || (plan.categorie === 'logement' && item.categorie === 'loyer')).reduce((sum, item) => sum + item.montant, 0);
    const ratio = Math.min(100, Math.round((spent / monthlyLimit) * 100));
    return <div className="budget-item" key={plan.categorie}>
      <div className="budget-label"><span className="category-icon small" style={{ '--category-color': category.color } as React.CSSProperties}><Icon name={category.icon as IconName} size={15} /></span><span>{category.label}</span><strong>{formaterMontant(spent)} <i>/ {formaterMontant(monthlyLimit)}</i></strong></div>
      <div className="budget-track"><span style={{ width: `${ratio}%`, '--category-color': category.color } as React.CSSProperties} /></div>
      <div className="budget-foot"><span>{ratio >= 100 ? 'Budget dépassé' : `${Math.max(monthlyLimit - spent, 0).toLocaleString('fr-FR')} € restants`}</span><span>{ratio}%</span></div>
    </div>;
  })}</div>;
}

function BudgetDialog({
  budgetLimits,
  onClose,
  onSave,
}: {
  budgetLimits: Record<string, number>;
  onClose: () => void;
  onSave: (values: Record<string, number>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(budgetPlans.map((plan) => [plan.categorie, String(budgetLimits[plan.categorie] ?? plan.limite)])));
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Object.fromEntries(budgetPlans.map((plan) => [plan.categorie, Number(values[plan.categorie])]));
    if (Object.values(parsed).some((amount) => !Number.isFinite(amount) || amount <= 0)) return;
    onSave(parsed);
  };

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="transaction-modal budget-modal" role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title">
      <div className="modal-heading"><div><p className="eyebrow">VOS REPÈRES MENSUELS</p><h2 id="budget-dialog-title">Ajuster mes budgets</h2></div><button className="icon-button" type="button" aria-label="Fermer" onClick={onClose}><Icon name="close" /></button></div>
      <p className="budget-dialog-copy">Définissez une enveloppe pour chaque catégorie. Vous pourrez les ajuster à tout moment.</p>
      <form onSubmit={save} className="budget-edit-form"><div className="budget-edit-grid">{budgetPlans.map((plan) => {
        const category = CATEGORIES[plan.categorie];
        return <label key={plan.categorie} className="budget-edit-field"><span className="category-icon small" style={{ '--category-color': category.color } as React.CSSProperties}><Icon name={category.icon as IconName} size={15} /></span><span>{category.label}</span><div><input type="number" min="1" step="10" inputMode="decimal" aria-label={`Budget mensuel pour ${category.label}`} value={values[plan.categorie]} onChange={(event) => setValues((current) => ({ ...current, [plan.categorie]: event.target.value }))} required /><small>€</small></div></label>;
      })}</div><div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Annuler</button><button className="button button-primary" type="submit"><Icon name="check" size={17} /> Enregistrer les budgets</button></div></form>
    </section>
  </div>;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => chargerTransactions());
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() => chargerBudgets());
  const [activePage, setActivePage] = useState<Page>('accueil');
  const [filter, setFilter] = useState<FilterType>('tous');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; undo?: Transaction } | null>(null);

  useEffect(() => { sauvegarderTransactions(transactions); }, [transactions]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => transactions.filter((item) => item.date.startsWith(currentMonth)), [transactions, currentMonth]);
  const allTotals = useMemo(() => calculerTotaux(transactions), [transactions]);
  const monthTotals = useMemo(() => calculerTotaux(monthTransactions), [monthTransactions]);
  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);
  const expenseBudgets = budgetPlans.reduce((sum, item) => sum + (budgetLimits[item.categorie] ?? item.limite), 0);
  const savingRate = monthTotals.revenus ? Math.max(0, Math.round((monthTotals.solde / monthTotals.revenus) * 100)) : 0;
  const currentMonthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(today);
  const sortedTransactions = useMemo(() => [...transactions].sort(comparerParDate), [transactions]);
  const filteredTransactions = useMemo(() => sortedTransactions.filter((item) => {
    const matchesType = filter === 'tous' || item.type === filter;
    const category = CATEGORIES[item.categorie]?.label ?? item.categorie;
    const query = search.trim().toLocaleLowerCase('fr-FR');
    return matchesType && (!query || `${item.titre} ${category}`.toLocaleLowerCase('fr-FR').includes(query));
  }), [sortedTransactions, filter, search]);
  const recentTransactions = sortedTransactions.slice(0, 5);

  const startNew = () => { setEditing(null); setDialogOpen(true); };
  const startEdit = (transaction: Transaction) => { setEditing(transaction); setDialogOpen(true); };
  const saveTransaction = (values: TransactionFormValues, type: TypeTransaction) => {
    const categoryType = CATEGORIES[values.categorie]?.type;
    if (categoryType !== type) return;
    if (editing) {
      setTransactions((current) => current.map((item) => item.id === editing.id ? { ...item, ...values, type } : item));
      setToast({ message: 'Transaction mise à jour' });
    } else {
      const item: Transaction = { ...values, type, id: Date.now() };
      setTransactions((current) => [item, ...current]);
      setToast({ message: 'Transaction ajoutée' });
    }
    setDialogOpen(false);
    setEditing(null);
  };
  const deleteTransaction = (transaction: Transaction) => {
    setTransactions((current) => current.filter((item) => item.id !== transaction.id));
    setToast({ message: 'Transaction supprimée', undo: transaction });
  };
  const undoDelete = () => {
    if (!toast?.undo) return;
    setTransactions((current) => [...current, toast.undo!].sort(comparerParDate));
    setToast({ message: 'Suppression annulée' });
  };
  const exportCsv = () => {
    const rows = [['Date', 'Libellé', 'Type', 'Catégorie', 'Montant'], ...sortedTransactions.map((item) => [item.date, item.titre, item.type === 'revenu' ? 'Revenu' : 'Dépense', CATEGORIES[item.categorie]?.label ?? item.categorie, item.montant.toFixed(2)])];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nova-budget-${dateDuJour()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Export CSV téléchargé' });
  };
  const resetDemo = () => {
    const demo = chargerTransactions();
    if (demo.length === 0) {
      window.localStorage.removeItem('transactions');
      setTransactions(chargerTransactions());
      setToast({ message: 'Données de démonstration restaurées' });
    }
  };
  const saveBudgets = (values: Record<string, number>) => {
    setBudgetLimits(values);
    try { window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(values)); } catch { /* Le suivi reste utilisable sans stockage local. */ }
    setBudgetEditorOpen(false);
    setToast({ message: 'Budgets mis à jour' });
  };

  const pageTitle = navigation.find((item) => item.id === activePage)?.label ?? 'Vue d’ensemble';

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#accueil" onClick={(event) => { event.preventDefault(); setActivePage('accueil'); }} aria-label="Nova, accueil"><span className="brand-mark"><Icon name="sparkles" size={20} /></span><span>nova<span className="brand-period">.</span></span></a>
      <p className="sidebar-caption">ESPACE PERSONNEL</p>
      <nav className="primary-nav" aria-label="Navigation principale">{navigation.map((item) => <button type="button" key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{activePage === item.id && <i className="nav-indicator" />}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-goal"><div className="goal-icon"><Icon name="target" size={18} /></div><p className="eyebrow">CAP SUR L’ÉPARGNE</p><strong>{formaterMontant(Math.max(monthTotals.solde, 0))}</strong><span>épargnés ce mois-ci</span><div className="goal-track"><span style={{ width: `${Math.min(100, Math.round((Math.max(monthTotals.solde, 0) / 800) * 100))}%` }} /></div><small>Objectif mensuel : 800 €</small></div>
      <div className="profile-row"><div className="avatar">CM</div><div className="profile-copy"><strong>Camille Martin</strong><span>Compte personnel</span></div><button type="button" aria-label="Options du profil" className="profile-more"><Icon name="dots" /></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div><span className="breadcrumb">Mon espace <i>/</i> <strong>{pageTitle}</strong></span><p className="topbar-date">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(today)}</p></div><div className="topbar-actions"><span className="secure-label"><span /> Données enregistrées localement</span><button type="button" className="icon-button notification-button" aria-label="Aucune nouvelle notification"><Icon name="bell" size={19} /><i /></button><button type="button" className="button button-primary top-add" onClick={startNew}><Icon name="plus" size={17} /> Nouvelle transaction</button></div></header>

      <div className="page-content" key={activePage}>
        {activePage === 'accueil' && <>
          <div className="welcome-row"><div><p className="eyebrow">VOTRE SANTÉ FINANCIÈRE</p><h1>Bonjour, Camille <span className="wave">✦</span></h1><p className="page-subtitle">Voici ce qui se passe avec vos finances.</p></div><button className="button button-secondary" type="button" onClick={exportCsv}><Icon name="download" size={17} /> Exporter</button></div>
          <section className="overview-grid">
            <article className="balance-card"><div className="balance-top"><span className="balance-label"><Icon name="wallet" size={17} /> SOLDE DISPONIBLE</span><span className="balance-period">{currentMonthLabel}</span></div><div className="balance-amount">{formaterMontant(allTotals.solde)}</div><div className="balance-bottom"><span className="balance-trend"><Icon name="trend" size={15} /> {savingRate}% de revenus conservés</span><span className="balance-note">Mis à jour à l’instant</span></div><div className="balance-decoration balance-decoration-one" /><div className="balance-decoration balance-decoration-two" /></article>
            <article className="stat-card income-stat"><div className="stat-top"><span>Revenus du mois</span><span className="stat-icon"><Icon name="arrowDown" size={18} /></span></div><strong>{formaterMontant(monthTotals.revenus)}</strong><div className="stat-foot"><span className="stat-bullet income-bullet" /> {monthTransactions.filter((item) => item.type === 'revenu').length} entrées enregistrées</div></article>
            <article className="stat-card expense-stat"><div className="stat-top"><span>Dépenses du mois</span><span className="stat-icon"><Icon name="arrowUp" size={18} /></span></div><strong>{formaterMontant(monthTotals.depenses)}</strong><div className="stat-foot"><span className="stat-bullet expense-bullet" /> {monthTransactions.filter((item) => item.type === 'depense').length} sorties enregistrées</div></article>
          </section>
          <section className="content-grid home-grid"><div className="content-main"><TrendChart data={monthlyData} /><section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">LES DERNIERS MOUVEMENTS</p><h2>Transactions récentes</h2></div><button className="text-button" type="button" onClick={() => setActivePage('transactions')}>Tout voir <Icon name="chevron" size={16} /></button></div><TransactionRows transactions={recentTransactions} onEdit={startEdit} onDelete={deleteTransaction} compact /></section></div><aside className="content-aside"><section className="panel budget-preview"><div className="panel-heading"><div><p className="eyebrow">CE MOIS-CI</p><h2>Vos budgets</h2></div><button className="round-arrow" type="button" aria-label="Voir tous les budgets" onClick={() => setActivePage('budgets')}><Icon name="chevron" size={17} /></button></div><div className="budget-summary"><div><span>Total dépensé</span><strong>{formaterMontant(monthTotals.depenses)}</strong></div><span className="budget-total">sur {formaterMontant(expenseBudgets)}</span></div><div className="overall-track"><span style={{ width: `${Math.min(100, Math.round((monthTotals.depenses / expenseBudgets) * 100))}%` }} /></div><BudgetList transactions={monthTransactions} budgetLimits={budgetLimits} /></section><section className="insight-card"><span className="insight-icon"><Icon name="sparkles" size={18} /></span><p className="eyebrow">VOTRE PETIT PLUS</p><h3>Vous gardez le bon cap.</h3><p>Vous avez conservé <strong>{savingRate}%</strong> de vos revenus ce mois-ci. Continuez comme ça !</p><button type="button" className="insight-link" onClick={() => setActivePage('analyses')}>Explorer mes analyses <Icon name="chevron" size={15} /></button></section></aside></section>
        </>}

        {activePage === 'transactions' && <>
          <div className="welcome-row"><div><p className="eyebrow">VOTRE HISTORIQUE</p><h1>Toutes vos transactions</h1><p className="page-subtitle">Retrouvez et gérez chaque mouvement de votre compte.</p></div><button className="button button-secondary" type="button" onClick={exportCsv}><Icon name="download" size={17} /> Exporter CSV</button></div>
          <section className="panel full-transaction-panel"><div className="list-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filtrer les transactions">{(['tous', 'revenu', 'depense'] as FilterType[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'tous' ? 'Tout' : item === 'revenu' ? 'Revenus' : 'Dépenses'}<span>{item === 'tous' ? transactions.length : transactions.filter((entry) => entry.type === item).length}</span></button>)}</div><label className="search-box"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une transaction" aria-label="Rechercher une transaction" />{search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch('')}><Icon name="close" size={15} /></button>}</label></div><div className="list-meta"><span>{filteredTransactions.length} opération{filteredTransactions.length > 1 ? 's' : ''}</span><span>Triées par date <Icon name="chevron" size={14} /></span></div><TransactionRows transactions={filteredTransactions} onEdit={startEdit} onDelete={deleteTransaction} /></section>
          <div className="data-note"><Icon name="check" size={16} /> Vos données sont conservées sur cet appareil et ne sont jamais envoyées sur un serveur.</div>
        </>}

        {activePage === 'budgets' && <>
          <div className="welcome-row"><div><p className="eyebrow">GARDER LE CAP</p><h1>Vos budgets</h1><p className="page-subtitle">Des repères simples pour mieux piloter vos dépenses.</p></div><button className="button button-primary" type="button" onClick={() => setBudgetEditorOpen(true)}><Icon name="pencil" size={16} /> Ajuster mes budgets</button></div>
          <div className="budget-summary-grid"><article className="panel budget-total-card"><span className="stat-icon"><Icon name="wallet" /></span><p>Enveloppe mensuelle</p><strong>{formaterMontant(expenseBudgets)}</strong><span>Répartie sur {budgetPlans.length} catégories</span></article><article className="panel budget-total-card"><span className="stat-icon"><Icon name="arrowUp" /></span><p>Dépensé ce mois</p><strong>{formaterMontant(monthTotals.depenses)}</strong><span>{Math.round((monthTotals.depenses / expenseBudgets) * 100)} % de votre enveloppe</span></article><article className="panel budget-total-card"><span className="stat-icon"><Icon name="target" /></span><p>Disponible</p><strong>{formaterMontant(Math.max(expenseBudgets - monthTotals.depenses, 0))}</strong><span>À votre rythme jusqu’à la fin du mois</span></article></div>
          <section className="panel all-budgets-panel"><div className="panel-heading"><div><p className="eyebrow">{currentMonthLabel.toLocaleUpperCase('fr-FR')}</p><h2>Suivi par catégorie</h2></div><span className="period-pill"><Icon name="calendar" size={15} /> Budget mensuel</span></div><BudgetList transactions={monthTransactions} limit={budgetPlans.length} budgetLimits={budgetLimits} /></section>
          <section className="budget-tip"><span className="insight-icon"><Icon name="sparkles" size={18} /></span><div><strong>Un budget qui vous ressemble</strong><p>Ces enveloppes sont des repères de départ. Ajustez-les à vos priorités et faites évoluer vos objectifs au fil des mois.</p></div></section>
        </>}

        {activePage === 'analyses' && <>
          <div className="welcome-row"><div><p className="eyebrow">PRENDRE DU RECUL</p><h1>Vos analyses</h1><p className="page-subtitle">Comprenez vos habitudes et voyez le chemin parcouru.</p></div><span className="period-pill"><Icon name="calendar" size={15} /> 6 derniers mois</span></div>
          <section className="analysis-stats"><article className="panel analysis-metric"><span>Revenus ce mois</span><strong className="revenu">{formaterMontant(monthTotals.revenus)}</strong><small>Sur {monthTransactions.filter((item) => item.type === 'revenu').length} entrées</small></article><article className="panel analysis-metric"><span>Dépenses ce mois</span><strong className="depense">{formaterMontant(monthTotals.depenses)}</strong><small>Sur {monthTransactions.filter((item) => item.type === 'depense').length} sorties</small></article><article className="panel analysis-metric"><span>Taux d’épargne</span><strong>{savingRate}%</strong><small>{formaterMontant(Math.max(monthTotals.solde, 0))} mis de côté</small></article></section>
          <section className="analysis-layout"><TrendChart data={monthlyData} /><section className="panel category-analysis"><div className="panel-heading"><div><p className="eyebrow">OÙ VA VOTRE ARGENT ?</p><h2>Répartition des dépenses</h2></div><span className="period-pill">Ce mois</span></div><CategoryBreakdown transactions={monthTransactions} /></section></section>
          <section className="insight-card wide-insight"><span className="insight-icon"><Icon name="sparkles" size={18} /></span><div><p className="eyebrow">VOTRE BILAN</p><h3>{monthTotals.solde >= 0 ? 'Un mois dans le vert.' : 'Un mois à rééquilibrer.'}</h3><p>{monthTotals.solde >= 0 ? `Après vos dépenses, il vous reste ${formaterMontant(monthTotals.solde)}. Vous avez épargné ${savingRate}% de vos revenus ce mois-ci.` : `Vos dépenses dépassent vos revenus de ${formaterMontant(Math.abs(monthTotals.solde))}. Consultez vos budgets pour trouver une marge de manœuvre.`}</p></div></section>
        </>}

        {transactions.length === 0 && <section className="empty-data-banner"><div><strong>Votre tableau de bord est prêt.</strong><p>Ajoutez votre première opération ou rechargez les données de démonstration.</p></div><div><button className="button button-secondary" type="button" onClick={resetDemo}><Icon name="sparkles" size={16} /> Recharger la démo</button><button className="button button-primary" type="button" onClick={startNew}><Icon name="plus" size={16} /> Ajouter</button></div></section>}
      </div>
      <footer className="app-footer"><span>Nova Budget <i>·</i> Votre argent, en mieux.</span><span><Icon name="check" size={14} /> Privé par conception</span></footer>
    </main>

    {dialogOpen && <TransactionDialog key={editing?.id ?? 'new'} transaction={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} onSave={saveTransaction} />}
    {budgetEditorOpen && <BudgetDialog budgetLimits={budgetLimits} onClose={() => setBudgetEditorOpen(false)} onSave={saveBudgets} />}
    {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span><span>{toast.message}</span>{toast.undo && <button type="button" onClick={undoDelete}><Icon name="undo" size={15} /> Annuler</button>}<button className="toast-close" type="button" aria-label="Fermer le message" onClick={() => setToast(null)}><Icon name="close" size={15} /></button></div>}
  </div>;
}
