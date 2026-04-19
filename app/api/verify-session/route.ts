import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string).trim(), {
  // @ts-expect-error - ignorar versionado estricto
  apiVersion: "2023-10-16",
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ metadata: session.metadata });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}