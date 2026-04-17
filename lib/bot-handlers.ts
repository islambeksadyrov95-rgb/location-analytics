import type { TelegramUpdate } from "./telegram";
import * as tg from "./telegram";
import { getListingById, getAnalysis, searchListings } from "./analysis";
import { computeBasicScore, computeFullScore, fmtN } from "./scoring";
import { generateReport } from "./report";
import type { Listing } from "./types";

// Сокращения районов для callback_data (лимит 64 байта)
const DISTRICT_SHORT: Record<string, string> = {
  med: "Медеуский",
  bos: "Бостандыкский",
  alm: "Алмалинский",
  aue: "Ауэзовский",
  alt: "Алатауский",
  nau: "Наурызбайский",
  tur: "Турксибский",
  zhe: "Жетысуский",
  all: "Все",
};

const DISTRICT_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(DISTRICT_SHORT).map(([k, v]) => [v, k])
);

const NICHE_LABELS: Record<string, string> = {
  coffee: "Кофейня", doner: "Донерная", restaurant: "Ресторан",
  bakery: "Пекарня", pizza: "Пиццерия", burger: "Бургерная",
  sushi: "Суши-бар", canteen: "Столовая", bar: "Бар", confectionery: "Кондитерская",
  barbershop: "Барбершоп", beauty_salon: "Салон красоты", nails: "Маникюр", cosmetology: "Косметология",
  dental: "Стоматология", pharmacy: "Аптека", med_center: "Мед. центр",
  grocery: "Продукты", clothing: "Одежда", flowers: "Цветы", pet_shop: "Зоомагазин",
  car_wash: "Автомойка", dry_cleaning: "Химчистка", photo_studio: "Фотостудия",
  gym: "Фитнес-зал", yoga: "Йога-студия",
  kids_center: "Детский центр", kindergarten: "Детский сад",
};

const BUDGET_OPTIONS = [
  { label: "До 300к", value: 300 },
  { label: "300к — 500к", value: 500 },
  { label: "500к — 1 млн", value: 1000 },
  { label: "Любой", value: 99000 },
];

export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  try {
    if (update.message?.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id;

      if (text === "/start" || text === "/help") {
        await handleStart(chatId);
      } else {
        await tg.sendMessage(chatId, "Используйте /start для начала поиска.");
      }
      return;
    }

    if (update.callback_query) {
      const { id, data } = update.callback_query;
      const chatId = update.callback_query.message.chat.id;
      const msgId = update.callback_query.message.message_id;

      await tg.answerCallbackQuery(id);
      await handleCallback(chatId, msgId, data);
    }
  } catch (error) {
    console.error("Bot handler error:", error);
    const chatId =
      update.message?.chat.id || update.callback_query?.message.chat.id;
    if (chatId) {
      await tg.sendMessage(chatId, "Произошла ошибка. Попробуйте /start");
    }
  }
}

async function handleStart(chatId: number) {
  const webappUrl = process.env.WEBAPP_URL || "https://location-analytics.vercel.app";

  await tg.sendMessage(
    chatId,
    "<b>Location Intelligence Pro</b>\n\n" +
    "Геоаналитика для выбора локации бизнеса в Алматы.\n\n" +
    "28+ ниш: общепит, красота, медицина, торговля, услуги и другие.\n\n" +
    "Нажмите кнопку ниже, чтобы открыть приложение:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Открыть приложение", web_app: { url: webappUrl } }],
        ],
      },
    }
  );
}

async function handleCallback(chatId: number, msgId: number, data: string) {
  const parts = data.split(":");

  switch (parts[0]) {
    case "n":
      await handleNiche(chatId, msgId, parts[1]);
      break;
    case "d":
      await handleDistrict(chatId, msgId, parts[1], parts[2]);
      break;
    case "b":
      await handleBudget(chatId, msgId, parts[1], parts[2], Number(parts[3]));
      break;
    case "r":
      await handleReport(chatId, Number(parts[1]), parts[2]);
      break;
    case "p":
      await handlePage(chatId, parts[1], parts[2], Number(parts[3]), Number(parts[4]));
      break;
    case "bk":
      if (parts[1] === "n") await handleStart(chatId);
      break;
  }
}

