import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";

// Top-level error boundary — catches any crash before React mounts
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || String(error) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: '#e31e24' }}>Erreur de chargement</h2>
          <p style={{ color: '#555', marginTop: 8 }}>Veuillez actualiser la page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', background: '#1a2e6e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
            Actualiser
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <RootErrorBoundary>
      <AppWrapper>
        <App />
      </AppWrapper>
    </RootErrorBoundary>
  );
}
