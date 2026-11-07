// Always read the runtime clock; never cache a build-time timestamp.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ now: Date.now() }, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
