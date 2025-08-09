import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Verificar se é admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// Listar usuários
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carometro");

    const role = request.nextUrl.searchParams.get("role");
    const query = role ? { role } : {};

    const users = await db
      .collection("users")
      .find(query)
      .project({ password: 0 })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao listar usuários" },
      { status: 500 }
    );
  }
}

// Criar usuário
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const userData = await request.json();

    if (
      !userData.email ||
      !userData.name ||
      !userData.password ||
      !userData.role
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carometro");

    const existingUser = await db
      .collection("users")
      .findOne({ email: userData.email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db.collection("users").insertOne({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
