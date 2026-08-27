const NVIDIA_KEY = "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";
const MODEL_NAME = "nvidia/nemotron-3.5-lightning-30b-a3b";

export async function onRequestPost(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    const { query, history, telemetry } = body;

    const systemPrompt = `You are ThermalGuard AI Incident Commander — an elite spaceborne thermal intelligence and disaster operations AI for SIH Problem Statement 26162.
You have direct real-time access to NASA FIRMS satellite telemetry, live Render ML predictions, and Indian industrial/ecological GIS registers.

Live Database Snapshot:
${JSON.stringify(telemetry || {}, null, 2)}

Instructions:
1. Answer the operator's query directly and authoritatively in English, or in Hindi if asked in Hindi/Hinglish.
2. If asked about a specific plant, date, or region, analyze the real data from the snapshot (e.g., Bhilai Steel, Panipat Refinery, Hazira LNG, Punjab stubble, Corbett forest).
3. Structure your response with crisp markdown:
   - 🛰️ **Satellite Observation**: (FRP in MW, Satellite pass, Proximity)
   - 🔍 **ML Classification Context**: (Why Render FastAPI model flagged it)
   - 📋 **Operational Directive**: (Action for SPCB / Fire Services / Plant Management)
4. At the very end of your response, ALWAYS append this exact JSON block:
<<<METADATA>>>
{
  "flyTo": { "latitude": 21.1118, "longitude": 72.6582, "zoom": 11, "label": "Hazira LNG" },
  "filterTag": "Industrial-Alert",
  "action": "Dispatch SPCB regional inspection team."
}
<<<END_METADATA>>>
(If no specific location is discussed, set "flyTo": null).`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: query },
    ];

    const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!nvidiaRes.ok) {
      const err = await nvidiaRes.text();
      return new Response(JSON.stringify({ error: err }), {
        status: nvidiaRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data: any = await nvidiaRes.json();
    const rawContent = data?.choices?.[0]?.message?.content || "";

    // Parse Metadata Block
    let answerText = rawContent;
    let metadata: any = {};

    if (rawContent.includes("<<<METADATA>>>")) {
      const parts = rawContent.split("<<<METADATA>>>");
      answerText = parts[0].trim();
      const metaStr = (parts[1] || "").replace("<<<END_METADATA>>>", "").trim();
      try {
        metadata = JSON.parse(metaStr);
      } catch (e) {
        console.warn("Metadata parse error", e);
      }
    }

    // Clean thinking artifacts
    if (answerText.includes("Here's a thinking process:")) {
      const cleanParts = answerText.split(/Here's a thinking process:[\s\S]*?\n\n/);
      if (cleanParts.length > 1 && cleanParts[1].trim()) {
        answerText = cleanParts[1].trim();
      }
    }

    return new Response(JSON.stringify({
      answer: answerText,
      flyTo: metadata?.flyTo || null,
      filterTag: metadata?.filterTag || "All",
      recommendedAction: metadata?.action || "Monitor active FIRMS telemetry queue.",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
