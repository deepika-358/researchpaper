import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  History,
  LayoutDashboard,
  Menu,
  Mic2,
  PlusCircle,
  Radio,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenUpload,
  onOpenSearch,
  onOpenHistory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'library', label: 'Research Library', icon: BookOpen },
    { id: 'podcasts', label: 'Podcasts', icon: Headphones },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Radio className="h-5 w-5 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400 ring-2 ring-white">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                PaperCast
              </span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] font-medium tracking-wide text-slate-500">
              Research. Simplified. Spoken.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center space-x-1 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                activeView === link.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Actions (Search, History, Create CTA) */}
        <div className="hidden items-center space-x-2.5 sm:flex">
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Search papers and podcasts"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Search</span>
            <kbd className="rounded bg-white px-1 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs">
              /
            </kbd>
          </button>

          <button
            onClick={onOpenHistory}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Activity History"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Primary Create Podcast CTA */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-98"
          >
            <Mic2 className="h-4 w-4" />
            <span>Create Podcast</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={onOpenSearch}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-5 lg:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-semibold ${
                  activeView === link.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="h-5 w-5 text-indigo-500" />}
                <span>{link.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              <History className="h-5 w-5 text-indigo-500" />
              <span>Activity History</span>
            </button>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUpload();
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your Podcast</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
