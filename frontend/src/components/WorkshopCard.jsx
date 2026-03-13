import { motion } from 'framer-motion';

function WorkshopCard({ workshop }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      className="glass-card overflow-hidden rounded-2xl shadow-glow"
    >
      <img src={workshop.image} alt={workshop.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-accent">
          {new Date(workshop.date).toLocaleDateString()}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-primary">{workshop.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{workshop.description}</p>
        <button className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">
          Register
        </button>
      </div>
    </motion.article>
  );
}

export default WorkshopCard;
