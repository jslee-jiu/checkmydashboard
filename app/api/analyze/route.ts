import OpenAI from "openai";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Allow": "POST, OPTIONS, GET",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, route: "/api/analyze" }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    // require login
    const session = await getSessionUser();
    if (!session) return json(401, { error: "Unauthorized" });

    const body = await req.json().catch(() => null);
    if (!body) return json(400, { error: "Invalid JSON body" });

    const imageDataUrl: string = body.imageDataUrl ?? "";
    const carQuery: string = (body.carQuery ?? body.carModel ?? "").trim();
    const lang: "en" | "ko" = body.lang === "ko" ? "ko" : "en";

    if (!imageDataUrl) return json(400, { error: "imageDataUrl required" });
    if (imageDataUrl.length > 2_000_000) {
      return json(413, { error: "Image too large. Please upload a smaller image." });
    }

    if (!process.env.OPENAI_API_KEY) return json(500, { error: "OPENAI_API_KEY missing" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const concise = lang === "en"
      ? "Answer concisely. Use short bullet points. Avoid repetition.\n\n"
      : "최대한 간결하게 bullet로 답하세요. 반복을 피하세요.\n\n";

    const carText = carQuery || "unknown car";

    const instruction = lang === "en"
      ? `Car: ${carText}
Analyze the dashboard image and provide:
- Current status (speed/fuel/coolant temp/battery/warning lights present)
- Each visible warning light: meaning & immediate action
- If service is needed: risk level (low/medium/high) and recommended actions
- 3-line summary
Respond in English.`
      : `차량: ${carText}
계기판 이미지를 분석하여 아래를 제공하세요:
- 현재 상태(속도/연료/냉각수 온도/배터리/경고등 존재 여부)
- 보이는 경고등: 의미와 즉시 취할 조치
- 정비 필요 시 위험도(낮음/보통/높음)와 권장 행동
- 3줄 요약
응답은 한국어로.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      role: "user",
      content: [
        { type: "text", text: concise + instruction },
        { type: "image_url", image_url: { url: imageDataUrl } }
      ]
    }];

    const completion = await client.chat.completions.create({
      model, messages, temperature: 0.2, stream: true, max_tokens: 400
    });

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`[model=${model} lang=${lang}] connecting...\n`));
        try {
          for await (const chunk of completion as any) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (typeof delta === "string") controller.enqueue(enc.encode(delta));
          }
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e: any) {
    return json(500, { error: e?.message || "analysis error" });
  }
}
