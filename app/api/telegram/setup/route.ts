import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return Response.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const webhookUrl = `${proto}://${host}/api/telegram/webhook`;
  const webappUrl = process.env.WEBAPP_URL || `${proto}://${host}`;

  // 1. Установка webhook
  const webhookResp = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  const webhookResult = await webhookResp.json();

  // 2. Установка Menu Button (кнопка Mini App в чате)
  const menuResp = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "Открыть",
        web_app: { url: webappUrl },
      },
    }),
  });
  const menuResult = await menuResp.json();

  return Response.json({ webhookUrl, webappUrl, webhook: webhookResult, menuButton: menuResult });
}
