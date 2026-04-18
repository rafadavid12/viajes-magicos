import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con tu llave secreta (Asegúrate de que el nombre coincida con tu .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    // 1. Recibimos los datos que nos manda tu página de React
    const body = await request.json();

    // 2. Le pedimos a Stripe que cree una "sesión de pago"
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn", // Moneda: Pesos Mexicanos
            product_data: {
              name: `Paquete: ${body.nombreDestino}`,
              description: `Viaje Mágico para ${body.totalPersonas} personas.`,
            },
            // Stripe maneja centavos, así que multiplicamos tu total por 100
            unit_amount: body.granTotal * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // 3. ¿A dónde lo mandamos si paga con éxito o si cancela?
      // Usamos el header "origin" para que funcione en localhost y en Vercel
      success_url: `${request.headers.get("origin")}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&destino=${body.nombreDestino}&total=${body.granTotal}`,
      cancel_url: `${request.headers.get("origin")}/destino/${body.idDestino}`,
    });

    // 4. Le devolvemos a React la URL segura de Stripe
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}