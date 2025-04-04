import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ra = searchParams.get("ra");
  const curso = searchParams.get("curso");
  const all = searchParams.get("all"); // Novo parâmetro para buscar todos

  console.log(`Buscando aluno - RA: ${ra}, Curso: ${curso}`); // Log para debug

  if (!ra && all === null) {
    return NextResponse.json({ error: "RA é obrigatório" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    console.log("MongoDB conectado"); // Log para debug

    const db = client.db("carometro");

    // Se o parâmetro all estiver presente, retorna todos os alunos
    if (all !== null) {
      const allStudents = await db
        .collection("students")
        .find({})
        .sort({ name: 1 }) // Ordena por nome
        .toArray();

      return NextResponse.json(allStudents);
    }

    // Log da query que será executada
    console.log(`Executando query - { ra: "${ra}" }`);

    const student = await db.collection("students").findOne({
      ra: ra?.toString() ?? "", // Garantir que o RA seja string, com fallback para string vazia
    });

    console.log("Resultado da busca:", student); // Log do resultado

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    if (curso && student.curso !== curso) {
      return NextResponse.json(
        { error: `Aluno não pertence ao curso de ${curso}` },
        { status: 400 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    // Log detalhado do erro
    console.error("Erro na busca do aluno:", {
      ra,
      curso,
      error: error instanceof Error ? error.stack : String(error),
    });

    return NextResponse.json(
      {
        error: "Erro ao buscar aluno",
        details: error instanceof Error ? error.message : String(error),
        ra, // Inclui o RA na resposta de erro
        curso, // Inclui o curso na resposta de erro
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ra, name, curso } = body;

    if (!ra || !name || !curso) {
      return NextResponse.json(
        { error: "RA, nome e curso são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carometro");

    // Verifica se o RA já existe
    const existing = await db.collection("students").findOne({ ra });
    if (existing) {
      return NextResponse.json({ error: "RA já cadastrado" }, { status: 400 });
    }

    // Insere novo aluno
    const result = await db.collection("students").insertOne({
      ra,
      name,
      curso,
      photoUrl: "",
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Aluno cadastrado com sucesso",
      id: result.insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao cadastrar aluno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
