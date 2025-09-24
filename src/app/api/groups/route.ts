import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    // Verificar autenticação via token personalizado
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.startsWith("Bearer ") || authHeader?.startsWith("Token ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      // Se não houver token, verificar sessão do NextAuth
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    } else {
      try {
        // Verificar e decodificar o token
        if (!process.env.JWT_SECRET) {
          return NextResponse.json(
            { error: "JWT_SECRET não configurado no ambiente" },
            { status: 500 }
          );
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          role?: string;
          courses?: string[];
        };

        if (!decoded || typeof decoded !== "object" || !decoded.role) {
          return NextResponse.json(
            { error: "Token inválido" },
            { status: 401 }
          );
        }

        // Permissões baseadas no papel do usuário
        const { role, courses } = decoded;

        // Extrair parâmetros opcionais da URL
        const { searchParams } = new URL(request.url);
        const course = searchParams.get("course");
        const period = searchParams.get("period");

        const client = await clientPromise;
        const database = client.db("carometro");
        const groups = database.collection("groups");

        // Define interface for query structure
        interface GroupQuery {
          course?: string | { $in: string[] };
          period?: string;
        }

        // Construir a query baseada nos parâmetros
        const query: GroupQuery = {};
        if (course) query.course = course;
        if (period) query.period = period;

        // Verificar permissões por curso (para coordenador e docente)
        if (role === "coordenador" || role === "docente") {
          if (!Array.isArray(courses) || courses.length === 0) {
            return NextResponse.json([]);
          }

          // Se não há um curso específico na query, filtrar pelos cursos permitidos
          if (!course) {
            query.course = { $in: courses };
          }
          // Se há um curso específico, verificar se está na lista de permitidos
          else if (!courses.includes(course)) {
            return NextResponse.json(
              { error: "Sem permissão para este curso" },
              { status: 403 }
            );
          }
        }

        // Buscar grupos com a query construída
        const data = await groups.find(query).toArray();

        console.log(`Encontrados ${data.length} grupos`);

        return NextResponse.json(data);
      } catch (err) {
        console.error("Erro ao verificar token:", err);
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
    }
  } catch (err) {
    console.error("Erro ao buscar grupos:", err);
    return NextResponse.json(
      { error: "Erro ao buscar grupos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const database = client.db("carometro");
    const groups = database.collection("groups");

    await groups.updateOne(
      { course: body.course, period: body.period },
      { $set: body },
      { upsert: true }
    );

    return NextResponse.json({ message: "Grupo salvo com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar grupo:", err);
    return NextResponse.json(
      { error: "Erro ao salvar grupo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get("course");
    const period = searchParams.get("period");

    if (!course || !period) {
      return NextResponse.json(
        { error: "Parâmetros 'course' e 'period' são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("carometro");
    const groups = database.collection("groups");

    const result = await groups.deleteOne({ course, period });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Grupo não encontrado para exclusão" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Grupo excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir grupo:", err);
    return NextResponse.json(
      { error: "Erro ao excluir grupo" },
      { status: 500 }
    );
  }
}
