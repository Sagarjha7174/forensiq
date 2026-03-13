import AnimatedButton from './ui/AnimatedButton';
import AnimatedCard from './ui/AnimatedCard';

function WorkshopCard({ workshop }) {
  return (
    <AnimatedCard className="group overflow-hidden">
      <img
        src={workshop.image}
        alt={workshop.title}
        className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-accent">
          {new Date(workshop.date).toLocaleDateString()}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-primary">{workshop.title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{workshop.description}</p>
        <AnimatedButton variant="ghost" className="mt-4">
          Register
        </AnimatedButton>
      </div>
    </AnimatedCard>
  );
}

export default WorkshopCard;
