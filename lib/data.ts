import type { Listing, Niche } from "./types";
import { SQ_M_PER_PERSON } from "./scoring";

export const DISTRICTS = [
  "Все",
  "Медеуский",
  "Бостандыкский",
  "Алмалинский",
  "Ауэзовский",
  "Алатауский",
  "Наурызбайский",
  "Турксибский",
  "Жетысуский",
];

export const PROPERTY_TYPES = [
  "Все",
  "Общепит",
  "Офис",
  "Магазин",
  "Склад",
  "Свободное",
];

export const CONDITIONS = [
  "Все",
  "Свежий ремонт",
  "Черновая отделка",
  "Хорошее состояние",
  "Требует ремонта",
  "Евроремонт",
];

export const ENTRANCES = [
  "Все",
  "Отдельный, с улицы",
  "Отдельный",
  "Со двора",
  "Через подъезд",
  "С торца здания",
];

export const NICHES: Niche[] = [
  {
    id: "coffee",
    label: "Кофейня",
    icon: "☕",
    directRubric: "Кофейни, Кафе-кондитерские",
    indirectRubric: "Пекарни, чайные",
  },
  {
    id: "doner",
    label: "Донерная",
    icon: "🌯",
    directRubric: "Донерные, фастфуд",
    indirectRubric: "Пиццерии, бургерные",
  },
  {
    id: "restaurant",
    label: "Ресторан",
    icon: "🍽️",
    directRubric: "Рестораны, бары",
    indirectRubric: "Кафе, банкетные залы",
  },
];

