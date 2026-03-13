import { Helmet } from 'react-helmet-async';
import SectionHeader from '../components/SectionHeader';
import TeamSlider from '../components/TeamSlider';

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
      <TeamSlider />
    </section>
  );
}

export default TeamPage;
