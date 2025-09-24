import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carometro");

    // Buscar o usuário pelo email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verificar a senha com bcrypt
    const passwordMatch = await bcrypt.compare(
      password, // Senha fornecida pelo usuário
      user.password // Senha hash armazenada no banco
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Gerar um token JWT com expiração de 1 hora
    const secret = process.env.JWT_SECRET || "fallback-segredo";

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      success: true,
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return NextResponse.json({ message: "Erro no servidor" }, { status: 500 });
  }
}
