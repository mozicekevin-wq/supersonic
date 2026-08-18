import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Page introuvable</h1>
        <p className="text-muted-foreground mb-8 text-pretty">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="neu-btn-primary flex items-center justify-center gap-2 px-6 py-3">
            <Home className="w-4 h-4" /> Accueil
          </Link>
          <button onClick={() => window.history.back()}
            className="neu-btn flex items-center justify-center gap-2 px-6 py-3">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>
      </div>
    </div>
  );
}
