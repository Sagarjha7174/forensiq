import { useState } from 'react';
import { ArrowLeft, ArrowRight, Github, Linkedin } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import AnimatedCard from './ui/AnimatedCard';

const team = [
  {
    name: 'Anwesha Das',
    role: 'Co Founder',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/'
  },
  {
    name: 'Ritvik Sharma',
    role: 'Cyber Security Mentor',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/'
  },
  {
    name: 'Neha Kulkarni',
    role: 'Forensic Science Faculty',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/'
  }
];

function TeamSlider() {
  const [swiper, setSwiper] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => swiper?.slidePrev()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
          aria-label="Previous team member"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => swiper?.slideNext()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
          aria-label="Next team member"
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <Swiper
        modules={[Autoplay]}
        onSwiper={setSwiper}
        loop={team.length > 3}
        speed={750}
        autoplay={{
          delay: 2600,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        spaceBetween={20}
        slidesPerView={1.05}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {team.map((member) => (
          <SwiperSlide key={member.name} className="pb-2">
            <AnimatedCard className="h-full p-6 text-center">
              <img
                src={member.image}
                alt={member.name}
                className="mx-auto h-24 w-24 rounded-full border border-white/60 object-cover shadow-lg shadow-slate-900/10"
              />
              <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/75 text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                  aria-label={`${member.name} GitHub`}
                >
                  <Github size={16} />
                </a>
              </div>
            </AnimatedCard>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default TeamSlider;
