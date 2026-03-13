import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Microscope, Orbit, School, Sparkles, Users } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import SectionHeader from '../components/SectionHeader';
import CourseCard from '../components/CourseCard';
import OfferCard from '../components/OfferCard';
import TeamSlider from '../components/TeamSlider';
import WorkshopCard from '../components/WorkshopCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ScrollReveal from '../components/ui/ScrollReveal';
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

const particles = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  top: `${8 + ((index * 11) % 72)}%`,
  left: `${4 + ((index * 17) % 88)}%`,
  duration: 7 + (index % 5),
  delay: index * 0.18
}));

const heroStats = [
  { label: 'Tracks', getValue: (courses, workshops) => `${courses.length || 12}+` },
  { label: 'Workshops', getValue: (courses, workshops) => `${workshops.length || 8}+` },
  { label: 'Mentors', getValue: () => '10+' }
];

const heroPoints = [
  'Structured courses with guided outcomes',
  'Hands-on workshops and expert sessions',
  'Cleaner learning dashboard'
];

function LandingPage() {
  const location = useLocation();
  const [courseSwiper, setCourseSwiper] = useState(null);
  const coursesState = useFetch(courseService.getCourses);
  const workshopsState = useFetch(workshopService.getWorkshops);
  const courses = useMemo(() => coursesState.data || [], [coursesState.data]);
  const workshops = useMemo(() => workshopsState.data || [], [workshopsState.data]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = location.hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  return (
    <>
      <Helmet>
        <title>ForensIQ | Explore Forensics & Cyber Security</title>
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:36px_36px] dark:bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)]" />
          <div className="absolute left-[6%] top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(199,210,254,0.5),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_70%)]" />
          <div className="absolute right-[8%] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(221,214,254,0.46),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(139,92,246,0.2),transparent_70%)]" />
          <div className="absolute bottom-4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.42),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_70%)]" />
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute h-1.5 w-1.5 rounded-full bg-slate-400/40 dark:bg-white/25"
              style={{ top: particle.top, left: particle.left }}
              animate={{ y: [0, -12, 0], opacity: [0.16, 0.5, 0.16] }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-18 lg:grid-cols-2 lg:gap-12 lg:py-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-indigo-400"
            >
              <Sparkles size={14} />
              Premium Learning Hub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: 'easeOut' }}
              className="mt-6 font-heading text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl lg:text-[3.5rem]"
            >
              Explore the Worlds of <span className="text-indigo-600 dark:text-indigo-400">Forensics</span>,{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Cyber Security</span>, Psychology & Criminology
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
              className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg"
            >
              Modern, guided learning for ambitious students with expert-led programs, practical workshops, and a cleaner experience across every device.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link to="/#courses">
                <AnimatedButton variant="accent" icon={ArrowRight} className="px-6 py-3 text-base shadow-lg">
                  Start Learning
                </AnimatedButton>
              </Link>
              <Link to="/#workshops">
                <AnimatedButton
                  variant="ghost"
                  className="border-slate-300 bg-white/60 px-6 py-3 text-base text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Explore Workshops
                </AnimatedButton>
              </Link>
            </motion.div>

            <div className="mt-7 flex flex-wrap gap-3">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.24 + index * 0.08, ease: 'easeOut' }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md"
                >
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.getValue(courses, workshops)}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: 'easeOut' }}
            className="relative flex justify-start lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">Feature Card</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Build investigative depth</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-cyan-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-cyan-400">
                  <Orbit size={22} />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {heroPoints.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-cyan-400" />
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24">
        <section id="courses" className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              title="Courses"
              subtitle="Horizontal discovery, stronger visual hierarchy, and a cleaner catalog for fast browsing."
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => courseSwiper?.slidePrev()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                aria-label="Previous courses"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => courseSwiper?.slideNext()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                aria-label="Next courses"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {coursesState.loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <LoadingSkeleton key={index} rows={4} className="h-80" />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              onSwiper={setCourseSwiper}
              loop={courses.length > 3}
              speed={700}
              autoplay={{
                delay: 2800,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              spaceBetween={24}
              slidesPerView={1.08}
              breakpoints={{
                640: { slidesPerView: 1.4 },
                900: { slidesPerView: 2.1 },
                1280: { slidesPerView: 3 }
              }}
            >
              {courses.map((course) => (
                <SwiperSlide key={course.id} className="h-auto pb-2">
                  <CourseCard course={course} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24" delay={0.06}>
        <section id="offerings">
          <SectionHeader
            title="What We Offer"
            subtitle="A consistent, premium card system for programs, workshops, school sessions, and collaborative tracks."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {offers.map((offer) => (
              <OfferCard key={offer.title} {...offer} />
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24" delay={0.1}>
        <section id="workshops">
          <SectionHeader
            title="Upcoming Workshops"
            subtitle="Interactive sessions and small-group events presented with the same product-grade visual system."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {workshopsState.loading && [1, 2, 3].map((index) => <LoadingSkeleton key={index} rows={4} className="h-80" />)}
            {!workshopsState.loading &&
              workshops.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24" delay={0.12}>
        <section id="team">
          <div className="mb-8 flex items-center justify-between gap-6">
            <SectionHeader
              title="Team"
              subtitle="A horizontally sliding team showcase with stronger identity, social actions, and more room for personality."
            />
          </div>
          <TeamSlider />
        </section>
      </ScrollReveal>
    </>
  );
}

export default LandingPage;
