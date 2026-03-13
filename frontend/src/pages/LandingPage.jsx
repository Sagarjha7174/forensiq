import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Microscope, Users, School } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import CourseCard from '../components/CourseCard';
import OfferCard from '../components/OfferCard';
import WorkshopCard from '../components/WorkshopCard';
import useFetch from '../hooks/useFetch';
import { courseService, workshopService } from '../services/api';

const offers = [
  {
    icon: BookOpen,
    title: 'Expert Led Courses',
    description: 'Learn from experienced mentors with proven CUET success strategies.'
  },
  {
    icon: Microscope,
    title: 'Workshops & Seminars',
    description: 'Hands-on practical sessions for forensic and cyber investigation skills.'
  },
  {
    icon: School,
    title: 'Expert Sessions for Schools',
    description: 'Structured awareness and exam guidance sessions for institutions.'
  },
  {
    icon: Users,
    title: 'Project Collaborations',
    description: 'Collaborate on real-world mini projects to build your profile and confidence.'
  }
];

function LandingPage() {
  const coursesState = useFetch(courseService.getCourses);
  const workshopsState = useFetch(workshopService.getWorkshops);

  return (
    <>
      <Helmet>
        <title>ForensIQ | Explore Forensics & Cyber Security</title>
      </Helmet>

      <section className="relative mt-8 overflow-hidden rounded-3xl bg-primary px-6 py-16 text-white md:px-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1600&q=80"
            alt="Forensic lab"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl"
        >
          <h1 className="font-heading text-4xl leading-tight md:text-6xl">
            Explore the Worlds of Forensics, Cyber Security, Psychology & Criminology
          </h1>
          <p className="mt-4 text-lg text-slate-100">Empowering Minds, Unveiling Truths</p>
        </motion.div>
      </section>

      <section className="mt-16">
        <SectionHeader
          title="Courses"
          subtitle="Premium CUET-focused programs crafted for conceptual depth and exam precision."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coursesState.loading && [1, 2, 3].map((i) => <div key={i} className="skeleton h-72" />)}
          {!coursesState.loading &&
            coursesState.data.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          title="What We Offer"
          subtitle="A complete ecosystem for curious minds stepping into investigative sciences."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard key={offer.title} {...offer} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          title="Upcoming Workshops"
          subtitle="Interactive events and practical experiences that make learning unforgettable."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workshopsState.loading && [1, 2, 3].map((i) => <div key={i} className="skeleton h-72" />)}
          {!workshopsState.loading &&
            workshopsState.data.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}
        </div>
      </section>
    </>
  );
}

export default LandingPage;
