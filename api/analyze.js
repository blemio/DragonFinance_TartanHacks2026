import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { purchase, context, justification } = req.body || {};

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Return JSON only with keys:
verdict ("GOOD"|"OKAY"|"BAD"),
needsJustification (boolean),
reason (string),
xpDelta (number),
followupQuestion (string|null).

Purchase: ${JSON.stringify(purchase)}
Context: ${JSON.stringify(context)}
Justification: ${justification ?? ""}
`;

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = out.choices?.[0]?.message?.content || "{}";
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
