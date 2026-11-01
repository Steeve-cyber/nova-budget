import type { Transaction } from './utils';
import { CATEGORIES, formaterMontant } from './utils';

export default function CategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const expenses = transactions.filter((transaction) => transaction.type === 'depense');
  const total = expenses.reduce((sum, transaction) => sum + transaction.montant, 0);
  const grouped = expenses.reduce<Record<string, number>>((result, transaction) => {
    const key = transaction.categorie === 'courses' ? 'alimentation' : transaction.categorie === 'loyer' ? 'logement' : transaction.categorie;
    result[key] = (result[key] ?? 0) + transaction.montant;
    return result;
  }, {});
  const categories = Object.entries(grouped).sort(([, a], [, b]) => b - a);

  if (total === 0) return <p className="empty-breakdown">Ajoutez quelques dépenses pour découvrir leur répartition.</p>;

  return <div className="breakdown-list">{categories.map(([key, amount]) => {
    const category = CATEGORIES[key] ?? CATEGORIES.autre;
    const ratio = Math.round((amount / total) * 100);
    return <div className="breakdown-item" key={key}>
      <div className="breakdown-info"><span><i className="breakdown-dot" style={{ background: category.color }} />{category.label}</span><strong>{formaterMontant(amount)} <small>{ratio}%</small></strong></div>
      <div className="breakdown-track"><span style={{ width: `${ratio}%`, background: category.color }} /></div>
    </div>;
  })}</div>;
}
