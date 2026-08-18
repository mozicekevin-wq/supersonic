import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Phone, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/services/categories';
import type { Category } from '@/types/types';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/file_00000000971482438d70a20248281418.png';
const WHATSAPP = '+242069999999';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { setMobileOpen(false); }, [location]);

  // Close categories dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Produits', path: '/products' },
    { label: 'Promotions', path: '/promotions' },
    { label: 'Actualités', path: '/publications' },
    { label: 'Nos Magasins', path: '/stores' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* ── Main bar: Logo | Search | Nav ── */}
      <div className="flex items-center gap-4 px-3 md:px-6 py-2">

        {/* Logo — white pill background like brand reference */}
        <Link to="/" className="flex-shrink-0">
          <div className="bg-white rounded-2xl px-3 py-1.5 shadow-md flex items-center"
            style={{ minWidth: 120, maxWidth: 160 }}>
            <img src={LOGO_URL} alt="Société Supersonic"
              className="h-8 md:h-10 w-auto object-contain" />
          </div>
        </Link>

        {/* Search bar — constrained width, not edge-to-edge */}
        <form onSubmit={handleSearch} className="flex min-w-0 w-full max-w-xs md:max-w-sm lg:max-w-md">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 min-w-0 px-4 py-2 rounded-l-xl bg-white text-gray-800 placeholder:text-gray-400 outline-none text-sm border-0 focus:ring-2 focus:ring-accent/50"
          />
          <button type="submit"
            className="px-4 py-2 bg-accent rounded-r-xl text-white flex items-center justify-center hover:bg-accent/90 transition-colors shrink-0">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 shrink-0">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
                ${location.pathname === link.path
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin"
              className="ml-1 px-3 py-2 rounded-lg text-sm font-semibold text-accent hover:bg-white/10 transition-colors whitespace-nowrap">
              Admin
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(o => !o)}
          className="md:hidden ml-1 shrink-0 text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Categories sub-bar (desktop) ── */}
      <div className="hidden md:flex items-center gap-4 px-6 py-1.5 border-t border-white/10 text-xs text-white/70"
        style={{ background: 'rgba(0,0,0,0.15)' }}>
        {/* Categories dropdown */}
        <div ref={catRef} className="relative">
          <button onClick={() => setCatOpen(o => !o)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors font-medium text-xs">
            <span className="text-base leading-none">≡</span> Toutes les catégories
            <ChevronDown className={`w-3 h-3 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100">
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`}
                  onClick={() => setCatOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Quick contact */}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
          className="ml-auto flex items-center gap-1 hover:text-white transition-colors">
          <Phone className="w-3 h-3" /> WhatsApp: {WHATSAPP}
        </a>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10" style={{ background: 'hsl(var(--sidebar-background))' }}>
          <nav className="px-3 py-3 flex flex-col gap-0.5">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${location.pathname === link.path
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="px-4 py-3 rounded-xl text-sm font-semibold text-accent hover:bg-white/10 transition-colors">
                Administration
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
