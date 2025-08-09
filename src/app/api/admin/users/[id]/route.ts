import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { UserRole } from "@/types";

// Interfaces para tipagem
interface UpdateData {
  name: string;
  email: string;
  role: UserRole;
  courses?: string[];
  updatedAt: Date;
  password?: string;
}

// PUT - Atualizar usuário
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verifica se o usuário está logado e é admin
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { name, email, password, role, courses } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Validação extra: coordenador e docente precisam ter cursos associados
    if (
      (role === "coordenador" || role === "docente") &&
      (!courses || courses.length === 0)
    ) {
      return NextResponse.json(
        {
          error: `${
            role === "coordenador" ? "Coordenadores" : "Docentes"
          } precisam ter pelo menos um curso associado`,
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const usersCollection = client.db("carometro").collection("users");

    // Verifica se o id é válido
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      console.error("ID inválido:", error);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verifica se o usuário existe
    const existingUser = await usersCollection.findOne({ _id: objectId });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o email já está em uso por outro usuário
    const emailInUse = await usersCollection.findOne({
      email,
      _id: { $ne: objectId },
    });

    if (emailInUse) {
      return NextResponse.json(
        { error: "Este email já está sendo usado por outro usuário" },
        { status: 400 }
      );
    }

    // Prepara os dados para atualização
    const updateData: UpdateData = {
      name,
      email,
      role: role as UserRole,
      courses: courses || [],
      updatedAt: new Date(),
    };

    // Se tiver senha, faz o hash
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualiza o usuário
    await usersCollection.updateOne({ _id: objectId }, { $set: updateData });

    // Retorna o usuário atualizado (sem a senha)
    const updatedUser = await usersCollection.findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Remover usuário
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verifica se o usuário está logado e é admin
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    const userId = params.id;

    const client = await clientPromise;
    const usersCollection = client.db("carometro").collection("users");

    // Verifica se o id é válido
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      console.error("ID inválido:", error);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Impede que o usuário exclua a si mesmo
    const currentUser = await usersCollection.findOne({
      email: session.user.email,
    });
    if (currentUser && currentUser._id.toString() === objectId.toString()) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta" },
        { status: 400 }
      );
    }

    // Remove o usuário
    const result = await usersCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Usuário removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return NextResponse.json(
      { error: "Erro ao remover usuário" },
      { status: 500 }
    );
  }
}
