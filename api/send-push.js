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

    const cleanAppId = appId.trim();
    // Clean key: strip quotes, whitespace, and any leading 'Key ', 'Bearer ', or 'Basic ' prefix
    let cleanKey = restApiKey.trim().replace(/^["']|["']$/g, "").trim();
    cleanKey = cleanKey.replace(/^(?:Key|Bearer|Basic)\s+/i, "").trim();

    // Check if the user accidentally pasted the App ID into the REST API Key field
    if (cleanAppId.toLowerCase() === cleanKey.toLowerCase()) {
      return res.status(400).json({
        error: "Your REST API Key is identical to your App ID. In your OneSignal Dashboard, go to Settings (gear icon) > Keys & IDs and copy your 'App API Key' (REST API Key), not the App ID."
      });
    }

    const payload = {
      app_id: cleanAppId,
      headings: { en: "Exam Committee: " + (title || "Announcement").trim() },
      contents: { en: (message || "New announcement posted").trim().substring(0, 180) },
      url: "https://hlconline.vercel.app/index.html",
      chrome_web_icon: "https://hlconline.vercel.app/favicon.png",
      chrome_web_badge: "https://hlconline.vercel.app/favicon.png"
    };

    if (target === "subject" && targetSubject) {
      payload.filters = [
        { field: "tag", key: "subject", relation: "=", value: targetSubject.trim() }
      ];
    } else {
      payload.included_segments = ["Total Subscriptions"];
    }

    // Try authorization formats in priority order:
    // 1. "Key <token>" (OneSignal standard for all App API keys)
    // 2. "Basic <token>" (Legacy keys)
    // 3. "Bearer <token>"
    const authHeaders = [
      `Key ${cleanKey}`,
      `Basic ${cleanKey}`,
      `Bearer ${cleanKey}`
    ];

    let lastError = null;
    let lastData = null;
    let lastStatus = 401;

    for (const authHeader of authHeaders) {
      try {
        const response = await fetch("https://api.onesignal.com/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          return res.status(200).json({
            success: true,
            recipients: data?.recipients || 0,
            id: data?.id || ""
          });
        }

        lastStatus = response.status;
        lastData = data;
        lastError = data?.errors?.[0] || data?.error || `OneSignal Error ${response.status}`;

        // If error is not authentication-related (e.g. 400 bad payload), do not retry other auth headers
        if (response.status !== 401 && response.status !== 403) {
          break;
        }
      } catch (reqErr) {
        lastError = reqErr.message;
      }
    }

    // If still 401/403 after trying all auth formats, provide a descriptive helpful message
    if (lastStatus === 401 || lastStatus === 403) {
      return res.status(lastStatus).json({
        error: "OneSignal Authentication Failed (401 Unauthorized): Access denied. Please ensure you are copying the 'App API Key' (REST API Key) from OneSignal Dashboard > Settings (gear icon) > Keys & IDs, and NOT the App ID or User Auth Key.",
        details: lastData
      });
    }

    return res.status(lastStatus).json({ error: lastError, details: lastData });
  } catch (err) {
    console.error("send-push error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
