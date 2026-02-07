import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "analyze endpoint alive. Send POST JSON to use it.",
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Missing OPENAI_API_KEY",
      });
    }

    const { purchase, context, justification, meta } = req.body || {};

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Return JSON only with keys:
verdict ("GOOD"|"OKAY"|"BAD"),
needsJustification (boolean),
reason (string),
xpDelta (number),
followupQuestion (string|null),
interventionQuestion (string|null).

RULES:
- If purchase.necessary is false, needsJustification MUST be false and followupQuestion MUST be null.
- Only set needsJustification true when purchase.necessary is true AND verdict is "BAD" or "OKAY".
- interventionQuestion is OPTIONAL. If meta.interventionCandidate is true, you may provide a short question that asks the user to reflect.

Purchase: ${JSON.stringify(purchase)}
Context: ${JSON.stringify(context)}
Justification: ${justification ?? ""}
Meta: ${JSON.stringify(meta ?? {})}
`;

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = out.choices?.[0]?.message?.content || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    // --- Safe defaults so frontend never explodes ---
    const verdict =
      parsed.verdict === "GOOD" || parsed.verdict === "OKAY" || parsed.verdict === "BAD"
        ? parsed.verdict
        : "OKAY";

    let needsJustification = Boolean(parsed.needsJustification);
    let followupQuestion = parsed.followupQuestion ?? null;

    // Hard rule: if user said it wasn't necessary, do NOT ask justification
    if (purchase?.necessary === false) {
      needsJustification = false;
      followupQuestion = null;
    }

    const reason = typeof parsed.reason === "string" ? parsed.reason : "No reason provided.";
    const xpDelta = typeof parsed.xpDelta === "number" ? parsed.xpDelta : 0;

    const interventionQuestion =
      typeof parsed.interventionQuestion === "string" ? parsed.interventionQuestion : null;

    return res.status(200).json({
      verdict,
      needsJustification,
      reason,
      xpDelta,
      followupQuestion,
      interventionQuestion,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
