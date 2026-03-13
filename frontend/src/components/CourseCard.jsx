import { motion } from 'framer-motion';

function CourseCard({ course }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="glass-card overflow-hidden rounded-2xl shadow-glow"
    >
      <img src={course.image} alt={course.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-primary">{course.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{course.description}</p>
        <button className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
          Read More
        </button>
      </div>
    </motion.article>
  );
}

export default CourseCard;
