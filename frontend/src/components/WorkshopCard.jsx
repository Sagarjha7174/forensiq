import { Link } from 'react-router-dom';
import AnimatedButton from './ui/AnimatedButton';
import { isAuthenticated } from '../services/authStorage';
import AnimatedCard from './ui/AnimatedCard';

function WorkshopCard({ workshop }) {
  const destination = isAuthenticated() ? '/dashboard' : '/signup';

  return (
    <AnimatedCard className="overflow-hidden rounded-xl">
      <img
        src={
          workshop.image ||
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
        }
        alt={workshop.title}
        className="h-44 w-full object-cover"
      />
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
          {new Date(workshop.date).toLocaleDateString()}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{workshop.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{workshop.description}</p>
        <Link to={destination} className="mt-4 inline-flex">
          <AnimatedButton variant="primary">Register</AnimatedButton>
        </Link>
      </div>
    </AnimatedCard>
  );
}

export default WorkshopCard;
