import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="font-heading text-2xl text-slate-900 dark:text-white">ForensIQ</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Empowering CUET aspirants in Forensics, Cyber Security, Psychology and Criminology.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300">
              Home
            </Link>
            <Link to="/team" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300">
              Team
            </Link>
            <Link to="/notifications" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300">
              Notifications
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">Contact</h4>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">support@forensiq.in</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">+91 00000 00000</p>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Copyright {new Date().getFullYear()} ForensIQ. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
