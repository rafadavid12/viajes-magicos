import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const mensajesFormateados = messages.map((m: any) => ({
      role: m.role,
      content: m.content || (m.parts && m.parts[0]?.text) || "Mensaje vacío"
    }));

    const result = await generateText({
      // 🚀 Volvemos al que SÍ encuentra, pero con LLAVE NUEVA
      model: google('gemini-2.5-flash'), 
      
      system: `Eres un asistente virtual experto de la agencia "Viajes Mágicos by DevSquad". Tu misión es recomendar los Pueblos Mágicos del Estado de México. 
      REGLAS:
      1. Sé amable, usa emojis y mantén respuestas muy cortas.
      2. NO uses asteriscos ni Markdown. Solo texto plano.
      3. Si quieren reservar, diles que cierren el chat y usen el botón 'VER PAQUETE'.`,
      
      messages: mensajesFormateados,
    });

    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (err) {
    console.error("🔴 ERROR CRÍTICO:", err);
    return new Response(JSON.stringify({ error: "Estamos ajustando los motores, intenta en un minuto." }), { status: 500 });
  }
}