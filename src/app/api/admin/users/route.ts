import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Buscar todos os usuários
export async function GET() {
  try {
    // Usar authOptions para obter a sessão corretamente
    const session = await getServerSession(authOptions);

    // Log para debug
    console.log("Session in /api/admin/users:", session);

    // Verifica se o usuário está logado e é admin
    if (!session || session.user?.role !== "admin") {
      console.log("Acesso não autorizado: ", session?.user?.role || "sem role");
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const usersCollection = client.db("carometro").collection("users");

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar um novo usuário
export async function POST(request: NextRequest) {
  try {
    // Usar authOptions para obter a sessão corretamente
    const session = await getServerSession(authOptions);

    // Verifica se o usuário está logado e é admin
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const { name, email, password, role, courses } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const client = await clientPromise;
    const usersCollection = client.db("carometro").collection("users");

    // Verifica se o email já existe
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      courses: courses || [],
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
