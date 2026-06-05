import { motion } from 'motion/react';
import { ChevronRight, Play, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComics } from '../contexts/ComicsContext';
import ComicCard from '../components/ComicCard';

export default function Home() {
  const { comics, loading } = useComics();

  if (loading || comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-cream/60 font-serif italic mt-4 uppercase text-xs tracking-widest">Ачаалж байна...</p>
      </div>
    );
  }

  const featured = comics[0];

  return (
    <div className="flex flex-col gap-10 sm:gap-16 pb-20 p-4 sm:p-8">
      {/* Hero Banner Area */}
      <section className="relative min-h-[420px] sm:min-h-0 sm:h-[450px] w-full bg-brand-charcoal rounded-2xl overflow-hidden border border-brand-gold/20 group flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent z-10" />
        <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-[2000ms]">
          <img
            src="/assets/images/haitan_hero_1779099801289.png"
            alt="Haitan Hero"
            className="w-full h-full object-cover grayscale brightness-75"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-20 flex flex-col justify-center py-12 px-5 sm:px-12 md:px-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-gold text-[9px] sm:text-[10px] font-bold tracking-[0.5em] mb-4 block uppercase leading-none">Онцлох Тууль</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-black tracking-tighter leading-[0.95] mb-5 uppercase italic text-brand-cream">
              Бэх ба Цус:<br/>
              <span className="text-brand-gold">Төмөр Хаган</span>
            </h2>
            <p className="max-w-md text-xs sm:text-sm text-brand-cream/70 font-serif leading-relaxed mb-6 italic border-l border-brand-gold/20 pl-4">
              "{featured.tagline}"
            </p>
            <div className="flex flex-col xs:flex-row gap-3">
              <Link
                to={`/reader/${featured.id}/c1`}
                className="px-6 py-3 sm:px-8 bg-brand-gold text-brand-dark text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-brand-amber transition-colors rounded-xl text-center flex-1 xs:flex-none"
              >
                Одоо унших
              </Link>
              <button className="px-6 py-3 sm:px-8 border border-brand-gold/40 text-brand-gold text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-gold/10 transition-colors rounded-xl text-center flex-1 xs:flex-none">
                Архивт нэмэх
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section>
        <div className="flex justify-between items-end mb-8 border-b border-brand-gold/10 pb-4">
          <div>
            <h3 className="text-lg font-display font-bold tracking-[0.2em] uppercase text-brand-gold">Шинээр нэмэгдсэн</h3>
            <p className="text-[10px] text-brand-cream/40 uppercase tracking-widest mt-1">Тал нутгийн цуурай</p>
          </div>
          <Link to="/library" className="text-[10px] text-brand-cream/40 hover:text-brand-gold uppercase tracking-widest transition-colors font-bold">
            Бүх шастирыг үзэх →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 xl:grid-cols-4">
          {comics.map((comic, idx) => (
            <motion.div
              key={comic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <ComicCard comic={comic} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="mt-8 bg-brand-charcoal/30 border border-brand-gold/5 p-12 relative overflow-hidden rounded-2xl">
        <div className="soyombo-pattern absolute inset-0 opacity-5 pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <h2 className="text-2xl font-display font-bold text-brand-gold mb-6 uppercase tracking-widest">Үл бичигдсэн түүхийг хадгалах нь</h2>
          <p className="text-brand-cream/60 font-serif italic text-base leading-relaxed mb-8 border-l border-brand-gold/20 pl-6">
            Haitan нь нэгэн алсын хараанаас төрсөн: нүүдэлчдийн эзэнт гүрний биет бус өвийг кино урлагийн визуал хэл рүү хөрвүүлэх. Түүх бол зөвхөн амьд байх биш, мэдрэх явдал гэж бид итгэдэг.
          </p>
          <Link
            to="/about"
            className="text-[10px] font-bold text-brand-gold hover:text-brand-amber uppercase tracking-[0.3em] transition-colors border-b border-brand-gold/20 pb-1"
          >
            Бидний түүх →
          </Link>
        </div>
      </section>
    </div>
  );
}
