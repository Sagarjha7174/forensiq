import { Helmet } from 'react-helmet-async';
import SectionHeader from '../components/SectionHeader';
import AnimatedCard from '../components/ui/AnimatedCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
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
        {loading && [1, 2].map((i) => <LoadingSkeleton key={i} rows={3} className="h-24" />)}
        {!loading && data.length === 0 && (
          <AnimatedCard className="p-6 text-slate-600 dark:text-slate-300" hover={false}>No notifications available</AnimatedCard>
        )}
        {!loading &&
          data.map((item) => (
            <AnimatedCard key={item.id} className="p-5" hover={false}>
              <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
            </AnimatedCard>
          ))}
      </div>
    </section>
  );
}

export default NotificationsPage;
