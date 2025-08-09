// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Função para extrair o id dos parâmetros
function getIdFromParams(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;
  const segments = path.split("/");
  return segments[segments.length - 1];
}

// Verificar se é admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// Handler GET - Obter um usuário por ID
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const id = getIdFromParams(request);

    const client = await clientPromise;
    const db = client.db("carometro");

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Remover senha antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// Handler PUT - Atualizar um usuário
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const id = getIdFromParams(request);
    const data = await request.json();

    const client = await clientPromise;
    const db = client.db("carometro");

    // Validações básicas
    if (data.email && !data.email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Preparar dados para atualização
    const updateData = { ...data };

    // Hash de senha se for fornecida
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remover campos não atualizáveis
    delete updateData._id;

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// Handler DELETE - Excluir um usuário
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const id = getIdFromParams(request);

    const client = await clientPromise;
    const db = client.db("carometro");

    // Não permitir exclusão do próprio usuário admin
    const session = await getServerSession(authOptions);
    if (session?.user?.id === id) {
      return NextResponse.json(
        { error: "Não é possível excluir seu próprio usuário" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}
