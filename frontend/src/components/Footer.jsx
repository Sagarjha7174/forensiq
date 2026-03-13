import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-primary text-slate-100 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-20 right-10 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/20" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="font-heading text-2xl">ForensIQ</h3>
          <p className="mt-3 text-sm text-slate-300">
            Empowering CUET aspirants in Forensics, Cyber Security, Psychology and Criminology.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/" className="text-slate-300 hover:text-white">
              Home
            </Link>
            <Link to="/team" className="text-slate-300 hover:text-white">
              Team
            </Link>
            <Link to="/notifications" className="text-slate-300 hover:text-white">
              Notifications
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <p className="mt-3 text-sm text-slate-300 dark:text-slate-400">support@forensiq.in</p>
          <p className="text-sm text-slate-300">+91 00000 00000</p>
        </div>
      </div>
      <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-400">
        Copyright {new Date().getFullYear()} ForensIQ. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
