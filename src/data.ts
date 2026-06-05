import { Comic } from './types';

export const MOCK_COMICS: Comic[] = [
  {
    id: '1',
    title: 'Алтан Орд',
    author: 'Баяр Бат',
    tagline: 'Мянган морины төвөргөөн дор тал нутаг чичирхийлсэн тэр цаг.',
    description: 'Чингис хааны ууган хүү Зүчийн эзэнт гүрний баруун хязгаарт өөрийн ноёрхлыг тогтоож буй түүхийг дага. Ах дүүс, урвалт, улс үндэстэн төрөн гарсан тухай өгүүлэмж.',
    coverImage: '/assets/images/comic_cover_warrior_1779099818296.png',
    episodeCount: 24,
    status: 'Үргэлжилж буй',
    category: 'Түүхэн Тулаант',
    chapters: [
      {
        id: 'c1',
        number: 1,
        title: 'Их Хуралдай',
        releaseDate: '2024-01-15',
        pages: [
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
        ]
      },
      {
        id: 'c2',
        number: 2,
        title: 'Тал нутаг дахь цус',
        releaseDate: '2024-02-01',
        pages: [
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Ган ба Чимээгүй',
    author: 'Энхмаа',
    tagline: 'Түүх нь бэх ба цусаар бичигддэг.',
    description: 'Хэнтийн нурууны сүүдэрт чимээгүй дайчин хаадын ариун булшийг хамгаалдаг. Гэвч гадны цэргүүд ойртох тусам түүний чимээгүй байх амлалт эцэст нь зөрчигдөх ёстой болно.',
    coverImage: '/assets/images/comic_cover_steppe_1779099835922.png',
    episodeCount: 12,
    status: 'Дууссан',
    category: 'Эпик Фэнтези',
    chapters: [
      {
        id: 's1',
        number: 1,
        title: 'Амлалт',
        releaseDate: '2023-11-20',
        pages: [
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Мандухай Сэцэн Хатан',
    author: 'Төгөлдөр',
    tagline: 'Бутарсан улс гүрнийг нэгтгэсэн хатан хаан.',
    description: 'Алтан ургийн тугийн дор дайтаж байсан аймгуудыг дахин нэгтгэсэн домогт Мандухай Сэцэн хатан. Улс төр, тулааны талбарт гайхагдсан түүх.',
    coverImage: '/assets/images/comic_cover_warrior_1779099818296.png',
    episodeCount: 36,
    status: 'Үргэлжилж буй',
    category: 'Түүхэн Драм',
    chapters: [
      {
        id: 'm1',
        number: 1,
        title: 'Улс гүрний хувь заяа',
        releaseDate: '2024-03-01',
        pages: [
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Хархорины шастир',
    author: 'Урангоо',
    tagline: 'Дэлхийн төвд ертөнц уулзсан газар.',
    description: 'Эзэнт гүрний нийслэл Хархорин бол соёл, шашин, тагнуулчдын уулзвар байв. Энэхүү цуврал нь эзэнт гүрний нууцад ороогдсон залуу дипломатчийг дагадаг.',
    coverImage: '/assets/images/haitan_hero_1779099801289.png',
    episodeCount: 18,
    status: 'Үргэлжилж буй',
    category: 'Нууц',
    chapters: [
      {
        id: 'h1',
        number: 1,
        title: 'Тэнгэрийн Элч',
        releaseDate: '2024-04-10',
        pages: [
          '/assets/images/parchment_texture_bg_1779099850609.png',
          '/assets/images/parchment_texture_bg_1779099850609.png',
        ]
      }
    ]
  }
];
