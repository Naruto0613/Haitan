import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, List, ZoomIn, ZoomOut, Maximize2, Share2, Send, Trash2, MessageSquare } from 'lucide-react';
import { useComics } from '../contexts/ComicsContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Chapter } from '../types';

export default function Reader() {
  const { comicId, chapterId } = useParams();
  const navigate = useNavigate();
  const { comics, loading } = useComics();
  const { user, loginWithGoogle } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin animate-duration-1000"></div>
        <p className="text-brand-cream/60 font-serif italic mt-4 uppercase text-xs tracking-widest">Ачаалж байна...</p>
      </div>
    );
  }

  const comic = comics.find(c => c.id === comicId);
  const chapter = comic?.chapters?.find(ch => ch.id === chapterId);
  const currentChapterIdx = comic?.chapters?.findIndex(ch => ch.id === chapterId) ?? -1;

  if (!comic || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-stone-500 bg-brand-dark">
        <h1 className="text-2xl font-display mb-4">Шастир эсвэл бүлэг олдсонгүй</h1>
        <Link to="/library" className="text-brand-gold uppercase tracking-widest hover:underline">Номын сан руу буцах</Link>
      </div>
    );
  }

  // Comments hook
  React.useEffect(() => {
    const q = query(collection(db, 'comments'), where('comicId', '==', comic.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setComments(list);
    });
    return unsubscribe;
  }, [comic.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addDoc(collection(db, 'comments'), {
        comicId: comic.id,
        comicTitle: comic.title,
        userId: user.uid,
        userName: user.displayName || 'Хэрэглэгч',
        userPhoto: user.photoURL || '',
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrev = () => {
    if (currentChapterIdx > 0) {
      const prev = comic.chapters[currentChapterIdx - 1];
      navigate(`/reader/${comic.id}/${prev.id}`);
    }
  };

  const handleNext = () => {
    if (currentChapterIdx < comic.chapters.length - 1) {
      const next = comic.chapters[currentChapterIdx + 1];
      navigate(`/reader/${comic.id}/${next.id}`);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen relative flex flex-col">
      {/* Top Bar Reader Panel */}
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-gold/20 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/library" className="p-2 text-brand-cream/40 hover:text-brand-gold">
            <ChevronLeft size={24} />
          </Link>
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold block font-bold leading-none mb-1 italic">
              {comic.title}
            </span>
            <span className="text-sm font-display font-medium text-white tracking-widest truncate max-w-[200px] block font-sans uppercase">
              БҮЛЭГ.{chapter.number}: {chapter.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center bg-brand-charcoal rounded-xl p-1 border border-brand-gold/10">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 text-brand-cream/40 hover:text-brand-gold group">
              <ZoomOut size={18} />
            </button>
            <span className="text-[10px] font-mono w-10 text-center text-brand-cream/40">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-2 text-brand-cream/40 hover:text-brand-gold group">
              <ZoomIn size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-dark rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-amber transition-colors"
          >
            <List size={16} />
            <span className="hidden md:inline">Бүлгүүд</span>
          </button>
        </div>
      </div>

      <div className="flex-grow flex justify-center bg-brand-dark py-8 px-4">
        <div 
          className="flex flex-col items-center gap-0 w-full"
          style={{ maxWidth: `${zoom}%`, width: '100%', minWidth: '320px' }}
        >
          {chapter.pages.map((page, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-full relative group"
            >
              <img
                src={page}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto shadow-2xl border-x border-brand-gold/5"
                referrerPolicy="no-referrer"
              />
              {/* Optional: Add decorative corner ornaments in corners of pages? */}
              <div className="absolute top-4 left-4 text-brand-gold/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                ᠪᠣᠭᠳᠠ
              </div>
            </motion.div>
          ))}
          
          {/* Chapter navigation at bottom */}
          <div className="w-full max-w-2xl py-20 flex flex-col items-center border-t border-brand-gold/10 mt-12 bg-gradient-to-b from-brand-dark to-brand-charcoal p-12 rounded-2xl">
            <p className="text-brand-gold font-display text-lg tracking-[0.3em] font-medium mb-12 uppercase italic">Бүлэг дууслаа</p>
            
            <div className="grid grid-cols-2 w-full gap-8">
              <button
                disabled={currentChapterIdx === 0}
                onClick={handlePrev}
                className="flex flex-col items-center gap-4 py-8 border border-brand-gold/10 hover:border-brand-gold/50 group transition-all disabled:opacity-30 disabled:pointer-events-none rounded-2xl"
              >
                <ChevronLeft size={32} className="text-brand-gold group-hover:-translate-x-2 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest text-brand-cream/40">Өмнөх БҮЛЭГ</span>
              </button>

              <button
                disabled={currentChapterIdx === (comic.chapters?.length ?? 0) - 1}
                onClick={handleNext}
                className="flex flex-col items-center gap-4 py-8 border border-brand-gold/10 hover:border-brand-gold/50 group transition-all disabled:opacity-30 disabled:pointer-events-none rounded-2xl"
              >
                <ChevronRight size={32} className="text-brand-gold group-hover:translate-x-2 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest text-brand-cream/40">Дараах БҮЛЭГ</span>
              </button>
            </div>

            <Link
              to="/library"
              className="mt-12 text-brand-cream/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-[0.4em] font-bold"
            >
              Номын сан руу буцах
            </Link>
          </div>

          {/* Comments Section */}
          <div className="w-full max-w-2xl py-10 px-8 bg-brand-charcoal border border-brand-gold/10 rounded-2xl mt-12 text-left">
            <div className="flex items-center gap-3 border-b border-brand-gold/10 pb-4 mb-6">
              <MessageSquare className="text-brand-gold" size={20} />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest">Хэлэлцүүлэг ({comments.length})</h3>
            </div>

            {/* List of comments */}
            <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs uppercase font-sans text-stone-500 text-center py-6 italic">Энэ шастирт сэтгэгдэл бичигдээгүй байна.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="border border-brand-gold/5 bg-brand-dark/40 p-4 rounded-xl flex justify-between gap-4">
                    <div className="flex gap-4">
                      {c.userPhoto ? (
                        <img src={c.userPhoto} alt={c.userName} className="w-8 h-8 rounded-full border border-brand-gold/10 shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-stone-850 border border-white/5 flex items-center justify-center font-bold text-stone-500 text-xs shrink-0">{c.userName?.charAt(0)}</div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-brand-cream">{c.userName}</span>
                          <span className="text-[9px] text-stone-500 font-sans">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-stone-300 font-serif text-xs italic">"{c.text}"</p>
                      </div>
                    </div>

                    {user && (user.uid === c.userId || user.email === 'naranbadrakh1013@gmail.com' || user.email === 'haitan.admin@gmail.com') && (
                      <button onClick={() => handleDeleteComment(c.id)} className="text-stone-600 hover:text-red-500 transition-colors self-start">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Post comment form */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-4 items-end">
                <div className="flex-grow">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-brand-gold/70 block mb-1">Сэтгэгдэл үлдээх</label>
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Таны сэтгэгдэл..."
                    className="w-full bg-brand-dark/50 border border-brand-gold/10 focus:border-brand-gold text-xs p-3 outline-none text-white rounded-xl placeholder:text-stone-700 font-sans"
                  />
                </div>
                <button type="submit" className="bg-brand-gold text-brand-dark p-3 rounded-xl hover:bg-brand-amber transition-colors shrink-0">
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="bg-brand-dark/30 border border-brand-gold/10 p-4 rounded-xl text-center">
                <p className="text-stone-400 text-xs font-serif italic mb-4">Сэтгэгдэл бичихийн тулд нэвтрэх шаардлагатай.</p>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="bg-brand-gold hover:bg-brand-amber text-brand-dark font-sans font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all"
                >
                  Google Хаягаар Нэвтрэх
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-brand-charcoal z-[60] border-l border-brand-gold/20 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] p-0 flex flex-col"
            >
              <div className="p-8 border-b border-brand-gold/10 flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white tracking-widest uppercase italic">Бүлгүүд</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-brand-cream/40 hover:text-brand-gold">
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto px-4 py-8">
                <div className="flex flex-col gap-4">
                  {(comic.chapters || []).map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        navigate(`/reader/${comic.id}/${ch.id}`);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-6 p-6 border transition-all text-left group ${
                        ch.id === chapter.id 
                        ? 'border-brand-gold bg-brand-gold/5' 
                        : 'border-white/5 hover:border-brand-gold/40'
                      }`}
                    >
                      <span className={`text-4xl font-display font-black transition-colors ${
                        ch.id === chapter.id ? 'text-brand-gold' : 'text-stone-800 group-hover:text-stone-700'
                      }`}>
                        {ch.number.toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className={`font-bold transition-colors mb-1 ${
                          ch.id === chapter.id ? 'text-brand-gold' : 'text-stone-300'
                        }`}>
                          {ch.title}
                        </h4>
                        <span className="text-[10px] uppercase tracking-widest text-stone-500">{ch.releaseDate}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
