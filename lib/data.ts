import type { Niche, NicheCategory } from "./types";

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
  // Общепит
  { id: "coffee", label: "Кофейня", icon: "☕", category: "food", directRubric: "Кофейни, Кафе-кондитерские", indirectRubric: "Пекарни, Чайные" },
  { id: "doner", label: "Донерная", icon: "🌯", category: "food", directRubric: "Быстрое питание, Столовые", indirectRubric: "Пиццерии, Бургерные" },
  { id: "restaurant", label: "Ресторан", icon: "🍽️", category: "food", directRubric: "Рестораны, Бары", indirectRubric: "Кафе, Банкетные залы" },
  { id: "bakery", label: "Пекарня", icon: "🥐", category: "food", directRubric: "Пекарни, Кондитерские", indirectRubric: "Кофейни, Кафе" },
  { id: "pizza", label: "Пиццерия", icon: "🍕", category: "food", directRubric: "Пиццерии", indirectRubric: "Быстрое питание, Бургерные" },
  { id: "burger", label: "Бургерная", icon: "🍔", category: "food", directRubric: "Бургерные", indirectRubric: "Быстрое питание, Пиццерии" },
  { id: "sushi", label: "Суши-бар", icon: "🍣", category: "food", directRubric: "Суши-бары, Японская кухня", indirectRubric: "Рестораны, Кафе" },
  { id: "canteen", label: "Столовая", icon: "🍲", category: "food", directRubric: "Столовые", indirectRubric: "Кафе, Быстрое питание" },
  { id: "bar", label: "Бар", icon: "🍺", category: "food", directRubric: "Бары, Пабы", indirectRubric: "Рестораны, Караоке" },
  { id: "confectionery", label: "Кондитерская", icon: "🎂", category: "food", directRubric: "Кондитерские, Кафе-кондитерские", indirectRubric: "Пекарни, Кофейни" },

  // Красота
  { id: "barbershop", label: "Барбершоп", icon: "💈", category: "beauty", directRubric: "Барбершопы, Парикмахерские", indirectRubric: "Салоны красоты" },
  { id: "beauty_salon", label: "Салон красоты", icon: "💇", category: "beauty", directRubric: "Салоны красоты, Парикмахерские", indirectRubric: "Косметология, Маникюр" },
  { id: "nails", label: "Маникюр", icon: "💅", category: "beauty", directRubric: "Маникюр, Педикюр, Ногтевые студии", indirectRubric: "Салоны красоты" },
  { id: "cosmetology", label: "Косметология", icon: "✨", category: "beauty", directRubric: "Косметология, Косметологические клиники", indirectRubric: "Салоны красоты, СПА" },

  // Медицина
  { id: "dental", label: "Стоматология", icon: "🦷", category: "medical", directRubric: "Стоматологии, Стоматологические клиники", indirectRubric: "Медицинские центры" },
  { id: "pharmacy", label: "Аптека", icon: "💊", category: "medical", directRubric: "Аптеки", indirectRubric: "Медицинские центры, Оптики" },
  { id: "med_center", label: "Мед. центр", icon: "🏥", category: "medical", directRubric: "Медицинские центры, Поликлиники", indirectRubric: "Стоматологии, Лаборатории" },

  // Торговля
  { id: "grocery", label: "Продукты", icon: "🛒", category: "retail", directRubric: "Продуктовые магазины, Супермаркеты", indirectRubric: "Минимаркеты" },
  { id: "clothing", label: "Одежда", icon: "👗", category: "retail", directRubric: "Магазины одежды", indirectRubric: "Обувные магазины, Бутики" },
  { id: "flowers", label: "Цветы", icon: "💐", category: "retail", directRubric: "Цветочные магазины", indirectRubric: "Подарки, Сувениры" },
  { id: "pet_shop", label: "Зоомагазин", icon: "🐾", category: "retail", directRubric: "Зоомагазины", indirectRubric: "Ветеринарные клиники" },

  // Услуги
  { id: "car_wash", label: "Автомойка", icon: "🚗", category: "services", directRubric: "Автомойки", indirectRubric: "Автосервисы, Шиномонтажи" },
  { id: "dry_cleaning", label: "Химчистка", icon: "👔", category: "services", directRubric: "Химчистки, Прачечные", indirectRubric: "Ателье" },
  { id: "photo_studio", label: "Фотостудия", icon: "📷", category: "services", directRubric: "Фотостудии", indirectRubric: "Фотоуслуги, Типографии" },

  // Спорт
  { id: "gym", label: "Фитнес-зал", icon: "🏋️", category: "sport", directRubric: "Фитнес-клубы, Тренажёрные залы", indirectRubric: "Йога-студии, Бассейны" },
  { id: "yoga", label: "Йога-студия", icon: "🧘", category: "sport", directRubric: "Йога-студии", indirectRubric: "Фитнес-клубы, Танцевальные студии" },

  // Дети
  { id: "kids_center", label: "Детский центр", icon: "🧒", category: "kids", directRubric: "Детские развивающие центры", indirectRubric: "Детские сады, Игровые комнаты" },
  { id: "kindergarten", label: "Детский сад", icon: "🏫", category: "kids", directRubric: "Детские сады", indirectRubric: "Детские развивающие центры" },
];

export const NICHE_CATEGORIES: NicheCategory[] = [
  { id: "food", label: "Общепит", icon: "🍽️" },
  { id: "beauty", label: "Красота", icon: "💈" },
  { id: "medical", label: "Медицина", icon: "🏥" },
  { id: "retail", label: "Торговля", icon: "🛒" },
  { id: "services", label: "Услуги", icon: "🔧" },
  { id: "sport", label: "Спорт", icon: "🏋️" },
  { id: "kids", label: "Дети", icon: "🧒" },
];
