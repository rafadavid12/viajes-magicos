export async function GET() {
  return Response.json({ ok: true, t: new Date().toISOString() });
}