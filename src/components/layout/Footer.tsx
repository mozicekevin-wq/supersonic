import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Clock } from 'lucide-react';
import WhatsAppLogo from '@/components/common/WhatsAppLogo';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/file_00000000971482438d70a20248281418.png';

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Triple-click on logo → navigate to admin login
  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate('/admin/login');
      return;
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 600);
  };

  return (
    <footer style={{ background: 'hsl(var(--sidebar-background))' }} className="text-white/80">
      {/* CTA strip */}
      <div className="bg-accent py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Prêt à commander ?</h3>
            <p className="text-white/80 text-sm">Contactez-nous sur WhatsApp ou visitez nos magasins</p>
          </div>
          <div className="flex gap-3">
            <a href="https://wa.me/242069999999" target="_blank" rel="noreferrer"
              className="neu-btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              <WhatsAppLogo className="w-5 h-5" /> WhatsApp
            </a>
            <Link to="/products" className="px-5 py-2.5 rounded-xl border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              Voir les produits
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-1">
          <button onClick={handleLogoClick} className="block mb-1 focus:outline-none select-none" title="Société Supersonic">
            <img src={LOGO_URL} alt="Société Supersonic" className="h-10 w-auto" />
          </button>
          <p className="text-[10px] text-white/20 mb-3 select-none">© Société Supersonic</p>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Votre partenaire de confiance pour l'électronique, l'électroménager et l'informatique au Congo.
          </p>
          <div className="flex gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['Accueil', '/'],
              ['Nos Produits', '/products'],
              ['Promotions', '/promotions'],
              ['Actualités', '/publications'],
              ['Nos Magasins', '/stores'],
              ['Nous Contacter', '/contact'],
            ].map(([label, path]) => (
              <li key={path}>
                <Link to={path} className="text-white/60 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Catégories</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['Électronique', 'electronique'],
              ['Électroménager', 'electromenager'],
              ['Informatique', 'informatique'],
              ['Mobilier', 'mobilier'],
              ['Bureautique', 'bureautique'],
            ].map(([label, slug]) => (
              <li key={slug}>
                <Link to={`/products?category=${slug}`} className="text-white/60 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-white/70">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
              <span>Pointe-Noire &amp; Brazzaville, Congo</span>
            </li>
            <li className="flex items-center gap-2 text-white/70">
              <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
              <span>+242 06 xxx xx xx</span>
            </li>
            <li className="flex items-center gap-2 text-white/70">
              <Mail className="w-4 h-4 flex-shrink-0 text-accent" />
              <span>contact@supersonic-congo.com</span>
            </li>
            <li className="flex items-start gap-2 text-white/70">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
              <span>Lun-Sam: 8h-19h | Dim: 9h-14h</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {year} Société Supersonic. Tous droits réservés.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Politique de confidentialité</Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">Conditions d'utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
