import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { Comic } from '../types';

interface ComicCardProps {
  comic: Comic;
}

export default function ComicCard({ comic }: ComicCardProps) {
  return (
    <Link to={`/library`} className="group flex flex-col gap-3">
      <div className="aspect-[3/4] bg-brand-charcoal border border-white/5 group-hover:border-brand-gold transition-all p-1.5 duration-500 shadow-xl overflow-hidden relative rounded-2xl">
        <div className="w-full h-full bg-[#2a2a2a] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 relative rounded-xl">
          <img
            src={comic.coverImage}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-brand-gold/90 text-brand-dark flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-lg">
            <Play fill="currentColor" size={20} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold truncate tracking-tight text-brand-cream/80 group-hover:text-brand-gold transition-colors font-display uppercase italic">
          {comic.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-brand-gold font-bold uppercase tracking-widest">{comic.episodeCount} БҮЛЭГ</span>
          <span className="w-1 h-1 bg-brand-cream/20 rounded-full"></span>
          <span className="text-[9px] text-brand-cream/40 uppercase tracking-widest font-medium">
            {comic.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
