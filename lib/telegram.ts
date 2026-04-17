// Telegram Bot API wrapper — без внешних зависимостей

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface TelegramMessage {
  message_id: number;
  from: { id: number; first_name: string };
  chat: { id: number; type: string };
  text?: string;
}

export interface CallbackQuery {
  id: string;
  from: { id: number; first_name: string };
  message: { message_id: number; chat: { id: number } };
  data: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: CallbackQuery;
}

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

async function callApi(method: string, body: Record<string, unknown>): Promise<unknown> {
  const resp = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Telegram API error [${method}]:`, resp.status, text);
  }
  return resp.json();
}

export async function sendMessage(
  chatId: number,
  text: string,
  opts?: { parse_mode?: string; reply_markup?: InlineKeyboardMarkup }
) {
  return callApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: opts?.parse_mode || "HTML",
    ...(opts?.reply_markup && { reply_markup: opts.reply_markup }),
  });
}

export async function sendPhoto(
  chatId: number,
  photo: string,
  opts?: { caption?: string; parse_mode?: string; reply_markup?: InlineKeyboardMarkup }
) {
  return callApi("sendPhoto", {
    chat_id: chatId,
    photo,
    caption: opts?.caption || "",
    parse_mode: opts?.parse_mode || "HTML",
    ...(opts?.reply_markup && { reply_markup: opts.reply_markup }),
  });
}

export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  opts?: { parse_mode?: string; reply_markup?: InlineKeyboardMarkup }
) {
  return callApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: opts?.parse_mode || "HTML",
    ...(opts?.reply_markup && { reply_markup: opts.reply_markup }),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return callApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text && { text }),
  });
}

export async function sendDocument(
  chatId: number,
  content: string,
  filename: string,
  caption?: string
) {
  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  formData.append("document", new Blob([content], { type: "text/html" }), filename);
  if (caption) formData.append("caption", caption);
  formData.append("parse_mode", "HTML");

  const resp = await fetch(apiUrl("sendDocument"), {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error("Telegram sendDocument error:", resp.status, text);
  }
}
