type WhatsAppLogoProps = {
  className?: string;
  label?: string;
};

export default function WhatsAppLogo({ className = 'w-5 h-5', label = 'WhatsApp' }: WhatsAppLogoProps) {
  return <img src="/supersonic/whatsapp.svg" alt={label} aria-hidden={!label} className={`object-contain ${className}`} />;
}
