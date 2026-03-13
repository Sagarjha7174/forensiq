import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import TeamSlider from '../components/TeamSlider';
import ScrollReveal from '../components/ui/ScrollReveal';

function TeamPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Helmet>
        <title>ForensIQ | Our Team</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-10 rounded-[28px] p-8 md:p-10"
      >
        <SectionHeader
          title="Meet Our Team"
          subtitle="A sharper team presentation with stronger visual hierarchy, card motion, and clearer professional identity."
        />
      </motion.div>
      <ScrollReveal>
        <TeamSlider />
      </ScrollReveal>
    </section>
  );
}

export default TeamPage;
