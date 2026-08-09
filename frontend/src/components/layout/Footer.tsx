import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gold-royal bg-slate-950/90 py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient font-bold text-slate-950 shadow-lg shadow-amber-650/20">
                LS
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">
                Local<span className="text-amber-400">Skill</span>
              </span>
            </Link>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Connecting home owners and businesses with verified, top-rated local specialists in Pokhara. Real-time scheduling, zero-commission booking.
            </p>
            <div className="flex items-center gap-2.5 text-[9px] bg-slate-900/60 border border-slate-900 px-3 py-1.5 rounded-full w-fit">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold text-slate-400">Pokhara Community Powered</span>
            </div>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Blog Postings</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Contact Press</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="hover:text-amber-400 transition-colors">Browse Map</Link></li>
              <li><Link to="/search" className="hover:text-amber-400 transition-colors">Expert Categories</Link></li>
              <li><Link to="/search" className="hover:text-amber-400 transition-colors">Featured Specialists</Link></li>
              <li><Link to="/auth?mode=register" className="hover:text-amber-400 transition-colors">Become a Partner</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Help Desk</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Frequently Asked FAQs</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Privacy Shield</Link></li>
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-550">
          <p>© {new Date().getFullYear()} LocalSkill Inc. All rights reserved. Zero-Commission Marketplace.</p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
