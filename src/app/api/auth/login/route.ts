import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, passwordHash } = await request.json();

    // Validações básicas
    if (!email || !passwordHash) {
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
    // Observe que estamos comparando a senha do banco com a senha original
    // Isto é feito de forma segura sem expor a senha original na rede
    // A autenticação final ainda depende do bcrypt
    const passwordMatch = await bcrypt.compare(
      passwordHash, // Aqui recebemos apenas o hash da senha
      user.password // Comparamos com a senha armazenada no banco
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Gerar um token temporário para autenticação que será usado com NextAuth
    // Não incluir dados sensíveis neste token
    const sessionToken = crypto.randomUUID();

    // Armazenar temporariamente o token para validação posterior (opcional)
    // Isto poderia ser feito em uma tabela no banco de dados com prazo de expiração

    // Evitar enviar dados sensíveis na resposta
    return NextResponse.json({
      success: true,
      token: sessionToken,
      userId: user._id.toString(),
      // Não inclua a senha nem mesmo em hash!
    });
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return NextResponse.json({ message: "Erro no servidor" }, { status: 500 });
  }
}
