// ══════════════════════════════════════════════════════════════════════════════
// Vercel Serverless Function: OneSignal Push Notification Dispatcher
// Proxies server-to-server push notifications to bypass browser CORS & hide keys
// ══════════════════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS Headers allowing local testing and live portal
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { appId, restApiKey, title, message, target, targetSubject } = body;

    if (!appId || !restApiKey) {
      return res.status(400).json({ error: "Missing OneSignal App ID or REST API Key" });
    }

    const payload = {
      app_id: appId.trim(),
      headings: { en: "Exam Committee: " + (title || "Announcement").trim() },
      contents: { en: (message || "New announcement posted").trim().substring(0, 180) },
      url: "https://portal-honeylandschools.vercel.app/index.html",
      chrome_web_icon: "https://portal-honeylandschools.vercel.app/favicon.png",
      chrome_web_badge: "https://portal-honeylandschools.vercel.app/favicon.png"
    };

    if (target === "subject" && targetSubject) {
      payload.filters = [
        { field: "tag", key: "subject", relation: "=", value: targetSubject.trim() }
      ];
    } else {
      payload.included_segments = ["Total Subscriptions"];
    }

    const cleanKey = restApiKey.trim();
    // OneSignal accepts "Key <token>" for modern keys or "Basic <token>" for standard keys
    let authHeader = cleanKey.startsWith("os_v2_") ? `Key ${cleanKey}` : `Basic ${cleanKey}`;

    let response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(payload)
    });

    let data = await response.json();

    // If 401 Unauthorized, automatically retry with alternate auth scheme
    if (!response.ok && response.status === 401) {
      const altHeader = authHeader.startsWith("Key ") ? `Basic ${cleanKey}` : `Key ${cleanKey}`;
      response = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": altHeader
        },
        body: JSON.stringify(payload)
      });
      data = await response.json();
    }

    if (!response.ok) {
      const errMsg = data?.errors?.[0] || data?.error || `OneSignal Error ${response.status}`;
      return res.status(response.status).json({ error: errMsg, details: data });
    }

    return res.status(200).json({
      success: true,
      recipients: data?.recipients || 0,
      id: data?.id || ""
    });
  } catch (err) {
    console.error("send-push error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
