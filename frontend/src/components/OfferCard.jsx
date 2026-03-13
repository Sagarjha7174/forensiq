import { motion } from 'framer-motion';

function OfferCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="glass-card rounded-2xl p-5 shadow-glow"
    >
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </motion.div>
  );
}

export default OfferCard;