export const LISTINGS: Listing[] = [
  // === 1. Медеуский — центр, премиум ===
  {
    id: 1,
    district: "Медеуский",
    propertyType: "Общепит",
    address: "ул. Гоголя 50, угол Тулебаева",
    lat: 43.2567,
    lng: 76.9453,
    area: 200,
    price: 3000000,
    m2: 15000,
    floor: 1,
    ceilings: 3.0,
    condition: "Свежий ремонт",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "вентиляция"],
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12847291",
    radius: {
      direct: [
        { name: "Starbucks", dist: 120, rating: 4.2, check: 3500, reviews: 890 },
        { name: "URBO Coffee", dist: 280, rating: 4.5, check: 1800, reviews: 1240, branches: 40 },
        { name: "Coffee Boom", dist: 450, rating: 4.1, check: 1500, reviews: 320 },
        { name: "Дринкит", dist: 380, rating: 4.7, check: 2000, reviews: 276 },
      ],
      indirect: [
        { name: "Paul's Bakery", dist: 200, type: "пекарня", rating: 4.3 },
        { name: "Burger King", dist: 340, type: "фастфуд", rating: 3.8 },
        { name: "KFC", dist: 510, type: "фастфуд", rating: 3.5 },
      ],
      synergy: [
        { name: "БЦ Almaty Towers", dist: 90, type: "бизнес-центр", people: "~2 000 сотрудников" },
        { name: "ТЦ Dostyk Plaza", dist: 400, type: "ТЦ", people: "~15 000 посетителей/день" },
        { name: "Отель Казахстан", dist: 350, type: "гостиница", people: "~300 номеров" },
        { name: "Казахский нац. университет", dist: 800, type: "вуз", people: "~20 000 студентов" },
      ],
      gov: [
        { name: "ЦОН Медеуского р-на", dist: 600, type: "ЦОН" },
        { name: "Налоговая инспекция", dist: 800, type: "налоговая" },
        { name: "Акимат Медеуского р-на", dist: 950, type: "акимат" },
      ],
      transport: [
        { name: "ост. Тулебаева", dist: 80, routes: ["37", "63", "121"] },
        { name: "ост. Гоголя — Тулебаева", dist: 150, routes: ["2", "65", "95"] },
        { name: "Метро «Абай»", dist: 700, routes: ["M1"] },
      ],
      housing: {
        buildings: 45, apartments: 3200, totalAreaM2: 233000,
        estPopulation: Math.round(233000 / SQ_M_PER_PERSON),
        avgApartmentM2: 72, radius: 1000,
      },
      pedestrian: { weekday: 12400, weekend: 8200, peakHour: 1850, source: "оценка по транспорту" },
    },
  },
  // === 2. Ауэзовский — спальный, средний сегмент ===
  {
    id: 2,
    district: "Ауэзовский",
    propertyType: "Общепит",
    address: "ул. Жандосова 108/1 — Навои, ЖК Asyl Tas",
    lat: 43.218,
    lng: 76.8687,
    area: 138,
    price: 1490000,
    m2: 10797,
    floor: 1,
    ceilings: 3.0,
    condition: "Черновая отделка",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "видеонаблюдение"],
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13001847",
    radius: {
      direct: [
        { name: "Кофейня Батыр", dist: 300, rating: 4.0, check: 1200, reviews: 89 },
        { name: "Coffee Moon", dist: 520, rating: 3.8, check: 1000, reviews: 54 },
      ],
      indirect: [
        { name: "Doner House", dist: 180, type: "донерная", rating: 4.2 },
        { name: "Paloma Pizza", dist: 400, type: "пиццерия", rating: 4.0 },
      ],
      synergy: [
        { name: "ТРЦ MEGA Almaty", dist: 2200, type: "ТЦ", people: "~40 000 посетителей/день" },
        { name: "Университет Нархоз", dist: 1800, type: "вуз", people: "~8 000 студентов" },
        { name: "ЖК Asyl Tas", dist: 0, type: "жилой комплекс", people: "~1 200 квартир" },
        { name: "Фитнес World Class", dist: 600, type: "фитнес", people: "~500 членов" },
      ],
      gov: [
        { name: "Акимат Ауэзовского р-на", dist: 1500, type: "акимат" },
        { name: "ЦОН Ауэзовского р-на", dist: 2000, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Жандосова — Навои", dist: 60, routes: ["38", "44", "131"] },
        { name: "ост. Навои", dist: 250, routes: ["63", "95"] },
      ],
      housing: {
        buildings: 62, apartments: 5800, totalAreaM2: 417000,
        estPopulation: Math.round(417000 / SQ_M_PER_PERSON),
        avgApartmentM2: 65, radius: 1000,
      },
      pedestrian: { weekday: 6800, weekend: 4100, peakHour: 980, source: "оценка по транспорту" },
    },
  },
  // === 3. Алмалинский — центр, ресторанный ===
  {
    id: 3,
    district: "Алмалинский",
    propertyType: "Общепит",
    address: "ул. Розыбакиева 45, угол Толе би",
    lat: 43.2551,
    lng: 76.9235,
    area: 500,
    price: 7500000,
    m2: 15000,
    floor: 1,
    ceilings: 4.0,
    condition: "Черновая отделка",
    entrance: "Отдельный",
    features: ["свет", "вода", "канализация", "отопление"],
    photos: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12993104",
    radius: {
      direct: [
        { name: "The Ritz", dist: 200, rating: 4.6, check: 8000, reviews: 1540 },
        { name: "Del Papa", dist: 350, rating: 4.3, check: 5000, reviews: 2100 },
        { name: "ABR Restaurant", dist: 180, rating: 4.4, check: 6000, reviews: 780 },
      ],
      indirect: [
        { name: "Marrone Rosso", dist: 280, type: "кофейня", rating: 4.5 },
        { name: "Degirmen", dist: 500, type: "донерная", rating: 3.7, branches: 50 },
      ],
      synergy: [
        { name: "БЦ Нурлы Тау", dist: 600, type: "бизнес-центр", people: "~5 000 сотрудников" },
        { name: "Клиника Интертич", dist: 300, type: "медцентр", people: "~500 пациентов/день" },
      ],
      gov: [
        { name: "Управление образования", dist: 700, type: "управление" },
        { name: "Суд Алмалинского р-на", dist: 900, type: "суд" },
      ],
      transport: [
        { name: "ост. Розыбакиева — Толе би", dist: 40, routes: ["2", "63", "95"] },
        { name: "ост. Толе би", dist: 200, routes: ["65", "121"] },
        { name: "Метро «Байконыр»", dist: 900, routes: ["M1"] },
      ],
      housing: {
        buildings: 38, apartments: 2800, totalAreaM2: 198000,
        estPopulation: Math.round(198000 / SQ_M_PER_PERSON),
        avgApartmentM2: 78, radius: 1000,
      },
      pedestrian: { weekday: 9600, weekend: 6400, peakHour: 1420, source: "оценка по транспорту" },
    },
  },
  // === 4. Наурызбайский — окраина, бюджет ===
  {
    id: 4,
    district: "Наурызбайский",
    propertyType: "Свободное",
    address: "мкр Калкаман-2, ул. Актамберды жырау",
    lat: 43.285,
    lng: 76.82,
    area: 180,
    price: 540000,
    m2: 3000,
    floor: 1,
    ceilings: 3.0,
    condition: "Свежий ремонт",
    entrance: "Отдельный",
    features: ["свет", "вода", "газ", "канализация"],
    photos: [
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12788430",
    radius: {
      direct: [{ name: "Чайхана у дороги", dist: 400, rating: 3.5, check: 2000, reviews: 42 }],
      indirect: [{ name: "Магазин Анвар", dist: 150, type: "продукты", rating: 3.2 }],
      synergy: [
        { name: "Рынок Калкаман", dist: 500, type: "рынок", people: "~3 000 посетителей/день" },
        { name: "Школа №156", dist: 300, type: "школа", people: "~800 учеников" },
      ],
      gov: [{ name: "Акимат мкр Калкаман", dist: 800, type: "акимат" }],
      transport: [{ name: "ост. Калкаман-2", dist: 120, routes: ["44", "131"] }],
      housing: {
        buildings: 85, apartments: 4200, totalAreaM2: 315000,
        estPopulation: Math.round(315000 / SQ_M_PER_PERSON),
        avgApartmentM2: 58, radius: 1000,
      },
      pedestrian: { weekday: 2800, weekend: 1900, peakHour: 420, source: "оценка по транспорту" },
    },
  },
  // === 5. Бостандыкский — у МЕГИ ===
  {
    id: 5,
    district: "Бостандыкский",
    propertyType: "Общепит",
    address: "у ТРЦ МЕГА, ЖК R-House, 2 этаж",
    lat: 43.229,
    lng: 76.901,
    area: 183,
    price: 2745000,
    m2: 15000,
    floor: 2,
    ceilings: 5.8,
    condition: "Свежий ремонт",
    entrance: "Отдельный",
    features: ["свет", "отопление", "пожарная сигнализация"],
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13102553",
    radius: {
      direct: [
        { name: "Coffeedelia", dist: 250, rating: 4.6, check: 3000, reviews: 920 },
        { name: "DoubleB", dist: 400, rating: 4.4, check: 2500, reviews: 540 },
        { name: "URBO Coffee", dist: 600, rating: 4.5, check: 1800, reviews: 380, branches: 40 },
      ],
      indirect: [
        { name: "Dodo Pizza", dist: 300, type: "пиццерия", rating: 4.3 },
        { name: "DURUM", dist: 500, type: "донерная", rating: 4.8, branches: 25 },
      ],
      synergy: [
        { name: "ТРЦ MEGA Almaty", dist: 200, type: "ТЦ", people: "~40 000/день" },
        { name: "MEGA Park", dist: 400, type: "ТЦ", people: "~20 000/день" },
        { name: "Кинотеатр Kinopark", dist: 250, type: "кинотеатр", people: "~3 000/день" },
      ],
      gov: [{ name: "ЦОН Бостандыкского р-на", dist: 1800, type: "ЦОН" }],
      transport: [
        { name: "ост. МЕГА", dist: 100, routes: ["12", "37", "65", "95"] },
        { name: "ост. Розыбакиева", dist: 350, routes: ["2", "38"] },
      ],
      housing: {
        buildings: 30, apartments: 2400, totalAreaM2: 180000,
        estPopulation: Math.round(180000 / SQ_M_PER_PERSON),
        avgApartmentM2: 75, radius: 1000,
      },
      pedestrian: { weekday: 18500, weekend: 24000, peakHour: 3200, source: "оценка по ТЦ-трафику" },
    },
  },
  // === 6. Медеуский — офис в БЦ ===
  {
    id: 6,
    district: "Медеуский",
    propertyType: "Офис",
    address: "пр. Достык 38, БЦ Premium Tower",
    lat: 43.2385,
    lng: 76.9568,
    area: 120,
    price: 1800000,
    m2: 15000,
    floor: 5,
    ceilings: 3.2,
    condition: "Евроремонт",
    entrance: "Через подъезд",
    features: ["свет", "отопление", "кондиционер", "интернет", "охрана"],
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13200145",
    radius: {
      direct: [
        { name: "Regus Coworking", dist: 200, rating: 4.1, check: 5000, reviews: 120 },
        { name: "WeWork Almaty", dist: 450, rating: 4.3, check: 7000, reviews: 85 },
      ],
      indirect: [
        { name: "Marrone Rosso", dist: 150, type: "кофейня", rating: 4.5 },
      ],
      synergy: [
        { name: "ТЦ Dostyk Plaza", dist: 300, type: "ТЦ", people: "~15 000/день" },
        { name: "Консульство РФ", dist: 500, type: "консульство", people: "~200 посетителей/день" },
        { name: "Парк 28 Панфиловцев", dist: 600, type: "парк", people: "~5 000/день" },
      ],
      gov: [
        { name: "Акимат Медеуского р-на", dist: 400, type: "акимат" },
        { name: "ЦОН Медеуского р-на", dist: 700, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Достык — Абая", dist: 100, routes: ["12", "63", "95"] },
        { name: "Метро «Абай»", dist: 500, routes: ["M1"] },
      ],
      housing: {
        buildings: 35, apartments: 2500, totalAreaM2: 195000,
        estPopulation: Math.round(195000 / SQ_M_PER_PERSON),
        avgApartmentM2: 85, radius: 1000,
      },
      pedestrian: { weekday: 14200, weekend: 9800, peakHour: 2100, source: "оценка по транспорту" },
    },
  },
  // === 7. Турксибский — рынок, бюджет ===
  {
    id: 7,
    district: "Турксибский",
    propertyType: "Магазин",
    address: "ул. Сейфуллина 520, у рынка Алтын-Орда",
    lat: 43.2812,
    lng: 76.9345,
    area: 65,
    price: 350000,
    m2: 5385,
    floor: 1,
    ceilings: 2.8,
    condition: "Хорошее состояние",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация"],
    photos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12654789",
    radius: {
      direct: [
        { name: "Магнум", dist: 200, rating: 4.0, check: 0, reviews: 340 },
        { name: "Small", dist: 350, rating: 3.8, check: 0, reviews: 120 },
      ],
      indirect: [
        { name: "Чайхана Навои", dist: 280, type: "общепит", rating: 3.9 },
      ],
      synergy: [
        { name: "Рынок Алтын-Орда", dist: 100, type: "рынок", people: "~10 000 посетителей/день" },
        { name: "Вокзал Алматы-2", dist: 800, type: "вокзал", people: "~3 000 пассажиров/день" },
      ],
      gov: [
        { name: "ЦОН Турксибского р-на", dist: 1200, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Алтын-Орда", dist: 50, routes: ["21", "38", "65"] },
        { name: "ост. Сейфуллина", dist: 200, routes: ["2", "44", "63"] },
      ],
      housing: {
        buildings: 70, apartments: 4800, totalAreaM2: 336000,
        estPopulation: Math.round(336000 / SQ_M_PER_PERSON),
        avgApartmentM2: 55, radius: 1000,
      },
      pedestrian: { weekday: 15600, weekend: 11200, peakHour: 2400, source: "оценка по рынку" },
    },
  },
  // === 8. Бостандыкский — кофейня у НИШ/универов ===
  {
    id: 8,
    district: "Бостандыкский",
    propertyType: "Общепит",
    address: "ул. Тимирязева 42, угол Ауэзова",
    lat: 43.2345,
    lng: 76.9123,
    area: 85,
    price: 1200000,
    m2: 14118,
    floor: 1,
    ceilings: 3.5,
    condition: "Свежий ремонт",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "вентиляция", "кондиционер"],
    photos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13045678",
    radius: {
      direct: [
        { name: "Beans Coffee", dist: 350, rating: 4.3, check: 1600, reviews: 210 },
      ],
      indirect: [
        { name: "Paul's Bakery", dist: 280, type: "пекарня", rating: 4.4 },
        { name: "Bro Burger", dist: 400, type: "бургерная", rating: 4.1 },
      ],
      synergy: [
        { name: "КазНУ (главный корпус)", dist: 400, type: "вуз", people: "~25 000 студентов" },
        { name: "НИШ Алматы", dist: 600, type: "школа", people: "~720 учеников" },
        { name: "Ботанический сад", dist: 300, type: "парк", people: "~2 000/день" },
        { name: "Фитнес Fitness First", dist: 500, type: "фитнес", people: "~800 членов" },
      ],
      gov: [
        { name: "Управление молодёжи", dist: 900, type: "управление" },
      ],
      transport: [
        { name: "ост. Тимирязева — Ауэзова", dist: 70, routes: ["95", "121"] },
        { name: "ост. Ауэзова", dist: 250, routes: ["37", "63"] },
      ],
      housing: {
        buildings: 48, apartments: 3600, totalAreaM2: 270000,
        estPopulation: Math.round(270000 / SQ_M_PER_PERSON),
        avgApartmentM2: 68, radius: 1000,
      },
      pedestrian: { weekday: 11200, weekend: 5600, peakHour: 1800, source: "оценка по вузам" },
    },
  },
  // === 9. Алмалинский — магазин на Абая ===
  {
    id: 9,
    district: "Алмалинский",
    propertyType: "Магазин",
    address: "пр. Абая 68, угол Байтурсынова",
    lat: 43.2401,
    lng: 76.9180,
    area: 95,
    price: 1900000,
    m2: 20000,
    floor: 1,
    ceilings: 3.2,
    condition: "Хорошее состояние",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "витрина"],
    photos: [
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13078901",
    radius: {
      direct: [
        { name: "Sulpak", dist: 300, rating: 4.2, check: 0, reviews: 560 },
        { name: "Технодом", dist: 500, rating: 4.0, check: 0, reviews: 430 },
      ],
      indirect: [
        { name: "Fix Price", dist: 200, type: "магазин", rating: 3.5 },
      ],
      synergy: [
        { name: "ТЦ Алмалы", dist: 350, type: "ТЦ", people: "~8 000/день" },
        { name: "БЦ Алатау", dist: 500, type: "бизнес-центр", people: "~1 500 сотрудников" },
      ],
      gov: [
        { name: "ЦОН Алмалинского р-на", dist: 600, type: "ЦОН" },
        { name: "Суд Алмалинского р-на", dist: 800, type: "суд" },
      ],
      transport: [
        { name: "Метро «Алмалы»", dist: 200, routes: ["M1"] },
        { name: "ост. Абая — Байтурсынова", dist: 80, routes: ["2", "37", "65", "95"] },
      ],
      housing: {
        buildings: 42, apartments: 3100, totalAreaM2: 220000,
        estPopulation: Math.round(220000 / SQ_M_PER_PERSON),
        avgApartmentM2: 70, radius: 1000,
      },
      pedestrian: { weekday: 16800, weekend: 10500, peakHour: 2500, source: "оценка по метро" },
    },
  },
  // === 10. Жетысуский — склад ===
  {
    id: 10,
    district: "Жетысуский",
    propertyType: "Склад",
    address: "ул. Рыскулова 253, промзона",
    lat: 43.2950,
    lng: 76.9780,
    area: 400,
    price: 600000,
    m2: 1500,
    floor: 1,
    ceilings: 6.0,
    condition: "Требует ремонта",
    entrance: "С торца здания",
    features: ["свет", "ворота", "рампа", "охрана"],
    photos: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12890456",
    radius: {
      direct: [
        { name: "Складской комплекс А", dist: 300, rating: 3.5, check: 0, reviews: 15 },
      ],
      indirect: [],
      synergy: [
        { name: "Рынок Барлык", dist: 800, type: "рынок", people: "~5 000/день" },
      ],
      gov: [
        { name: "Акимат Жетысуского р-на", dist: 2000, type: "акимат" },
      ],
      transport: [
        { name: "ост. Рыскулова", dist: 200, routes: ["21", "44"] },
      ],
      housing: {
        buildings: 25, apartments: 1800, totalAreaM2: 120000,
        estPopulation: Math.round(120000 / SQ_M_PER_PERSON),
        avgApartmentM2: 52, radius: 1000,
      },
      pedestrian: { weekday: 3200, weekend: 1100, peakHour: 500, source: "оценка по промзоне" },
    },
  },
  // === 11. Алатауский — новостройка ===
  {
    id: 11,
    district: "Алатауский",
    propertyType: "Общепит",
    address: "мкр Алгабас-1, ул. Рыскулбекова 29",
    lat: 43.1920,
    lng: 76.8350,
    area: 110,
    price: 770000,
    m2: 7000,
    floor: 1,
    ceilings: 3.0,
    condition: "Черновая отделка",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление"],
    photos: [
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13112233",
    radius: {
      direct: [],
      indirect: [
        { name: "Столовая Алгабас", dist: 200, type: "столовая", rating: 3.6 },
      ],
      synergy: [
        { name: "ЖК Алгабас Сити", dist: 100, type: "жилой комплекс", people: "~3 000 квартир" },
        { name: "Школа №189", dist: 400, type: "школа", people: "~1 200 учеников" },
        { name: "Детский сад №45", dist: 250, type: "детсад", people: "~200 детей" },
      ],
      gov: [
        { name: "ЦОН Алатауского р-на", dist: 1500, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Алгабас", dist: 150, routes: ["106", "131"] },
      ],
      housing: {
        buildings: 95, apartments: 8500, totalAreaM2: 595000,
        estPopulation: Math.round(595000 / SQ_M_PER_PERSON),
        avgApartmentM2: 55, radius: 1000,
      },
      pedestrian: { weekday: 4200, weekend: 3100, peakHour: 650, source: "оценка по новостройке" },
    },
  },
  // === 12. Медеуский — кофейня у Арбата ===
  {
    id: 12,
    district: "Медеуский",
    propertyType: "Общепит",
    address: "ул. Жибек Жолы 64, Арбат",
    lat: 43.2590,
    lng: 76.9410,
    area: 60,
    price: 2200000,
    m2: 36667,
    floor: 1,
    ceilings: 3.8,
    condition: "Евроремонт",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "вентиляция", "кондиционер", "витрина"],
    photos: [
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13156789",
    radius: {
      direct: [
        { name: "Starbucks Арбат", dist: 80, rating: 4.3, check: 3200, reviews: 1450 },
        { name: "URBO Coffee", dist: 120, rating: 4.5, check: 1800, reviews: 890, branches: 40 },
        { name: "Кофемания", dist: 200, rating: 4.6, check: 2800, reviews: 560 },
        { name: "Coffee Boom", dist: 300, rating: 4.1, check: 1500, reviews: 290 },
        { name: "DoubleB", dist: 350, rating: 4.4, check: 2500, reviews: 410 },
      ],
      indirect: [
        { name: "Green Чай", dist: 150, type: "чайная", rating: 4.2 },
        { name: "Paul's Bakery", dist: 250, type: "пекарня", rating: 4.4 },
      ],
      synergy: [
        { name: "Арбат (пешеходная улица)", dist: 0, type: "пешеходная зона", people: "~25 000/день" },
        { name: "Зелёный базар", dist: 400, type: "рынок", people: "~8 000/день" },
        { name: "Гостиница Казахстан", dist: 500, type: "гостиница", people: "~300 номеров" },
      ],
      gov: [
        { name: "Акимат города Алматы", dist: 800, type: "акимат" },
      ],
      transport: [
        { name: "ост. Жибек Жолы", dist: 50, routes: ["2", "37", "63", "95", "121"] },
        { name: "Метро «Жибек Жолы»", dist: 300, routes: ["M1"] },
      ],
      housing: {
        buildings: 30, apartments: 2200, totalAreaM2: 165000,
        estPopulation: Math.round(165000 / SQ_M_PER_PERSON),
        avgApartmentM2: 80, radius: 1000,
      },
      pedestrian: { weekday: 25000, weekend: 32000, peakHour: 4500, source: "оценка по Арбату" },
    },
  },
  // === 13. Ауэзовский — донерная у базара ===
  {
    id: 13,
    district: "Ауэзовский",
    propertyType: "Общепит",
    address: "мкр 5, ул. Маметовой 12, у базара Болашак",
    lat: 43.2250,
    lng: 76.8520,
    area: 45,
    price: 400000,
    m2: 8889,
    floor: 1,
    ceilings: 2.8,
    condition: "Хорошее состояние",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "газ", "канализация"],
    photos: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12978654",
    radius: {
      direct: [
        { name: "Donner King", dist: 150, rating: 4.0, check: 1200, reviews: 180 },
        { name: "Шаурма 24", dist: 280, rating: 3.7, check: 800, reviews: 95 },
      ],
      indirect: [
        { name: "Бургер Street", dist: 300, type: "бургерная", rating: 3.9 },
        { name: "Пиццерия Olo", dist: 450, type: "пиццерия", rating: 4.0 },
      ],
      synergy: [
        { name: "Базар Болашак", dist: 50, type: "рынок", people: "~7 000/день" },
        { name: "Школа №129", dist: 300, type: "школа", people: "~900 учеников" },
      ],
      gov: [
        { name: "Акимат Ауэзовского р-на", dist: 1200, type: "акимат" },
      ],
      transport: [
        { name: "ост. Базар Болашак", dist: 60, routes: ["38", "44", "131"] },
        { name: "ост. Маметовой", dist: 200, routes: ["63"] },
      ],
      housing: {
        buildings: 75, apartments: 6200, totalAreaM2: 434000,
        estPopulation: Math.round(434000 / SQ_M_PER_PERSON),
        avgApartmentM2: 58, radius: 1000,
      },
      pedestrian: { weekday: 8500, weekend: 6200, peakHour: 1300, source: "оценка по рынку" },
    },
  },
  // === 14. Бостандыкский — офис на Аль-Фараби ===
  {
    id: 14,
    district: "Бостандыкский",
    propertyType: "Офис",
    address: "пр. Аль-Фараби 15, БЦ Нурлы Тау, блок 4Б",
    lat: 43.2180,
    lng: 76.9280,
    area: 250,
    price: 3750000,
    m2: 15000,
    floor: 8,
    ceilings: 3.0,
    condition: "Евроремонт",
    entrance: "Через подъезд",
    features: ["свет", "отопление", "кондиционер", "интернет", "охрана", "парковка"],
    photos: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13234567",
    radius: {
      direct: [
        { name: "Regus Нурлы Тау", dist: 50, rating: 4.2, check: 6000, reviews: 95 },
        { name: "IWG Spaces", dist: 200, rating: 4.0, check: 5500, reviews: 60 },
      ],
      indirect: [],
      synergy: [
        { name: "БЦ Нурлы Тау (весь комплекс)", dist: 0, type: "бизнес-центр", people: "~5 000 сотрудников" },
        { name: "Esentai Mall", dist: 800, type: "ТЦ", people: "~12 000/день" },
        { name: "Rixos Hotel", dist: 600, type: "гостиница", people: "~200 номеров" },
      ],
      gov: [
        { name: "НПП Атамекен", dist: 500, type: "НПП" },
      ],
      transport: [
        { name: "ост. Нурлы Тау", dist: 100, routes: ["12", "95"] },
        { name: "ост. Аль-Фараби", dist: 300, routes: ["37", "65"] },
      ],
      housing: {
        buildings: 20, apartments: 1600, totalAreaM2: 152000,
        estPopulation: Math.round(152000 / SQ_M_PER_PERSON),
        avgApartmentM2: 95, radius: 1000,
      },
      pedestrian: { weekday: 8900, weekend: 3200, peakHour: 1500, source: "оценка по БЦ" },
    },
  },
  // === 15. Жетысуский — общепит у Саяхата ===
  {
    id: 15,
    district: "Жетысуский",
    propertyType: "Общепит",
    address: "ул. Момышулы 2, у автовокзала Саяхат",
    lat: 43.2720,
    lng: 76.9650,
    area: 150,
    price: 1050000,
    m2: 7000,
    floor: 1,
    ceilings: 3.2,
    condition: "Хорошее состояние",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "газ"],
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12876543",
    radius: {
      direct: [
        { name: "Чайхана Достар", dist: 100, rating: 4.1, check: 2500, reviews: 320 },
        { name: "Кафе Саяхат", dist: 200, rating: 3.8, check: 1800, reviews: 180 },
      ],
      indirect: [
        { name: "KFC", dist: 300, type: "фастфуд", rating: 3.6 },
        { name: "Hardee's", dist: 400, type: "фастфуд", rating: 3.9 },
      ],
      synergy: [
        { name: "Автовокзал Саяхат", dist: 100, type: "вокзал", people: "~5 000 пассажиров/день" },
        { name: "ТЦ Саяхат", dist: 200, type: "ТЦ", people: "~6 000/день" },
        { name: "Гостиница Саяхат", dist: 150, type: "гостиница", people: "~100 номеров" },
      ],
      gov: [
        { name: "ЦОН Жетысуского р-на", dist: 900, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Саяхат", dist: 50, routes: ["2", "12", "37", "44", "65", "95"] },
        { name: "Метро «Саяхат»", dist: 400, routes: ["M1"] },
      ],
      housing: {
        buildings: 55, apartments: 4000, totalAreaM2: 280000,
        estPopulation: Math.round(280000 / SQ_M_PER_PERSON),
        avgApartmentM2: 60, radius: 1000,
      },
      pedestrian: { weekday: 13500, weekend: 8900, peakHour: 2200, source: "оценка по автовокзалу" },
    },
  },
  // === 16. Наурызбайский — свободное на трассе ===
  {
    id: 16,
    district: "Наурызбайский",
    propertyType: "Свободное",
    address: "трасса Алматы — Бишкек, 12 км",
    lat: 43.3100,
    lng: 76.8000,
    area: 300,
    price: 450000,
    m2: 1500,
    floor: 1,
    ceilings: 4.0,
    condition: "Требует ремонта",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "газ", "парковка"],
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12765432",
    radius: {
      direct: [],
      indirect: [
        { name: "АЗС KazMunayGas", dist: 200, type: "АЗС", rating: 3.8 },
      ],
      synergy: [
        { name: "Логистический парк", dist: 500, type: "логистика", people: "~300 сотрудников" },
        { name: "Авторынок Алматы", dist: 1500, type: "рынок", people: "~8 000/день" },
      ],
      gov: [],
      transport: [
        { name: "ост. 12-й км", dist: 300, routes: ["106"] },
      ],
      housing: {
        buildings: 15, apartments: 800, totalAreaM2: 56000,
        estPopulation: Math.round(56000 / SQ_M_PER_PERSON),
        avgApartmentM2: 50, radius: 1000,
      },
      pedestrian: { weekday: 800, weekend: 500, peakHour: 120, source: "оценка по трассе" },
    },
  },
  // === 17. Алмалинский — маленькая кофейня ===
  {
    id: 17,
    district: "Алмалинский",
    propertyType: "Общепит",
    address: "ул. Кабанбай батыра 78",
    lat: 43.2520,
    lng: 76.9310,
    area: 35,
    price: 700000,
    m2: 20000,
    floor: 1,
    ceilings: 3.0,
    condition: "Свежий ремонт",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация"],
    photos: [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13189012",
    radius: {
      direct: [
        { name: "Тибет кофе", dist: 200, rating: 4.3, check: 1800, reviews: 340 },
      ],
      indirect: [
        { name: "Пекарня Крошка", dist: 150, type: "пекарня", rating: 4.0 },
      ],
      synergy: [
        { name: "БЦ Алматы", dist: 200, type: "бизнес-центр", people: "~1 000 сотрудников" },
        { name: "КазГЮУ", dist: 500, type: "вуз", people: "~5 000 студентов" },
      ],
      gov: [
        { name: "Минюст", dist: 400, type: "министерство" },
      ],
      transport: [
        { name: "ост. Кабанбай батыра", dist: 60, routes: ["2", "63", "95"] },
        { name: "Метро «Алмалы»", dist: 500, routes: ["M1"] },
      ],
      housing: {
        buildings: 40, apartments: 3000, totalAreaM2: 210000,
        estPopulation: Math.round(210000 / SQ_M_PER_PERSON),
        avgApartmentM2: 72, radius: 1000,
      },
      pedestrian: { weekday: 10200, weekend: 6800, peakHour: 1600, source: "оценка по транспорту" },
    },
  },
  // === 18. Турксибский — магазин у ЖД вокзала ===
  {
    id: 18,
    district: "Турксибский",
    propertyType: "Магазин",
    address: "ул. Абылай хана 105, у вокзала Алматы-2",
    lat: 43.2780,
    lng: 76.9420,
    area: 80,
    price: 800000,
    m2: 10000,
    floor: 1,
    ceilings: 3.0,
    condition: "Хорошее состояние",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "витрина"],
    photos: [
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12934567",
    radius: {
      direct: [
        { name: "Магнум Express", dist: 180, rating: 4.0, check: 0, reviews: 210 },
      ],
      indirect: [
        { name: "Кулинария №1", dist: 250, type: "кулинария", rating: 3.8 },
      ],
      synergy: [
        { name: "ЖД вокзал Алматы-2", dist: 200, type: "вокзал", people: "~4 000 пассажиров/день" },
        { name: "Центральный рынок", dist: 600, type: "рынок", people: "~12 000/день" },
      ],
      gov: [
        { name: "Миграционная полиция", dist: 500, type: "полиция" },
      ],
      transport: [
        { name: "ост. Вокзал Алматы-2", dist: 80, routes: ["2", "21", "37", "44", "65"] },
        { name: "Метро «Райымбек»", dist: 300, routes: ["M1"] },
      ],
      housing: {
        buildings: 50, apartments: 3500, totalAreaM2: 245000,
        estPopulation: Math.round(245000 / SQ_M_PER_PERSON),
        avgApartmentM2: 56, radius: 1000,
      },
      pedestrian: { weekday: 14800, weekend: 9500, peakHour: 2300, source: "оценка по вокзалу" },
    },
  },
  // === 19. Алатауский — офис бюджет ===
  {
    id: 19,
    district: "Алатауский",
    propertyType: "Офис",
    address: "мкр Шанырак-2, ул. Жанкожа батыра 6",
    lat: 43.1980,
    lng: 76.8480,
    area: 55,
    price: 220000,
    m2: 4000,
    floor: 2,
    ceilings: 2.7,
    condition: "Требует ремонта",
    entrance: "Со двора",
    features: ["свет", "отопление"],
    photos: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #12845678",
    radius: {
      direct: [],
      indirect: [],
      synergy: [
        { name: "Школа №172", dist: 300, type: "школа", people: "~600 учеников" },
      ],
      gov: [],
      transport: [
        { name: "ост. Шанырак", dist: 200, routes: ["106"] },
      ],
      housing: {
        buildings: 60, apartments: 2800, totalAreaM2: 196000,
        estPopulation: Math.round(196000 / SQ_M_PER_PERSON),
        avgApartmentM2: 48, radius: 1000,
      },
      pedestrian: { weekday: 1800, weekend: 1200, peakHour: 280, source: "оценка по микрорайону" },
    },
  },
  // === 20. Бостандыкский — ресторан на Навои ===
  {
    id: 20,
    district: "Бостандыкский",
    propertyType: "Общепит",
    address: "пр. Абая — Навои, ЖК Highvill",
    lat: 43.2310,
    lng: 76.8900,
    area: 220,
    price: 3300000,
    m2: 15000,
    floor: 1,
    ceilings: 4.2,
    condition: "Свежий ремонт",
    entrance: "Отдельный, с улицы",
    features: ["свет", "вода", "канализация", "отопление", "вентиляция", "кондиционер", "газ"],
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=350&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=350&fit=crop&q=80",
    ],
    source: "krisha.kz #13267890",
    radius: {
      direct: [
        { name: "Бочка", dist: 300, rating: 4.5, check: 5000, reviews: 1890 },
        { name: "Гриль Хаус", dist: 450, rating: 4.2, check: 4500, reviews: 780 },
      ],
      indirect: [
        { name: "URBO Coffee", dist: 200, type: "кофейня", rating: 4.5, branches: 40 },
        { name: "Дастархан", dist: 350, type: "столовая", rating: 3.9 },
      ],
      synergy: [
        { name: "ЖК Highvill", dist: 0, type: "жилой комплекс", people: "~2 000 квартир" },
        { name: "ТРЦ MEGA", dist: 1200, type: "ТЦ", people: "~40 000/день" },
        { name: "Фитнес Sport Club", dist: 400, type: "фитнес", people: "~600 членов" },
      ],
      gov: [
        { name: "ЦОН Бостандыкского р-на", dist: 1600, type: "ЦОН" },
      ],
      transport: [
        { name: "ост. Абая — Навои", dist: 80, routes: ["37", "63", "95"] },
        { name: "ост. Навои", dist: 200, routes: ["38", "44"] },
      ],
      housing: {
        buildings: 35, apartments: 3200, totalAreaM2: 256000,
        estPopulation: Math.round(256000 / SQ_M_PER_PERSON),
        avgApartmentM2: 80, radius: 1000,
      },
      pedestrian: { weekday: 9800, weekend: 6500, peakHour: 1500, source: "оценка по ЖК" },
    },
  },
];
