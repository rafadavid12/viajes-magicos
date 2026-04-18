import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con tu llave secreta sin espacios
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string).trim(), {
  // @ts-expect-error - Next.js permite esto en lugar de ignore
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    // 1. Recibimos los datos
    const body = await request.json();

    // 2. Creamos la sesión en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Paquete: ${body.nombreDestino}`,
              description: `Viaje Mágico para ${body.totalPersonas} personas.`,
            },
            unit_amount: body.granTotal * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&destino=${body.nombreDestino}&total=${body.granTotal}`,
      cancel_url: `${request.headers.get("origin")}/destino/${body.idDestino}`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    // Quitamos el ": any" de arriba y le damos formato seguro aquí abajo
    console.error("Error en Stripe:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}