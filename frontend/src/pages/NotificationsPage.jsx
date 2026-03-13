import { Helmet } from 'react-helmet-async';
import SectionHeader from '../components/SectionHeader';
import useFetch from '../hooks/useFetch';
import { notificationService } from '../services/api';

function NotificationsPage() {
  const { data, loading } = useFetch(notificationService.getNotifications);

  return (
    <section className="mt-12">
      <Helmet>
        <title>ForensIQ | Notifications</title>
      </Helmet>
      <SectionHeader
        title="Notifications"
        subtitle="Stay updated with latest announcements, events, and admission alerts."
      />
      <div className="space-y-4">
        {loading && [1, 2].map((i) => <div key={i} className="skeleton h-24" />)}
        {!loading && data.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-slate-600">No notifications available</div>
        )}
        {!loading &&
          data.map((item) => (
            <article key={item.id} className="glass-card rounded-2xl p-5 shadow-glow">
              <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
            </article>
          ))}
      </div>
    </section>
  );
}

export default NotificationsPage;
