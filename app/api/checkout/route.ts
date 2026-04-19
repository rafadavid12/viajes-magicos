import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string).trim(), {
  // @ts-expect-error - Next.js permite esto en lugar de ignore
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      // ¡NUEVO! Guardamos TODA la logística en la metadata segura de Stripe
      metadata: {
        destinoNombre: body.nombreDestino,
        totalPagado: body.granTotal.toString(),
        fechaSalida: body.fechaSalida,
        fechaRegreso: body.fechaRegreso,
        hotelTipo: body.hotelTipo,
        horaCita: body.horaCita,
        direccionCompleta: body.direccionCompleta,
        hotelUbicacion: body.hotelUbicacion,
        transporteTipo: body.transporteTipo,
        adultos: body.adultos.toString(),
        mayores: body.mayores.toString(),
        ninos: body.ninos.toString(),
        totalPersonas: body.totalPersonas.toString(),
      },
      // Dejamos la success_url limpia, solo con el ID de sesión
      success_url: `${request.headers.get("origin")}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/destino/${body.idDestino}`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error("Error en Stripe:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}