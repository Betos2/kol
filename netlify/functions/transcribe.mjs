// Netlify Serverless Function: /api/transcribe
// Required Netlify Environment Variable: OPENAI_API_KEY

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed. Use POST." }, { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Missing OPENAI_API_KEY environment variable in Netlify. Add it under Site configuration -> Environment variables and redeploy.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { audioBase64, fileName = "audio.wav", mimeType = "audio/wav", language = "he" } = body || {};

    if (!audioBase64) {
      return Response.json({ error: "Missing audioBase64 payload." }, { status: 400 });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const audioBlob = new Blob([audioBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", audioBlob, fileName);
    formData.append("model", "whisper-1");
    if (language && language !== "auto") {
      formData.append("language", language);
    }
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities[]", "segment");

    const openAiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const data = await openAiRes.json();

    if (!openAiRes.ok) {
      return Response.json(
        { error: data?.error?.message || "OpenAI Whisper transcription failed." },
        { status: openAiRes.status }
      );
    }

    const cues = Array.isArray(data.segments) && data.segments.length > 0
      ? data.segments.map((seg) => ({
          start: Number(seg.start ?? 0),
          end: Number(seg.end ?? (seg.start ?? 0) + 2),
          text: String(seg.text || "").trim(),
        })).filter((c) => c.text.length > 0)
      : data.text
      ? [{ start: 0, end: Number(data.duration || 5), text: String(data.text).trim() }]
      : [];

    return Response.json(
      { cues, text: data.text || "", language: data.language || language },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    return Response.json(
      { error: err?.message || "Unexpected server error during transcription." },
      { status: 500 }
    );
  }
};
