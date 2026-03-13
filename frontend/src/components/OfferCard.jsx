import AnimatedCard from './ui/AnimatedCard';

function OfferCard({ icon: Icon, title, description }) {
  return (
    <AnimatedCard className="group relative overflow-hidden p-6">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-primary/0 via-secondary/70 to-accent/0" />
      <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-3 text-primary shadow-[0_10px_30px_rgba(99,102,241,0.18)] floating dark:text-accent">
        <Icon size={22} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </AnimatedCard>
  );
}

export default OfferCard;