async function handleNiche(chatId: number, msgId: number, niche: string) {
  const districts = Object.entries(DISTRICT_SHORT);
  const buttons: tg.InlineKeyboardButton[][] = [];

  // По 2 района в ряд
  for (let i = 0; i < districts.length; i += 2) {
    const row: tg.InlineKeyboardButton[] = [];
    row.push({
      text: districts[i][1],
      callback_data: `d:${niche}:${districts[i][0]}`,
    });
    if (districts[i + 1]) {
      row.push({
        text: districts[i + 1][1],
        callback_data: `d:${niche}:${districts[i + 1][0]}`,
      });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "< Назад", callback_data: "bk:n" }]);

  await tg.editMessageText(
    chatId,
    msgId,
    `<b>${NICHE_LABELS[niche]}</b>\n\nВыберите район:`,
    { reply_markup: { inline_keyboard: buttons } }
  );
}

async function handleDistrict(
  chatId: number,
  msgId: number,
  niche: string,
  distShort: string
) {
  const buttons = BUDGET_OPTIONS.map((opt) => ({
    text: opt.label,
    callback_data: `b:${niche}:${distShort}:${opt.value}`,
  }));

  const distName = DISTRICT_SHORT[distShort] || "Все";

  await tg.editMessageText(
    chatId,
    msgId,
    `<b>${NICHE_LABELS[niche]}</b> / ${distName}\n\nВыберите бюджет (аренда/мес):`,
    {
      reply_markup: {
        inline_keyboard: [
          buttons.slice(0, 2),
          buttons.slice(2, 4),
          [{ text: "< Назад", callback_data: `n:${niche}` }],
        ],
      },
    }
  );
}

async function handleBudget(
  chatId: number,
  msgId: number,
  niche: string,
  distShort: string,
  budgetK: number
) {
  const district = DISTRICT_SHORT[distShort] || "Все";
  const budget = budgetK * 1000;

  // Удаляем старое сообщение — будем слать новые
  await tg.editMessageText(chatId, msgId, "Ищу помещения...");

  const listings = await searchListings({ district, budget, limit: 50 });

  if (listings.length === 0) {
    await tg.sendMessage(
      chatId,
      "Помещений не найдено. Попробуйте другие фильтры.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Начать заново", callback_data: "bk:n" }]],
        },
      }
    );
    return;
  }

  // Сортируем по скорингу
  const sorted = listings
    .map((l) => ({ ...l, score: computeBasicScore(l) }))
    .sort((a, b) => b.score - a.score);

  // Показываем первые 5
  const page = 0;
  await sendListingsPage(chatId, sorted, niche, distShort, budgetK, page);
}

async function handlePage(
  chatId: number,
  niche: string,
  distShort: string,
  budgetK: number,
  page: number
) {
  const district = DISTRICT_SHORT[distShort] || "Все";
  const budget = budgetK * 1000;

  const listings = await searchListings({ district, budget, limit: 50 });
  const sorted = listings
    .map((l) => ({ ...l, score: computeBasicScore(l) }))
    .sort((a, b) => b.score - a.score);

  await sendListingsPage(chatId, sorted, niche, distShort, budgetK, page);
}

