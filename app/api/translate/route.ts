import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    if (text.length > 3000) {
      return NextResponse.json({ error: "Metin çok uzun" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Bu edebi pasajı İngilizce'den Türkçe'ye çevir. Yazarın üslubunu ve dönemin edebi tonunu koru. Sadece çeviriyi yaz, başka hiçbir şey ekleme:\n\n${text}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") {
      throw new Error("Beklenmeyen API yanıtı");
    }

    return NextResponse.json({ translated: block.text });
  } catch (err) {
    console.error("Çeviri hatası:", err);
    return NextResponse.json({ error: "Çeviri yapılamadı" }, { status: 500 });
  }
}
