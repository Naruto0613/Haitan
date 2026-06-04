import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MapPin, Feather, Landmark, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function About() {
  const { user, loginWithGoogle } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        userName: user.displayName || 'Үл мэдэгдэх хэрэглэгч',
        userPhoto: user.photoURL || '',
        email: user.email || '',
        message: message.trim(),
        rating,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setMessage('');
      setRating(5);
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const values = [
    { 
      icon: Feather, 
      title: 'Түүхэн Үнэн', 
      desc: 'Бид 13-р зууны хуяг дуулга, зэвсэг, соёлын нарийн хэлбэрийг үнэн зөвөөр харуулахын тулд түүхчидтэй хамтран ажилладаг.' 
    },
    { 
      icon: Landmark, 
      title: 'Аман Уламжлал', 
      desc: 'Монголын түүхийн ихэнх хэсэг дуу хуур, аман домогоор амьдардаг. Бид эдгээр биет бус өвийг визуал хивсэнцэрт хөрвүүлдэг.' 
    },
    { 
      icon: ShieldCheck, 
      title: 'Соёлын Хадгалалт', 
      desc: 'Haitan бол зөвхөн комик сайт биш; энэ нь Монголын ирээдүй хойч үеийн түүхч нарт урам зориг өгөх дижитал архив юм.' 
    }
  ];

  return (
    <div className="pt-10 px-8">
      {/* Intro Section */}
      <section className="max-w-4xl mx-auto py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="text-brand-gold font-display font-bold tracking-[0.5em] uppercase text-[10px] mb-6 block">Бидний Зорилго</span>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-12 tracking-tight uppercase leading-none italic">
            Мөнх Тэнгэр Дахь <span className="text-brand-gold">Цуурай</span>
          </h1>
          <p className="text-xl text-brand-cream/60 font-serif leading-relaxed italic mb-16 px-4">
            "Haitan бол хоёр ертөнцийн уулзвар юм: бийрийн эртний бэх ба дэлгэцийн дижитал гэрэл. Бидний нэр түүхэн тэмдэглэл гэсэн утгаас гаралтай бөгөөд бидний зорилгыг тодорхойлдог."
          </p>
        </motion.div>
      </section>

      {/* Vision Blocks */}
      <section className="grid md:grid-cols-2 h-[500px] border-y border-brand-gold/10 rounded-2xl overflow-hidden">
        <div className="relative overflow-hidden group">
          <img 
            src="/src/assets/images/comic_cover_warrior_1779099818296.png" 
            alt="Warrior" 
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-[2000ms]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-dark/20" />
        </div>
        <div className="bg-brand-charcoal p-12 md:p-20 flex flex-col justify-center border-l border-brand-gold/10">
          <h2 className="text-3xl font-display font-bold text-brand-gold mb-6 uppercase tracking-widest leading-none italic">Бэх ба Өв</h2>
          <p className="text-brand-cream/60 font-serif leading-relaxed text-lg italic border-l border-brand-gold/10 pl-6">
            Улаанбаатар хотоос үүсэлтэй Haitan нь түүхээ уйтгартай сурах бичигт үлдэхийг хараад залхсан уран бүтээлчдийн жижиг хүрээнээс эхэлсэн. Өвөг дээдсийн минь догшин ширүүн зан, мэргэн ухаан орчин үеийн график романы хэмжээнд байх ёстой гэж бид үздэг.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-7xl mx-auto py-32 grid md:grid-cols-3 gap-16 px-8">
        {values.map((v, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 border border-brand-gold/20 flex items-center justify-center rotate-45 mb-10 group-hover:bg-brand-gold/10 group-hover:border-brand-gold transition-all duration-500 rounded-lg">
              <v.icon size={28} className="text-brand-gold -rotate-45" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-4 uppercase tracking-widest italic">{v.title}</h3>
            <p className="text-brand-cream/40 font-serif italic text-sm leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footnote */}
      <section className="bg-brand-charcoal border border-brand-gold/10 rounded-2xl max-w-5xl mx-auto p-12 mb-12 relative overflow-hidden text-center">
        <div className="soyombo-pattern absolute inset-0 opacity-5 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <MapPin size={32} className="text-brand-gold mb-8 opacity-50" />
          <p className="text-center text-brand-cream/60 font-serif italic text-lg max-w-2xl leading-relaxed">
            "Бид Номхон далайгаас Европын хаалга хүртэл мориор давхиж явсан агуу өвөг дээдсийнхээ мөрөн дээр зогсож байна. Тэдний түүх бол бидний бэх юм."
          </p>
        </div>
      </section>

      {/* User Feedback Submission Form */}
      <section className="max-w-2xl mx-auto bg-brand-charcoal border-2 border-brand-gold/10 rounded-3xl p-8 md:p-12 mb-24 text-left shadow-2xl relative overflow-hidden">
        <div className="soyombo-pattern absolute inset-0 opacity-5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 border-b border-brand-gold/10 pb-4 mb-6">
            <MessageSquare className="text-brand-gold" size={24} />
            <div>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest leading-none">Санал Хүсэлт Илгээх</h3>
              <p className="text-[10px] font-sans tracking-widest text-brand-gold uppercase mt-1">Түүхийн төслийг улам боловсронгуй болгоход тусална уу</p>
            </div>
          </div>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 bg-brand-gold/10 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-brand-gold" size={32} />
              </div>
              <h4 className="text-lg font-display font-bold text-white uppercase tracking-wider">Их баярлалаа!</h4>
              <p className="text-sm text-brand-cream/60 font-serif italic max-w-md mx-auto">
                Таны ирүүлсэн санал хүсэлт удирдах нөхдөд шууд хүргэгдлээ. Бид бүтээлээ улам сайжруулахад чармайн ажиллах болно.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs font-sans font-bold uppercase tracking-widest text-brand-gold hover:underline"
              >
                Дахин санал үлдээх
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-sans font-bold text-stone-400 tracking-wider">Төслийн ерөнхий үнэлгээ</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-stone-600 hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={28} 
                        className={star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-[#333333]'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-sans font-bold text-stone-400 tracking-wider">Таны санал, сэтгэгдэл</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Энд санал хүсэлтээ бичнэ үү..."
                  className="w-full bg-brand-dark/50 border border-brand-gold/15 focus:border-brand-gold outline-none p-4 text-sm text-brand-cream italic rounded-2xl placeholder:text-stone-700 font-serif"
                />
              </div>

              {user ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-gold hover:bg-brand-amber text-brand-dark font-sans font-black text-xs py-4 px-6 uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  {submitting ? 'Илгээж байна...' : '⚔️ Саналаа дуулгах'}
                </button>
              ) : (
                <div className="border border-brand-gold/10 p-5 rounded-2xl bg-brand-dark/40 text-center space-y-4">
                  <p className="text-xs text-brand-cream/50 font-serif italic">Санал хүсэлт илгээхийн тулд Google хаягаараа нэврэх хэрэгтэй.</p>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="bg-brand-gold hover:bg-brand-amber text-brand-dark font-sans font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-gold/10"
                  >
                    Google Хаягаар Нэвтрэх
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
