export default async function handler(req, res) {
  try {
    // Allow a GET visit in the browser without crashing
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "analyze endpoint alive. Send POST JSON to use it.",
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    // Echo back the body so we can confirm requests work
    return res.status(200).json({
      ok: true,
      received: req.body ?? null,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
