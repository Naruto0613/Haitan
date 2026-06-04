import React from 'react';
import { Search, Filter, History } from 'lucide-react';
import { useComics } from '../contexts/ComicsContext';
import ComicCard from '../components/ComicCard';
import { motion } from 'motion/react';

export default function Library() {
  const { comics, loading } = useComics();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Бүгд');

  const categories = ['Бүгд', 'Түүхэн Тулаант', 'Эпик Фэнтези', 'Түүхэн Драм', 'Нууц'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-cream/60 font-serif italic mt-4 uppercase text-xs tracking-widest">Ачаалж байна...</p>
      </div>
    );
  }

  const filteredComics = comics.filter(comic => {
    const matchesSearch = comic.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Бүгд' || comic.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 min-h-screen">
      <div className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <History size={24} className="text-brand-gold" />
              <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase italic">Их Номын Сан</h1>
            </div>
            <p className="text-brand-cream/60 font-serif italic max-w-xl">
              "Мянган жилийн цуурай цаг хугацаанд нам гүм байсан ч одоо бэхийн дуслаар дахин төрж байна. Эзэнт гүрний цуглуулсан шастируудыг сонирхоно уу."
            </p>
          </div>
          
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 group-focus-within:text-brand-gold transition-colors" size={20} />
            <input
              type="text"
              placeholder="Шастираас хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-charcoal/50 border border-brand-gold/10 focus:border-brand-gold outline-none py-4 pl-12 pr-6 text-brand-cream font-medium placeholder:text-brand-cream/20 transition-all focus:ring-1 focus:ring-brand-gold/20 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-brand-gold/10 pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border rounded-full ${
                activeCategory === cat
                  ? 'bg-brand-gold border-brand-gold text-brand-dark'
                  : 'bg-brand-charcoal border-white/5 text-brand-cream/40 hover:border-brand-gold/50 hover:text-brand-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredComics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredComics.map((comic, idx) => (
            <motion.div
              key={comic.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ComicCard comic={comic} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-brand-gold/10 rounded-2xl">
          <BookOff size={48} className="text-brand-gold/20 mb-6" />
          <p className="text-brand-cream/40 font-serif italic text-lg text-center">
            Таны хайсан шастир олдсонгүй. Цуурай салхинд хийсэн оджээ.
          </p>
        </div>
      )}
    </div>
  );
}

function BookOff({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="14" y2="10" />
      <line x1="18" y1="18" x2="6" y2="6" />
    </svg>
  );
}