async function sendListingsPage(
  chatId: number,
  sorted: (Listing & { score: number })[],
  niche: string,
  distShort: string,
  budgetK: number,
  page: number
) {
  const perPage = 5;
  const start = page * perPage;
  const pageItems = sorted.slice(start, start + perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  if (pageItems.length === 0) {
    await tg.sendMessage(chatId, "Больше помещений нет.", {
      reply_markup: {
        inline_keyboard: [[{ text: "Начать заново", callback_data: "bk:n" }]],
      },
    });
    return;
  }

  const distName = DISTRICT_SHORT[distShort] || "Все";
  const header = `<b>Результаты</b>: ${NICHE_LABELS[niche]} / ${distName}\nНайдено: ${sorted.length} | Стр. ${page + 1}/${totalPages}\n`;
  await tg.sendMessage(chatId, header);

  for (const listing of pageItems) {
    const scoreEmoji =
      listing.score >= 75 ? "🟢" : listing.score >= 50 ? "🟡" : listing.score >= 30 ? "🟠" : "🔴";

    const caption =
      `${scoreEmoji} <b>${listing.score}/100</b>\n` +
      `${listing.address}\n` +
      `${listing.district} | ${listing.area} м² | Этаж ${listing.floor}\n` +
      `<b>${fmtN(listing.price)} ₸/мес</b> (${fmtN(listing.m2)} ₸/м²)\n` +
      `${listing.condition} | ${listing.entrance}`;

    const buttons: tg.InlineKeyboardButton[][] = [
      [
        { text: "Подробный отчёт", callback_data: `r:${listing.id}:${niche}` },
        { text: "На Крыше", url: listing.sourceUrl },
      ],
    ];

    if (listing.photos.length > 0) {
      await tg.sendPhoto(chatId, listing.photos[0], {
        caption,
        reply_markup: { inline_keyboard: buttons },
      });
    } else {
      await tg.sendMessage(chatId, caption, {
        reply_markup: { inline_keyboard: buttons },
      });
    }
  }

  // Навигация по страницам
  const navButtons: tg.InlineKeyboardButton[] = [];
  if (page > 0) {
    navButtons.push({
      text: "< Назад",
      callback_data: `p:${niche}:${distShort}:${budgetK}:${page - 1}`,
    });
  }
  if (start + perPage < sorted.length) {
    navButtons.push({
      text: "Далее >",
      callback_data: `p:${niche}:${distShort}:${budgetK}:${page + 1}`,
    });
  }
  navButtons.push({ text: "Новый поиск", callback_data: "bk:n" });

  if (navButtons.length > 0) {
    await tg.sendMessage(chatId, "—", {
      reply_markup: { inline_keyboard: [navButtons] },
    });
  }
}

async function handleReport(chatId: number, listingId: number, niche: string) {
  await tg.sendMessage(chatId, "Генерирую отчёт...");

  const listing = await getListingById(listingId);
  if (!listing) {
    await tg.sendMessage(chatId, "Помещение не найдено.");
    return;
  }

  const analysis = await getAnalysis(listing.lat, listing.lng, niche);
  const score = computeFullScore(listing, analysis);

  const scoreEmoji =
    score >= 75 ? "🟢" : score >= 50 ? "🟡" : score >= 30 ? "🟠" : "🔴";
  const scoreLabel =
    score >= 75 ? "Отличная" : score >= 50 ? "Хорошая" : score >= 30 ? "Средняя" : "Слабая";

  // Текстовое саммари
  const summary =
    `${scoreEmoji} <b>Скоринг: ${score}/100 — ${scoreLabel} локация</b>\n\n` +
    `<b>${listing.address}</b>\n` +
    `${listing.district} | ${listing.area} м² | ${fmtN(listing.price)} ₸/мес\n\n` +
    `Прямые конкуренты: ${analysis.direct.length}\n` +
    `Косвенные конкуренты: ${analysis.indirect.length}\n` +
    `Синергия (БЦ, ТЦ, вузы): ${analysis.synergy.length}\n` +
    `Транспорт (остановки): ${analysis.transport.length}\n` +
    `Население в радиусе: ~${fmtN(analysis.housing.estPopulation)} чел.\n` +
    `Пешеходный трафик: ~${fmtN(analysis.pedestrian.weekday)}/день`;

  await tg.sendMessage(chatId, summary);

  // HTML-отчёт файлом
  const html = generateReport(listing, niche, analysis);
  const filename = `report-${listing.district}-${listing.area}m2-${listing.id}.html`;
  await tg.sendDocument(chatId, html, filename, "Полный отчёт");
}
