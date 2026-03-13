import AnimatedCard from './ui/AnimatedCard';

function OfferCard({ icon: Icon, title, description }) {
  return (
    <AnimatedCard className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800" hover={false}>
      <div className="mb-5 inline-flex rounded-lg bg-slate-100 p-3 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">
        <Icon size={22} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </AnimatedCard>
  );
}

export default OfferCard;
