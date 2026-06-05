import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Users, 
  Trash2, 
  Plus, 
  CheckCircle, 
  X, 
  Search, 
  Star, 
  LogOut, 
  Image as ImageIcon,
  ChevronRight,
  ShieldAlert,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Comic, Chapter } from '../types';

// Admin emails allowed
const ADMIN_EMAILS = ['naranbadrakh1013@gmail.com', 'haitan.admin@gmail.com'];

export default function Admin() {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'comics' | 'feedback' | 'users' | 'comments'>('comics');

  // Firebase Live states
  const [comicsList, setComicsList] = useState<Comic[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters states
  const [userSearchText, setUserSearchText] = useState('');

  // Form states - Comic Manager
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [comicTitle, setComicTitle] = useState('');
  const [comicAuthor, setComicAuthor] = useState('');
  const [comicTagline, setComicTagline] = useState('');
  const [comicDescription, setComicDescription] = useState('');
  const [comicCoverURL, setComicCoverURL] = useState('');
  const [comicCategory, setComicCategory] = useState('Түүхэн Тулаант');
  const [comicStatus, setComicStatus] = useState<'Үргэлжилж буй' | 'Дууссан'>('Үргэлжилж буй');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form states - Chapter Manager
  const [selectedComicId, setSelectedComicId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterPagesText, setChapterPagesText] = useState('');
  const [isUploadingPages, setIsUploadingPages] = useState(false);

  // UI state for alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdminUser = user && ADMIN_EMAILS.includes(user.email || '');

  // Auto redirect if logged in but not admin
  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email || '')) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Read collections in real-time
  useEffect(() => {
    if (!isAdminUser) return;

    // Load Comics
    const unsubscribeComics = onSnapshot(
      collection(db, 'comics'), 
      (snapshot) => {
        const list: Comic[] = [];
        snapshot.forEach(d => {
          const data = d.data() as Comic;
          if (data && data.id && !data.id.startsWith('_')) {
            list.push({ ...data } as Comic);
          }
        });
        list.sort((a, b) => a.id.localeCompare(b.id));
        setComicsList(list);
        setLoading(false);
      },
      (error) => {
        console.error("onSnapshot comics error:", error);
        handleFirestoreError(error, OperationType.LIST, 'comics');
        setLoading(false);
      }
    );

    // Load Feedbacks
    const unsubscribeFeedbacks = onSnapshot(
      query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(d => {
          list.push({ id: d.id, ...d.data() });
        });
        setFeedbacksList(list);
      },
      (error) => {
        console.error("onSnapshot feedbacks error:", error);
        handleFirestoreError(error, OperationType.LIST, 'feedbacks');
      }
    );

    // Load Users
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'), 
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(d => {
          list.push({ id: d.id, ...d.data() });
        });
        setUsersList(list);
      },
      (error) => {
        console.error("onSnapshot users error:", error);
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    // Load Comments
    const unsubscribeComments = onSnapshot(
      collection(db, 'comments'), 
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(d => {
          list.push({ id: d.id, ...d.data() });
        });
        setCommentsList(list);
      },
      (error) => {
        console.error("onSnapshot comments error:", error);
        handleFirestoreError(error, OperationType.LIST, 'comments');
      }
    );

    return () => {
      unsubscribeComics();
      unsubscribeFeedbacks();
      unsubscribeUsers();
      unsubscribeComments();
    };
  }, [isAdminUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAdminLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Comics operations
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const storageRef = ref(storage, `covers/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setComicCoverURL(url);
      showToast("Нүүр зураг амжилттай байршлаа!");
    } catch (err) {
      console.error("Cover upload error:", err);
      showToast("Зураг байршуулахад алдаа гарлаа.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveComic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comicTitle || !comicCoverURL) {
      showToast("Комикийн нэр болон нүүр зургийг заавал оруулна уу.");
      return;
    }

    const id = editingComic ? editingComic.id : Math.random().toString(36).substr(2, 9);
    const docData: Comic = {
      id,
      title: comicTitle,
      author: comicAuthor || 'Haitan Team',
      tagline: comicTagline || 'Шастирын шинэ бүлэг',
      description: comicDescription || '',
      coverImage: comicCoverURL,
      category: comicCategory,
      status: comicStatus,
      episodeCount: editingComic ? editingComic.episodeCount : 0,
      chapters: editingComic ? (editingComic.chapters || []) : []
    };

    try {
      await setDoc(doc(db, 'comics', id), docData);
      showToast(editingComic ? "Шастир амжилттай засагдлаа!" : "Шинэ шастир амжилттай нэмэгдлээ!");
      
      // Reset form
      setEditingComic(null);
      setComicTitle('');
      setComicAuthor('');
      setComicTagline('');
      setComicDescription('');
      setComicCoverURL('');
      setComicCategory('Түүхэн Тулаант');
      setComicStatus('Үргэлжилж буй');
    } catch (err) {
      console.error("Save comic failed:", err);
      showToast("Хадгалахад алдаа гарлаа.");
    }
  };

  const handleEditComic = (comic: Comic) => {
    setEditingComic(comic);
    setComicTitle(comic.title);
    setComicAuthor(comic.author);
    setComicTagline(comic.tagline);
    setComicDescription(comic.description);
    setComicCoverURL(comic.coverImage);
    setComicCategory(comic.category);
    setComicStatus(comic.status as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteComic = async (id: string) => {
    if (!confirm("Энэ шастирыг устгах уу? Бүх бүлгүүд хамт устах болно!")) return;
    try {
      await deleteDoc(doc(db, 'comics', id));
      showToast("Шастир амжилттай устлаа.");
    } catch (err: any) {
      console.error("Delete comic failed:", err);
      showToast(`Устгахад алдаа гарлаа: ${err?.message || err}`);
    }
  };

  // Add Chapter to Comic
  const handlePagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPages(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `pages/${Date.now()}__${i}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        urls.push(url);
      }
      const existingText = chapterPagesText.trim();
      const delimiter = existingText ? '\n' : '';
      setChapterPagesText(existingText + delimiter + urls.join('\n'));
      showToast(`${files.length} хуудасны зураг амжилттай байршлаа!`);
    } catch (err) {
      console.error("Pages upload error:", err);
      showToast("Хуудас байршуулахад алдаа гарлаа.");
    } finally {
      setIsUploadingPages(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComicId) {
      showToast("Аль комикт орохыг сонгоно уу.");
      return;
    }
    if (!chapterTitle || !chapterPagesText) {
      showToast("Бүлгийн нэр болон зургуудаа заавал оруулна уу.");
      return;
    }

    const comicObj = comicsList.find(c => c.id === selectedComicId);
    if (!comicObj) return;

    const lines = chapterPagesText.split('\n').map(l => l.trim()).filter(l => l.startsWith('http') || l.startsWith('/src'));
    if (lines.length === 0) {
      showToast("Хуудсуудын зургийн URL хаяг зөв биш байна.");
      return;
    }

    const newChapter: Chapter = {
      id: `c_${Date.now()}`,
      number: chapterNumber,
      title: chapterTitle,
      releaseDate: new Date().toISOString().split('T')[0],
      pages: lines
    };

    const updatedChapters = [...(comicObj.chapters || [])];
    // Check if the chapter number already exists, replace it, otherwise append and sort
    const existingIdx = updatedChapters.findIndex(ch => ch.number === chapterNumber);
    if (existingIdx !== -1) {
      updatedChapters[existingIdx] = newChapter;
    } else {
      updatedChapters.push(newChapter);
    }
    updatedChapters.sort((a,b) => a.number - b.number);

    try {
      await updateDoc(doc(db, 'comics', selectedComicId), {
        chapters: updatedChapters,
        episodeCount: updatedChapters.length
      });
      showToast(`${comicObj.title} комикт шинэ бүлэг нэмэгдлээ!`);
      setChapterTitle('');
      setChapterNumber(updatedChapters.length + 1);
      setChapterPagesText('');
    } catch (err) {
      console.error("Add chapter failed:", err);
      showToast("Бүлэг нэмэхэд алдаа гарлаа.");
    }
  };

  // 2. Feedbacks operations
  const handleToggleFeedbackRead = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'feedbacks', id), {
        isRead: !currentStatus
      });
      showToast(!currentStatus ? "Санал хүсэлтийг уншсан гэж тэмдэглэлээ." : "Санал хүсэлтийг шинэ уншаагүй гэж тэмдэглэлээ.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Санал хүсэлтийг устгах уу?")) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      showToast("Санал хүсэлт устлаа.");
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Comments operations
  const handleDeleteComment = async (id: string) => {
    if (!confirm("Сэтгэгдлийг устгах уу?")) return;
    try {
      await deleteDoc(doc(db, 'comments', id));
      showToast("Сэтгэгдэл устаж дууслаа.");
    } catch (err) {
      console.error(err);
    }
  };

  // Count unread feedbacks
  const unreadFeedbackCount = feedbacksList.filter(f => !f.isRead).length;

  // Render Gatekeeper screen if non-admin or guest
  if (!user || !isAdminUser) {
    return (
      <div className="bg-brand-dark min-h-[90vh] py-24 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Artistic details */}
        <div className="soyombo-pattern absolute inset-0 opacity-5 pointer-events-none" />
        <div className="w-[400px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full absolute -top-10 -left-10" />
        <div className="w-[300px] h-[300px] bg-brand-gold/5 blur-[100px] rounded-full absolute -bottom-10 -right-10" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-charcoal border-2 border-brand-gold/20 p-12 rounded-3xl text-center max-w-md w-full relative z-10 shadow-2xl shadow-black/80"
        >
          {/* Soyombo Emblem Icon Decal */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border border-brand-gold/40 rounded-full flex items-center justify-center bg-brand-gold/5">
              <span className="text-brand-gold font-display font-black text-2xl tracking-tighter">ᠪᠣᠭᠳᠠ</span>
            </div>
          </div>

          <h2 className="text-3xl font-display font-medium text-white uppercase tracking-widest mb-3">Хоршооны Алтан Хаалга</h2>
          <p className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-sans font-bold mb-8">
            Haitan Sagas Admin Gate
          </p>
          
          <div className="border border-brand-gold/10 p-6 rounded-xl bg-brand-dark/40 mb-8">
            <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
              "Энэхүү хэсэгт зөвхөн эрх бүхий түүхэн шүүмжлэгчид болон админ удирдлагууд нэвтрэх боломжтойг анхаарна уу."
            </p>
          </div>

          {!user ? (
            <button 
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-center gap-3 bg-brand-gold text-brand-dark font-sans font-bold py-4 px-6 uppercase tracking-[0.15em] text-xs hover:bg-brand-amber transition-colors rounded-xl shadow-lg hover:shadow-brand-gold/20"
            >
              <Users size={16} />
              Google Хаягаар Нэвтрэх
            </button>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-xl text-left text-xs">
                <ShieldAlert className="shrink-0" size={20} />
                <span>Харамсалтай нь, таны нэвтэрсэн хаяг ({user.email}) нь удирдах эрхтэй админ биш байна. Түр хүлээнэ үү эсвэл доорх товчийг дарж гарна уу.</span>
              </div>
              <button
                onClick={() => logout().then(() => navigate('/'))}
                className="w-full flex items-center justify-center gap-2 border border-brand-gold/20 hover:border-brand-gold text-brand-gold text-xs font-bold font-sans py-3 uppercase tracking-widest rounded-xl transition-colors"
              >
                <LogOut size={14} />
                Гарах & Буцах
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Filter Users
  const filteredUsers = usersList.filter(u => {
    const text = userSearchText.toLowerCase();
    return (u.displayName || '').toLowerCase().includes(text) || (u.email || '').toLowerCase().includes(text);
  });

  return (
    <div className="bg-[#0d0d0d] text-brand-cream min-h-screen pb-24 font-serif">
      {/* Top Banner Decal */}
      <div className="top-banner-gradient" />

      {/* Admin Headers */}
      <header className="border-b border-brand-gold/10 bg-[#111111] px-4 sm:px-8 py-4 sm:py-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl text-brand-gold font-display font-black leading-none">ᠪᠣᠭᠳᠠ</span>
            <div className="border-l border-brand-gold/20 pl-4">
              <h1 className="text-xl sm:text-2xl font-display font-medium text-white uppercase tracking-widest">Удирдах Их Өргөө</h1>
              <p className="text-brand-gold text-[9px] uppercase tracking-[0.3em] font-sans font-bold">Хааны архив ба Хяналтын зөвлөл</p>
            </div>
          </div>

          {/* Admin Profiler in Header */}
          <div className="flex items-center gap-4 bg-[#1a1a1a]/80 border border-brand-gold/10 p-2 pl-4 pr-6 rounded-2xl shadow-xl w-full md:w-auto">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Admin'} 
                className="w-10 h-10 rounded-full border border-brand-gold"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-brand-gold bg-brand-gold/10 flex items-center justify-center text-brand-gold font-sans font-bold">
                {user.displayName?.charAt(0) || 'A'}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-sans font-bold text-white leading-none mb-1">{user.displayName || 'Администратор'}</p>
              <span className="text-[10px] font-sans text-brand-cream/50">{user.email}</span>
            </div>
            
            <button 
              onClick={() => logout().then(() => navigate('/'))}
              title="Гарах"
              className="ml-4 p-2 text-stone-500 hover:text-red-500 rounded-lg hover:bg-stone-800/40 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Primary body grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col lg:flex-row gap-6 sm:gap-12">
        
        {/* Sidebar Panel styled with #111111 */}
        <aside className="lg:w-80 shrink-0 bg-[#111111] border border-brand-gold/15 rounded-2xl p-6 relative h-fit shadow-xl shadow-black/60">
          <div className="mb-6 pb-4 border-b border-brand-gold/10 text-left">
            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-sans font-bold">Хуудасны цэс</span>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('comics')}
              className={`flex items-center justify-between w-full p-4 font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-xl ${
                activeTab === 'comics'
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10'
                  : 'text-stone-400 hover:bg-[#1a1a1a] hover:text-brand-gold'
              }`}
            >
              <span className="flex items-center gap-3">
                <BookOpen size={16} />
                📚 Шастир хариуцагч
              </span>
              <ChevronRight size={14} className={activeTab === 'comics' ? 'opacity-100' : 'opacity-30'} />
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center justify-between w-full p-4 font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-xl ${
                activeTab === 'feedback'
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10'
                  : 'text-stone-400 hover:bg-[#1a1a1a] hover:text-brand-gold'
              }`}
            >
              <span className="flex items-center gap-3 relative">
                <Mail size={16} />
                📬 Санал Хүсэлт
                {unreadFeedbackCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </span>
              <div className="flex items-center gap-2">
                {unreadFeedbackCount > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'feedback' ? 'bg-brand-dark text-brand-gold' : 'bg-brand-gold text-brand-dark'
                  }`}>
                    {unreadFeedbackCount} шинэ
                  </span>
                )}
                <ChevronRight size={14} className={activeTab === 'feedback' ? 'opacity-100' : 'opacity-30'} />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-between w-full p-4 font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-xl ${
                activeTab === 'users'
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10'
                  : 'text-stone-400 hover:bg-[#1a1a1a] hover:text-brand-gold'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users size={16} />
                👥 Хэрэглэгчдийн Судалгаа
              </span>
              <ChevronRight size={14} className={activeTab === 'users' ? 'opacity-100' : 'opacity-30'} />
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center justify-between w-full p-4 font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-xl ${
                activeTab === 'comments'
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10'
                  : 'text-stone-400 hover:bg-[#1a1a1a] hover:text-brand-gold'
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={16} />
                💬 Сэтгэгдэл Хяналт
              </span>
              <ChevronRight size={14} className={activeTab === 'comments' ? 'opacity-100' : 'opacity-30'} />
            </button>
          </nav>

          <div className="mt-12 p-4 border border-brand-gold/10 bg-brand-gold/5 rounded-xl text-left">
            <span className="text-brand-gold font-display font-bold text-[10px] tracking-wider block uppercase mb-1">Салхины сургаал</span>
            <p className="text-[11px] leading-relaxed text-stone-500">
              Шастирыг арвижуулан, ардын хүсэлтийг сайтар уншиж, түүхийн зөв урсгалыг хадгалж ажиллана уу.
            </p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            
            {/* 1. COMICS MANAGER SECTION */}
            {activeTab === 'comics' && (
              <motion.div
                key="comics"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-12"
              >
                {/* Save Comic Form */}
                <div className="bg-[#111111] border border-brand-gold/15 rounded-2xl p-4 sm:p-8 shadow-xl text-left">
                  <div className="flex gap-3 items-center mb-6 border-b border-brand-gold/10 pb-4">
                    <BookOpen className="text-brand-gold" size={24} />
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">
                      {editingComic ? '📚 ШАСТИР ЗАСВАРЛАХ' : '📚 ШИНЭ ШАСТИР БҮТЭЭХ'}
                    </h2>
                  </div>

                  <form onSubmit={handleSaveComic} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Туульсын Нэр</label>
                        <input 
                          type="text" 
                          required
                          value={comicTitle}
                          onChange={(e) => setComicTitle(e.target.value)}
                          placeholder="Жишээ: Төмөр Хаган"
                          className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Зохиолч</label>
                          <input 
                            type="text" 
                            value={comicAuthor}
                            onChange={(e) => setComicAuthor(e.target.value)}
                            placeholder="Баяр Бат"
                            className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Төрөл урсгал</label>
                          <select 
                            value={comicCategory}
                            onChange={(e) => setComicCategory(e.target.value)}
                            className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-stone-300 rounded-xl font-sans"
                          >
                            <option value="Түүхэн Тулаант">Түүхэн Тулаант</option>
                            <option value="Эпик Фэнтези">Эпик Фэнтези</option>
                            <option value="Түүхэн Драм">Түүхэн Драм</option>
                            <option value="Нууц">Нууц</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Таглайн (Brief catchword)</label>
                        <input 
                          type="text" 
                          value={comicTagline}
                          onChange={(e) => setComicTagline(e.target.value)}
                          placeholder="Жишээ: Мянган морины төвөргөөн дор тал нутаг чичирхийлсэн цаг."
                          className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Мөнхөлсөн Түүхэн Тайлбар</label>
                        <textarea 
                          rows={4}
                          value={comicDescription}
                          onChange={(e) => setComicDescription(e.target.value)}
                          placeholder="Нийтлэг түүхэн товчлол..."
                          className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-serif"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Эрх зүйн төлөв</label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setComicStatus('Үргэлжилж буй')}
                              className={`flex-1 py-3 text-xs font-sans font-bold uppercase rounded-xl transition-colors border ${
                                comicStatus === 'Үргэлжилж буй' 
                                  ? 'bg-brand-gold/15 border-brand-gold text-brand-gold' 
                                  : 'bg-[#1c1c1c] border-brand-gold/10 text-stone-500 hover:text-stone-300'
                              }`}
                            >
                              Үргэлжилж буй
                            </button>
                            <button
                              type="button"
                              onClick={() => setComicStatus('Дууссан')}
                              className={`flex-1 py-3 text-xs font-sans font-bold uppercase rounded-xl transition-colors border ${
                                comicStatus === 'Дууссан' 
                                  ? 'bg-brand-gold/15 border-brand-gold text-brand-gold' 
                                  : 'bg-[#1c1c1c] border-brand-gold/10 text-stone-500 hover:text-stone-300'
                              }`}
                            >
                              Дууссан
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Нүүр зураг (Cover art) байршуулах</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex flex-col items-center justify-center h-28 bg-[#1c1c1c] border-2 border-dashed border-brand-gold/20 hover:border-brand-gold transition-colors rounded-xl cursor-pointer">
                              {isUploadingCover ? (
                                <Loader2 className="text-brand-gold animate-spin" size={24} />
                              ) : (
                                <>
                                  <ImageIcon className="text-stone-500 mb-2" size={24} />
                                  <span className="text-[10px] font-sans text-stone-400 font-bold uppercase">Зураг сонгох</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                              />
                            </label>
                            
                            <div className="bg-[#1c1c1c] border border-brand-gold/10 rounded-xl p-3 flex flex-col justify-between">
                              <span className="text-[8px] uppercase font-bold text-stone-500 block mb-1">Эсвэл холбоос URL суулгах:</span>
                              <input 
                                type="text"
                                value={comicCoverURL}
                                onChange={(e) => setComicCoverURL(e.target.value)}
                                placeholder="https://unsplash.com/..."
                                className="w-full bg-brand-dark/50 border border-brand-gold/10 text-[11px] p-2 outline-none text-brand-cream rounded-lg font-sans"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cover Preview If Available */}
                      {comicCoverURL && (
                        <div className="flex gap-4 items-center bg-brand-dark/50 border border-brand-gold/10 p-3 rounded-xl mt-2">
                          <img 
                            src={comicCoverURL} 
                            alt="Cover Preview" 
                            className="w-12 h-16 object-cover border border-brand-gold/20 rounded-lg shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left text-[11px] font-sans text-stone-400 truncate">
                            <p className="font-bold text-brand-gold">Зургийн холбоос идэвхтэй байна:</p>
                            <span className="truncate block opacity-60">{comicCoverURL}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 mt-4">
                        <button
                          type="submit"
                          className="flex-grow bg-brand-gold hover:bg-brand-amber text-brand-dark font-sans font-bold py-3.5 px-6 uppercase tracking-widest text-xs rounded-xl shadow-lg transition-colors"
                        >
                          {editingComic ? 'Засварыг хадгалах' : 'Шинэ шастир хадгалах'}
                        </button>
                        {editingComic && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingComic(null);
                              setComicTitle('');
                              setComicAuthor('');
                              setComicTagline('');
                              setComicDescription('');
                              setComicCoverURL('');
                              setComicCategory('Түүхэн Тулаант');
                              setComicStatus('Үргэлжилж буй');
                            }}
                            className="px-6 py-3.5 font-sans font-bold text-xs uppercase border border-stone-600 text-stone-400 hover:text-white rounded-xl transition-colors"
                          >
                            Болих
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Add Chapters Form */}
                <div className="bg-[#111111] border border-brand-gold/15 rounded-2xl p-4 sm:p-8 shadow-xl text-left">
                  <div className="flex gap-3 items-center mb-6 border-b border-brand-gold/10 pb-4">
                    <Plus className="text-brand-gold" size={24} />
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">📚 ШИНЭ БҮЛЭГ НЭМЭХ</h2>
                  </div>

                  <form onSubmit={handleAddChapter} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Шастираа Сонгох</label>
                        <select
                          required
                          value={selectedComicId}
                          onChange={(e) => {
                            setSelectedComicId(e.target.value);
                            const selectedComicObj = comicsList.find(c => c.id === e.target.value);
                            if (selectedComicObj) {
                              setChapterNumber((selectedComicObj.chapters?.length || 0) + 1);
                            }
                          }}
                          className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-stone-300 rounded-xl font-sans"
                        >
                          <option value="">-- Шастир ном сонгох --</option>
                          {comicsList.map((comic) => (
                            <option key={comic.id} value={comic.id}>{comic.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Бүлгийн дугаар</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                            className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-sans"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1">Бүлгийн Нэр</label>
                          <input
                            type="text"
                            required
                            placeholder="Жишээ: Төмөр Сүх"
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                            className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-sm text-white rounded-xl font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block">Бараалах хуудасны зургууд</label>
                          <span className="text-[9px] font-mono text-stone-500">Шинэ мөрөөр тусгаарласан URL оруулах буюу байршуулна</span>
                        </div>
                        <textarea
                          rows={6}
                          required
                          value={chapterPagesText}
                          onChange={(e) => setChapterPagesText(e.target.value)}
                          placeholder="Mөр бүрт зургийн холбоос байрлана, Жишээ:&#10;/assets/images/parchment_texture_bg_1779099850609.png&#10;https://images.unsplash.com/promo-art..."
                          className="w-full bg-[#1c1c1c] border border-brand-gold/20 focus:border-brand-gold outline-none p-3 text-xs text-white rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block leading-none">Олон Хуудас устгагчтай ачаалагч</label>
                        
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/15 hover:border-brand-gold/40 h-40 bg-[#1c1c1c] rounded-2xl cursor-pointer text-center group p-6 transition-all">
                          {isUploadingPages ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="text-brand-gold animate-spin mb-2" size={28} />
                              <span className="text-xs font-sans text-brand-gold font-bold uppercase animate-pulse">Зургуудыг ачаалж байна (Storage)...</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={36} className="text-stone-500 group-hover:text-brand-gold transition-colors mb-3" />
                              <span className="text-xs font-sans font-black uppercase text-stone-300 group-hover:text-white transition-colors">Олон зургууд Сонгох</span>
                              <span className="text-[10px] text-stone-500 font-sans mt-1">Хуудасны зургуудыг зэрэг сонгоод байршуулна уу</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handlePagesUpload}
                            disabled={isUploadingPages}
                            className="hidden"
                          />
                        </label>

                        <div className="bg-brand-dark/40 border border-brand-gold/10 p-4 rounded-xl text-xs font-sans text-stone-400 space-y-2">
                          <p className="font-bold text-white uppercase text-[10px] tracking-widest text-brand-gold">Зөвлөмж</p>
                          <p>1. Төрөлх санах ойдоо зургуудаа байршуулаад, хаягийг шууд өргөтгөл дээр харах боломжтой.</p>
                          <p>2. Хэрэв өөрсдийн түүхэн хуудсууд байршсан Unsplash буюу бусад холбоос байгаа бол хажуугийн хэсэгт гараар мөр мөрөөр нь нэмж оруулж болно.</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-gold hover:bg-brand-amber text-brand-dark font-sans font-bold py-3.5 px-6 uppercase tracking-widest text-xs rounded-xl shadow-lg transition-colors mt-6"
                      >
                        ⚔️ Шинэ бүлэг бүртгэх
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comics List with Live Data */}
                <div className="space-y-6">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest text-left border-l-2 border-brand-gold pl-3">
                    📚 БҮХ ШАСТИРЫН ЖАГСААЛТ ({comicsList.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {comicsList.map((comic) => (
                      <div 
                        key={comic.id} 
                        className="bg-[#111111] border-2 border-brand-gold/10 hover:border-brand-gold/30 p-4 sm:p-6 rounded-2xl flex gap-4 sm:gap-6 shadow-xl transition-all relative group"
                      >
                        <img 
                          src={comic.coverImage} 
                          alt={comic.title} 
                          className="w-20 h-28 sm:w-24 sm:h-32 object-cover border border-brand-gold/25 rounded-xl shrink-0 shadow-lg shadow-black/80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow flex flex-col justify-between truncate">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-lg font-display font-bold text-white truncate group-hover:text-brand-gold transition-colors">{comic.title}</h4>
                              <span className="text-[9px] uppercase px-2 py-0.5 font-bold font-sans rounded-full bg-brand-charcoal text-brand-gold border border-brand-gold/20 shrink-0">
                                {comic.category}
                              </span>
                            </div>
                            <p className="text-[10px] font-sans text-stone-500 mb-2">Зохиогч: {comic.author} • Төлөв: {comic.status}</p>
                            <p className="text-xs text-stone-400 font-serif italic line-clamp-2 leading-relaxed mb-2">"{comic.tagline}"</p>
                            <span className="text-[10px] text-brand-gold font-sans font-bold uppercase">{comic.chapters?.length || 0} бүлэг хадгалагдсан</span>
                          </div>

                          <div className="flex gap-3 mt-4 border-t border-brand-gold/5 pt-3">
                            <button
                              onClick={() => handleEditComic(comic)}
                              className="text-[10px] font-sans font-bold uppercase text-brand-gold hover:text-brand-amber transition-colors"
                            >
                              Засах
                            </button>
                            <span className="text-stone-700">|</span>
                            <button
                              onClick={() => handleDeleteComic(comic.id)}
                              className="text-[10px] font-sans font-bold uppercase text-stone-500 hover:text-red-500 transition-colors"
                            >
                              Устгах
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. FEEDBACK INBOX SECTION */}
            {activeTab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center border-b border-brand-gold/15 pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">📬 САНИЛ ХҮСЭЛТИЙН ХАЙРЦАГ ({feedbacksList.length})</h2>
                    <p className="text-[10px] font-sans text-brand-gold uppercase tracking-wider mt-1">Ардын дуу хоолой, санал сэтгэгдэл</p>
                  </div>
                  {unreadFeedbackCount > 0 && (
                    <span className="bg-brand-gold text-brand-dark px-3 py-1 rounded-full font-sans font-bold text-xs">
                      {unreadFeedbackCount} Шинэ
                    </span>
                  )}
                </div>

                {feedbacksList.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-brand-gold/10 rounded-2xl">
                    <Mail className="mx-auto text-brand-gold/20 mb-4 animate-bounce" size={48} />
                    <p className="text-stone-500 font-serif italic text-sm">Санал хүсэлтийн хайрцаг одоогоор хоосон байна.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {feedbacksList.map((fb) => (
                      <div 
                        key={fb.id}
                        className={`border-2 p-6 rounded-2xl shadow-xl transition-all relative ${
                          fb.isRead 
                            ? 'bg-[#111111]/60 border-brand-gold/5 opacity-70' 
                            : 'bg-[#111111] border-brand-gold/25'
                        }`}
                      >
                        {/* New Unread Badge Dot in card corner */}
                        {!fb.isRead && (
                          <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-gold rounded-full" />
                        )}

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            {fb.userPhoto ? (
                              <img 
                                src={fb.userPhoto} 
                                alt={fb.userName} 
                                className="w-12 h-12 rounded-full border border-brand-gold/30 object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full border border-brand-gold/20 bg-[#1c1c1c] flex items-center justify-center font-sans font-bold text-brand-gold">
                                {fb.userName?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <h4 className="text-base font-bold text-white font-sans leading-none mb-1">{fb.userName || 'Зочин хэрэглэгч'}</h4>
                              <p className="text-xs font-sans text-stone-500">{fb.email || 'Имэйл байхгүй'}</p>
                              
                              {/* Submit Date */}
                              <span className="text-[10px] font-sans text-stone-500 block mt-2">
                                Илгээсэн огноо: {fb.createdAt ? (typeof fb.createdAt === 'object' && fb.createdAt?.seconds ? new Date(fb.createdAt.seconds * 1000).toLocaleString('mn-MN') : new Date(fb.createdAt).toLocaleString('mn-MN')) : 'Байхгүй'}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Grid */}
                          <div className="flex items-center gap-1.5 bg-brand-dark/40 border border-brand-gold/10 px-3 py-1.5 rounded-lg w-fit">
                            <span className="text-[10px] font-sans font-bold text-brand-gold uppercase mr-1">Үнэлгээ:</span>
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < fb.rating ? 'fill-brand-gold text-brand-gold' : 'text-[#2a2a2a]'} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* Message Body */}
                        <div className="border-t border-brand-gold/5 pt-4">
                          <p className="text-stone-300 font-serif leading-relaxed italic bg-brand-dark/20 p-4 rounded-xl border border-brand-gold/5 text-sm">
                            "{fb.message}"
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 mt-4 pt-3 border-t border-brand-gold/5 text-xs font-sans font-bold uppercase">
                          <button
                            onClick={() => handleToggleFeedbackRead(fb.id, fb.isRead)}
                            className="text-brand-gold hover:text-brand-amber transition-colors"
                          >
                            {fb.isRead ? 'Марк уншаагүй' : 'Марк уншсан'}
                          </button>
                          <span className="text-stone-700">|</span>
                          <button
                            onClick={() => handleDeleteFeedback(fb.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                          >
                            Устгах
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. USERS LIST SECTION */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-gold/15 pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">👥 БҮРТГЭЛТЭЙ ХЭРЭГЛЭГЧИД ({filteredUsers.length})</h2>
                    <p className="text-[10px] font-sans text-brand-gold uppercase tracking-wider mt-1">Түүхэн клубын гишүүд</p>
                  </div>

                  {/* Search box built in responsive style */}
                  <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-brand-gold transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Нэр эсвэл имэйлээр хайх..."
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      className="w-full bg-[#111111] border border-brand-gold/10 focus:border-brand-gold outline-none py-2.5 pl-10 pr-4 text-xs text-brand-cream placeholder:text-stone-600 transition-all rounded-xl"
                    />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-brand-gold/10 rounded-2xl">
                    <Users className="mx-auto text-brand-gold/10 mb-4" size={48} />
                    <p className="text-stone-500 font-serif italic text-sm">Таны хайлтод таарах хэрэглэгч олдсонгүй.</p>
                  </div>
                ) : (
                  <div className="bg-[#111111] border-2 border-brand-gold/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#181818] border-b border-brand-gold/10 text-brand-gold/70 text-[10px] uppercase tracking-wider">
                            <th className="py-4 px-6 font-bold">Хэрэглэгч</th>
                            <th className="py-4 px-6 font-bold">Имэйл ХАЯГ</th>
                            <th className="py-4 px-6 font-bold">Бүртгүүлсэн огноо</th>
                            <th className="py-4 px-6 font-bold text-center">Үүрэг</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gold/5">
                          {filteredUsers.map((u) => {
                            const isUserAdmin = ADMIN_EMAILS.includes(u.email || '');
                            return (
                              <tr key={u.id} className="hover:bg-[#151515] transition-colors">
                                <td className="py-4 px-6 flex items-center gap-3">
                                  {u.photoURL ? (
                                    <img 
                                      src={u.photoURL} 
                                      alt={u.displayName} 
                                      className="w-8 h-8 rounded-full border border-brand-gold/20 object-cover shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center font-bold text-stone-500 border border-white/5">
                                      {u.displayName?.charAt(0) || 'U'}
                                    </div>
                                  )}
                                  <span className="font-bold text-white text-xs">{u.displayName || 'Unnamed'}</span>
                                </td>
                                <td className="py-4 px-6 text-stone-400">{u.email}</td>
                                <td className="py-4 px-6 text-stone-500">
                                  {u.createdAt ? (typeof u.createdAt === 'object' && u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleString('mn-MN') : new Date(u.createdAt).toLocaleDateString('mn-MN')) : 'Тодорхойгүй'}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  {isUserAdmin ? (
                                    <span className="text-[10px] px-2.5 py-1 bg-brand-gold/15 border border-brand-gold/30 rounded-full font-bold text-brand-gold uppercase">Админ</span>
                                  ) : (
                                    <span className="text-[10px] px-2.5 py-1 bg-stone-850 text-stone-500 rounded-full font-medium">Гишүүн</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. COMMENTS MODERATION SECTION */}
            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-brand-gold/15 pb-4">
                  <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">💬 СЭТГЭГДЭЛ МОДЕРАТОР ({commentsList.length})</h2>
                  <p className="text-[10px] font-sans text-brand-gold uppercase tracking-wider mt-1">Нийтлэгдсэн хэлэлцүүлэг, шүүмжүүдийг цензурдах өрөө</p>
                </div>

                {commentsList.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-brand-gold/10 rounded-2xl">
                    <MessageSquare className="mx-auto text-brand-gold/10 mb-4" size={48} />
                    <p className="text-stone-500 font-serif italic text-sm">Хэвлэгдсэн сэтгэгдэл одоогоор байхгүй байна.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {commentsList.map((comment) => (
                      <div 
                        key={comment.id}
                        className="bg-[#111111] border-2 border-brand-gold/5 hover:border-brand-gold/15 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {comment.userPhoto ? (
                            <img 
                              src={comment.userPhoto} 
                              alt={comment.userName} 
                              className="w-10 h-10 rounded-full border border-brand-gold/20 object-cover shrink-0 mt-1" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-stone-850 flex items-center justify-center font-sans font-bold text-stone-500 border border-white/5 shrink-0 mt-1">
                              {comment.userName?.charAt(0) || 'C'}
                            </div>
                          )}

                          <div className="text-xs">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                              <span className="font-bold font-sans text-brand-cream">{comment.userName}</span>
                              <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded font-bold font-sans uppercase">
                                {comment.comicTitle || 'Комик байхгүй'}
                              </span>
                              <span className="text-[10px] text-stone-500 font-sans">
                                {comment.createdAt ? (typeof comment.createdAt === 'object' && comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString('mn-MN') : new Date(comment.createdAt).toLocaleString('mn-MN')) : 'Огноогүй'}
                              </span>
                            </div>
                            <p className="text-stone-300 font-serif italic leading-relaxed text-sm">
                              "{comment.text}"
                            </p>
                          </div>
                        </div>

                        {/* Mod delete action */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center gap-1.5 self-end md:self-center px-4 py-2 border border-red-950 hover:border-red-500/50 hover:bg-red-500/10 text-stone-500 hover:text-red-500 transition-all font-sans font-bold text-[10px] uppercase tracking-widest rounded-xl"
                        >
                          <Trash2 size={13} />
                          Устгах
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Floating System Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] bg-brand-charcoal border border-brand-gold flex items-center gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl shadow-xl"
          >
            <CheckCircle className="text-brand-gold" size={20} />
            <span className="text-sm font-sans font-bold text-white">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
