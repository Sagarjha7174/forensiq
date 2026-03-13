import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-600/15" />
      <div className="pointer-events-none absolute right-[-120px] top-[42rem] h-80 w-80 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-700/15" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-indigo-100/25 blur-3xl dark:bg-indigo-900/20" />
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
