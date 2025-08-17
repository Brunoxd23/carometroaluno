import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  // Upload para Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return NextResponse.json({ url: blob.url });
}
