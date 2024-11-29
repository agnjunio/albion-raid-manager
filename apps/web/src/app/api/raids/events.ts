import { Raid } from "@albion-raid-manager/database/models";
import { NextRequest, NextResponse } from "next/server";

interface Client {
  id: number;
  writer: WritableStreamDefaultWriter;
}

let clients: Client[] = [];

export const runtime = "edge";

export const dynamic = "force-dynamic";

export function GET_SSE(request: NextRequest) {
  const clientId = Date.now();
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  const client = {
    id: clientId,
    writer,
  };

  clients.push(client);
  request.signal.addEventListener("abort", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });

  return new NextResponse(responseStream.readable, { headers });
}

export function notifyClients(raid: Raid) {
  const encoder = new TextEncoder();

  for (const client of clients) {
    client.writer.write(encoder.encode(`data: ${JSON.stringify(raid)}\n\n`));
  }
}
