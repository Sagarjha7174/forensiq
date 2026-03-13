import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/authStorage';
import AnimatedButton from './ui/AnimatedButton';
import AnimatedCard from './ui/AnimatedCard';

function CourseCard({ course }) {
  const title = course.title || course.name;
  const destination = isAuthenticated() ? '/dashboard#courses' : '/login';
  const instructor = course.instructor_name || course.instructor || 'ForensIQ Faculty';
  const image =
    course.image ||
    course.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

  return (
    <AnimatedCard className="group flex h-full flex-col overflow-hidden rounded-xl">
      <img
        src={image}
        alt={title}
        className="h-44 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          <span>Course</span>
          <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
            <Clock3 size={12} />
            Self paced
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">Instructor: {instructor}</p>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {course.description || 'Structured lessons, practical modules, and mentor support for focused learning.'}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {Number(course.price || 0) > 0 ? `INR ${Number(course.price || 0)}` : 'Free access'}
          </p>
          <Link to={destination}>
            <AnimatedButton variant="primary" className="px-4" icon={ArrowUpRight}>
              Enroll
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}

export default CourseCard;
