import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, Search, Book, Info, Home, LogOut, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  
  const location = useLocation();
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      setAuthError(error?.message || "Нэвтрэх явцад алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  const isAdmin = user && ['naranbadrakh1013@gmail.com', 'haitan.admin@gmail.com'].includes(user.email || '');

  const navItems = [
    { name: 'Нүүр', path: '/', icon: Home },
    { name: 'Номын сан', path: '/library', icon: Book },
    { name: 'Тухай', path: '/about', icon: Info },
    ...(isAdmin ? [{ name: 'Админ өргөө', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-md border-b border-brand-gold/10">
      <div className="top-banner-gradient" />
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 border border-brand-gold rounded-lg rotate-45 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <span className="text-brand-gold font-display font-bold text-sm -rotate-45 group-hover:-rotate-90 transition-transform duration-500">H</span>
          </div>
          <span className="text-2xl font-display font-black tracking-[0.2em] text-brand-gold ml-1 italic font-sans">HAITAN</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-link text-[10px] sm:text-xs",
                location.pathname === item.path ? "nav-link-active" : "text-brand-cream/60"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center gap-6 border-l border-brand-gold/10 pl-10">
            <button className="text-[10px] font-bold tracking-widest text-brand-gold/60 hover:text-brand-gold transition-colors">
              ХАЙЛТ
            </button>
            
            {loading ? (
              <div className="w-8 h-8 rounded-full border border-brand-gold/20 animate-pulse bg-brand-gold/5" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 hover:opacity-85 transition-all focus:outline-none"
                >
                  <span className="text-[10px] sm:text-xs font-bold text-brand-gold uppercase tracking-widest hidden lg:inline max-w-[120px] truncate">
                    {user.displayName || 'Хэрэглэгч'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      className="w-8 h-8 rounded-full border border-brand-gold/30 hover:border-brand-gold object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-xs font-bold font-mono">
                      {(user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-brand-gold/30 shadow-2xl shadow-black/80 rounded-xl overflow-hidden py-2 z-50 text-left"
                  >
                    <div className="px-5 py-3 border-b border-brand-gold/10 flex flex-col">
                      <span className="text-xs font-bold text-white truncate">{user.displayName || 'Хэрэглэгч'}</span>
                      <span className="text-[9px] text-brand-cream/50 truncate mt-0.5">{user.email || ''}</span>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-5 py-3 text-xs text-brand-gold hover:text-brand-amber hover:bg-brand-gold/5 flex items-center gap-2 transition-all font-bold tracking-wider border-b border-brand-gold/10"
                      >
                        <Shield size={12} />
                        АДМИН ӨРГӨӨ
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-xs text-brand-gold/80 hover:text-brand-gold hover:bg-brand-gold/10 flex items-center gap-2 transition-all font-bold tracking-wider"
                    >
                      <LogOut size={12} />
                      ГАРАХ (Sign Out)
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-bold tracking-[0.2em] text-[#1a1a1a] bg-brand-gold border border-brand-gold hover:bg-brand-amber hover:border-brand-amber px-4 py-2 rounded-xl transition-all uppercase shadow-lg shadow-brand-gold/10"
              >
                Нэвтрэх
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-stone-400 hover:text-brand-gold transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-brand-dark border-b border-brand-gold/20 px-6 py-6"
        >
          <div className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 text-base uppercase tracking-widest",
                  location.pathname === item.path ? "text-brand-gold" : "text-stone-400"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-brand-gold/10 pt-6 mt-4">
              {loading ? (
                <div className="w-full h-10 rounded-xl bg-brand-gold/5 animate-pulse" />
              ) : user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Profile'}
                        className="w-10 h-10 rounded-full border border-brand-gold/30 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-sm font-bold font-mono">
                        {(user.displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{user.displayName || 'Хэрэглэгч'}</span>
                      <span className="text-[10px] text-brand-cream/50">{user.email || ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-center py-3 border border-brand-gold/30 text-brand-gold rounded-xl hover:bg-brand-gold/10 text-xs font-bold tracking-widest transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    Гарах
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-center py-3 bg-brand-gold text-brand-dark rounded-xl hover:bg-brand-amber text-xs font-bold tracking-widest transition-all uppercase"
                >
                  Нэвтрэх (Sign In)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-[#1a1a1a] border border-brand-gold/30 rounded-2xl p-8 md:p-10 shadow-2xl shadow-black overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-brand-cream/40 hover:text-brand-gold transition-colors p-2 z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header / Logo */}
            <div className="text-center mb-8 relative">
              <div className="w-12 h-12 border border-brand-gold/30 rounded-xl rotate-45 flex items-center justify-center mx-auto mb-6">
                <span className="text-brand-gold font-display font-bold text-lg -rotate-45">H</span>
              </div>
              <h2 className="text-2xl font-display font-black tracking-[0.2em] text-brand-gold mb-2 italic font-sans animate-pulse">HAITAN</h2>
              <p className="text-xs uppercase tracking-widest text-brand-cream/40">Хайтан Архив • Нэвтрэх</p>
            </div>

            {/* Text description */}
            <p className="text-xs text-brand-cream/60 text-center leading-relaxed mb-8 max-w-xs mx-auto">
              Та нэвтэрснээр өөрийн хадгалсан болон уншиж буй түүхэн шастируудаа төхөөрөмж хооронд синхрончлох боломжтой болно.
            </p>

            {/* Error display */}
            {authError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-xl font-medium">
                {authError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-4 px-6 bg-white hover:bg-neutral-100 text-neutral-800 font-bold font-sans text-sm rounded-xl border border-neutral-300 transition-all shadow-md transform active:scale-[0.98] cursor-pointer"
              >
                <GoogleIcon />
                Google-ийн эрхээр орох
              </button>
            </div>

            {/* Decorative Footnote */}
            <div className="mt-8 text-[9px] uppercase tracking-widest text-brand-cream/20 text-center">
              Мөнх Тэнгэрийн Доор • © {new Date().getFullYear()}
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
}
