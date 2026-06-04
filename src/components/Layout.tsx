import React from 'react';
import Navigation from './Navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, Link } from 'react-router-dom';
import { History, Bookmark, Sparkles, Compass } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/reader');

  if (isReader) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark overflow-x-hidden">
      <Navigation />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-brand-gold/10 p-8 flex-col gap-10 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-brand-gold/60 mb-6 font-bold">Оноолт Түүх</h3>
            <ul className="space-y-4 text-xs uppercase tracking-widest font-medium">
              <li className="flex items-center gap-3 text-brand-gold">
                <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                <span className="cursor-pointer">Хүннү Гүрэн</span>
              </li>
              <li className="flex items-center gap-3 text-brand-cream/40 hover:text-brand-cream transition-colors">
                <span className="w-1 h-1 bg-brand-cream/20 rounded-full"></span>
                <span className="cursor-pointer">Их Монгол Улс</span>
              </li>
              <li className="flex items-center gap-3 text-brand-cream/40 hover:text-brand-cream transition-colors">
                <span className="w-1 h-1 bg-brand-cream/20 rounded-full"></span>
                <span className="cursor-pointer">Гүрэн Хаант Улс</span>
              </li>
              <li className="flex items-center gap-3 text-brand-cream/40 hover:text-brand-cream transition-colors">
                <span className="w-1 h-1 bg-brand-cream/20 rounded-full"></span>
                <span className="cursor-pointer">Ляо Гүрэн</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-brand-gold/60 mb-6 font-bold">Архив</h3>
            <div className="flex flex-col gap-4">
              <Link to="/library" className="flex items-center gap-3 text-brand-cream/60 hover:text-brand-gold transition-colors">
                <Compass size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Нээх</span>
              </Link>
              <div className="flex items-center gap-3 text-brand-cream/60 hover:text-brand-gold transition-colors cursor-pointer">
                <Bookmark size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Хадгалсан</span>
              </div>
            </div>
          </section>

          <section className="mt-auto">
            <div className="bg-brand-gold/5 p-5 border border-brand-gold/20 rounded-xl">
              <div className="flex items-center gap-2 text-brand-gold mb-2">
                <Sparkles size={14} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest italic">Үргэлжлүүлэн унших</h4>
              </div>
              <p className="text-xs font-bold text-white mb-1">Алтан Орд</p>
              <p className="text-[9px] text-brand-cream/50 uppercase tracking-tighter mb-4">БҮЛЭГ 01 • 3 ХУУДАС ҮЛДСЭН</p>
              <Link
                to="/reader/1/c1"
                className="block w-full bg-brand-gold text-brand-dark text-[10px] font-black py-2.5 rounded-lg shadow-lg text-center uppercase tracking-widest hover:bg-brand-amber transition-colors"
              >
                Тал руу буцах
              </Link>
            </div>
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          <footer className="px-8 py-6 border-t border-brand-gold/10 flex flex-col md:flex-row items-center justify-between text-[10px] text-brand-cream/40 uppercase tracking-widest mt-auto">
            <div>© 1206-2024 HAITAN АРХИВ</div>
            <div className="flex gap-8 my-4 md:my-0">
              <span className="hover:text-brand-gold cursor-pointer transition-colors">Үйлчилгээний нөхцөл</span>
              <span className="hover:text-brand-gold cursor-pointer transition-colors">Нууцлал</span>
              <span className="hover:text-brand-gold cursor-pointer transition-colors">Холбоо барих</span>
              <Link to="/admin" className="hover:text-brand-gold cursor-pointer transition-colors border-l border-brand-gold/20 pl-8">Админ хэсэг</Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
              <span>Сервер: Хархорум-Үндсэн</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
