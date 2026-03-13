import { Helmet } from 'react-helmet-async';
import SectionHeader from '../components/SectionHeader';
import TeamSlider from '../components/TeamSlider';
import ScrollReveal from '../components/ui/ScrollReveal';

function TeamPage() {
  return (
    <section className="mt-12">
      <Helmet>
        <title>ForensIQ | Our Team</title>
      </Helmet>
      <SectionHeader
        title="Meet Our Team"
        subtitle="A passionate network of educators and practitioners shaping future professionals."
      />
      <ScrollReveal>
        <TeamSlider />
      </ScrollReveal>
    </section>
  );
}

export default TeamPage;
