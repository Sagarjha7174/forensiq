import AnimatedCard from './ui/AnimatedCard';

function OfferCard({ icon: Icon, title, description }) {
  return (
    <AnimatedCard className="p-5">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary floating">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </AnimatedCard>
  );
}

export default OfferCard;
