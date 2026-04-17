import type { Niche } from "./types";

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
