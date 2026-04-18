import { getAdminSession } from "@/lib/admin/auth";
import { getSubscribers } from "@/lib/content";

export async function GET() {
  const session = await getAdminSession();

  if (session.status !== "authorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = await getSubscribers(5_000);
  const csv = toCsv([
    ["email", "source", "created_at"],
    ...subscribers.map((subscriber) => [subscriber.email, subscriber.source ?? "", subscriber.createdAt]),
  ]);

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ride-mental-health-subscribers.csv"',
    },
  });
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}
