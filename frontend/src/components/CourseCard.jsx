import { ArrowUpRight } from 'lucide-react';
import AnimatedButton from './ui/AnimatedButton';
import AnimatedCard from './ui/AnimatedCard';

function CourseCard({ course }) {
  const title = course.title || course.name;

  return (
    <AnimatedCard className="group overflow-hidden">
      <img
        src={course.image || course.thumbnail}
        alt={title}
        className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
        <AnimatedButton variant="accent" className="mt-4" icon={ArrowUpRight}>
          Read More
        </AnimatedButton>
      </div>
    </AnimatedCard>
  );
}

export default CourseCard;
