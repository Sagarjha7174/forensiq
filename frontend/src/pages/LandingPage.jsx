import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Microscope, School, Users } from 'lucide-react';
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
    title: 'Expert-Led Programs',
    description: 'Structured courses designed by experienced professionals and educators.'
  },
  {
    icon: Microscope,
    title: 'Workshops & Seminars',
    description: 'Practical sessions focused on real-world forensic and cyber case methods.'
  },
  {
    icon: School,
    title: 'Institution Programs',
    description: 'Academic partnerships and awareness programs for schools and institutions.'
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    description: 'Mentored projects and peer learning to strengthen investigation skills.'
  }
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

      <section className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              ForensIQ Learning Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
              className="mt-6 font-heading text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl"
            >
              Explore Forensics, Cyber Security, Psychology & Criminology
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg"
            >
              Professional programs, expert-led workshops, and structured learning pathways for aspiring investigators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link to="/#courses">
                <AnimatedButton variant="primary" icon={ArrowRight} className="px-6 py-3 text-base">
                  Start Learning
                </AnimatedButton>
              </Link>
              <Link to="/#workshops">
                <AnimatedButton
                  variant="ghost"
                  className="border-slate-300 px-6 py-3 text-base text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Explore Workshops
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
            className="relative flex justify-start lg:justify-end"
          >
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">Program Snapshot</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Build investigative depth</h2>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-indigo-600 dark:border-slate-700 dark:bg-slate-700 dark:text-indigo-300">
                  <BookOpen size={22} />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  'Structured learning pathways with milestone tracking',
                  'Case-based workshops with domain mentors',
                  'Courses aligned to modern institutional standards'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-teal-500" />
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-20">
        <section id="courses" className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              title="Courses"
              subtitle="Browse professional programs in a clean horizontal catalog designed for focused discovery."
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => courseSwiper?.slidePrev()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Previous courses"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => courseSwiper?.slideNext()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
              speed={550}
              autoplay={{
                delay: 3200,
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

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-20" delay={0.06}>
        <section id="offerings">
          <SectionHeader
            title="What We Offer"
            subtitle="A focused set of offerings built for students, educators, and institutions."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {offers.map((offer) => (
              <OfferCard key={offer.title} {...offer} />
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-20" delay={0.1}>
        <section id="workshops">
          <SectionHeader
            title="Upcoming Workshops"
            subtitle="Join scheduled sessions led by subject experts and practitioners."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {workshopsState.loading && [1, 2, 3].map((index) => <LoadingSkeleton key={index} rows={4} className="h-80" />)}
            {!workshopsState.loading &&
              workshops.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mx-auto max-w-7xl px-6 py-20" delay={0.12}>
        <section id="team">
          <div className="mb-8 flex items-center justify-between gap-6">
            <SectionHeader
              title="Team"
              subtitle="Meet the educators and mentors guiding the ForensIQ learning experience."
            />
          </div>
          <TeamSlider />
        </section>
      </ScrollReveal>
    </>
  );
}

export default LandingPage;
