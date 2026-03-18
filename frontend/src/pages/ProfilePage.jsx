import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { UserRound } from 'lucide-react';
import { authService } from '../services/api';
import { getStoredUser, setAuthSession } from '../services/authStorage';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';
import FloatingInput from '../components/ui/FloatingInput';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

function ProfilePage() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await authService.profile();
        setProfile({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone: response.data.phone || '',
          email: response.data.email || ''
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone
      });
      const updated = response.data.user;
      setAuthSession(localStorage.getItem('token'), { ...user, ...updated });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    }
  };

  const handleSendTestMail = async () => {
    try {
      setSendingTestMail(true);
      const response = await authService.sendTestMail();
      toast.success(response.data?.message || 'Test email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send test email');
    } finally {
      setSendingTestMail(false);
    }
  };

  return (
    <section className="mt-10 space-y-6">
      <Helmet>
        <title>ForensIQ | Profile</title>
      </Helmet>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-slate-800 dark:text-slate-100">
            <UserRound size={20} />
          </div>
          <h1 className="font-heading text-3xl text-primary dark:text-slate-100">My Profile</h1>
        </div>
        <AnimatedButton
          type="button"
          variant="ghost"
          loading={sendingTestMail}
          onClick={handleSendTestMail}
        >
          Test Mail
        </AnimatedButton>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} className="max-w-2xl" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <AnimatedCard className="p-5" hover={false}>
            <h2 className="text-lg font-semibold text-primary">Profile Details</h2>
            <form className="mt-4 space-y-4" onSubmit={handleProfileUpdate}>
              <FloatingInput
                name="first_name"
                label="First Name"
                value={profile.first_name}
                onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                required
              />
              <FloatingInput
                name="last_name"
                label="Last Name"
                value={profile.last_name}
                onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                required
              />
              <FloatingInput
                name="phone"
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
              <FloatingInput
                name="email"
                label="Email"
                value={profile.email}
                onChange={() => {}}
                className="pointer-events-none opacity-80"
              />
              <AnimatedButton type="submit" variant="accent">
                Save Changes
              </AnimatedButton>
            </form>
          </AnimatedCard>

          <AnimatedCard className="p-5" hover={false}>
            <h2 className="text-lg font-semibold text-primary">Security</h2>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordUpdate}>
              <FloatingInput
                type="password"
                name="currentPassword"
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <FloatingInput
                type="password"
                name="newPassword"
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <AnimatedButton type="submit">Update Password</AnimatedButton>
            </form>
          </AnimatedCard>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
