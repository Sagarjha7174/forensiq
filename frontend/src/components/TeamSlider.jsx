import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const team = [
  {
    name: 'Anwesha Das',
    role: 'Co Founder',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Ritvik Sharma',
    role: 'Cyber Security Mentor',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Neha Kulkarni',
    role: 'Forensic Science Faculty',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80'
  }
];

function TeamSlider() {
  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={1.2}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }}
    >
      {team.map((member) => (
        <SwiperSlide key={member.name}>
          <article className="glass-card rounded-2xl p-4 shadow-glow">
            <img
              src={member.image}
              alt={member.name}
              className="h-56 w-full rounded-xl object-cover"
            />
            <h3 className="mt-4 text-lg font-semibold text-primary">{member.name}</h3>
            <p className="text-sm text-slate-600">{member.role}</p>
          </article>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default TeamSlider;
