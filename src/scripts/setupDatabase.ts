// Importa o cliente MongoDB que será usado para conectar ao banco de dados
import { MongoClient } from "mongodb";
// Importa o dotenv para carregar variáveis de ambiente do arquivo .env.local
import * as dotenv from "dotenv";

// Configura o dotenv para ler as variáveis do arquivo .env.local
dotenv.config({ path: ".env.local" });

// Obtém a string de conexão do MongoDB das variáveis de ambiente
const uri = process.env.MONGODB_URI;
// Verifica se a URI existe, caso contrário lança um erro
if (!uri) {
  throw new Error("Adicione MONGODB_URI no arquivo .env.local");
}

// Função assíncrona principal que configura o banco de dados
async function setup() {
  // Cria uma nova instância do cliente MongoDB
  const client = new MongoClient(uri as string);

  try {
    // Tenta conectar ao MongoDB
    await client.connect();
    console.log("Conectado ao MongoDB");

    // Seleciona o banco de dados 'carometro'
    const db = client.db("carometro");

    // Verifica se a coleção 'students' já existe
    if (!(await db.listCollections({ name: "students" }).hasNext())) {
      // Se não existir, cria a coleção
      await db.createCollection("students");
      console.log("Coleção students criada");

      // Cria um índice único no campo 'ra'
      // Isso garante que não haverá dois alunos com o mesmo RA
      // O { ra: 1 } significa ordenação ascendente
      await db.collection("students").createIndex({ ra: 1 }, { unique: true });
      console.log("Índice único criado no campo RA");

      // Insere dados iniciais de exemplo na coleção
      // Útil para testes e desenvolvimento
      await db.collection("students").insertMany([
        {
          ra: "123456", // Número de matrícula do aluno
          name: "João Silva", // Nome do aluno
          curso: "Engenharia", // Curso do aluno
          photoUrl: "", // URL da foto (vazio inicialmente)
          createdAt: new Date(), // Data de criação do registro
        },
        {
          ra: "234567",
          name: "Maria Santos",
          curso: "Fisioterapia",
          photoUrl: "",
          createdAt: new Date(),
        },
      ]);
      console.log("Alunos de exemplo inseridos");
    } else {
      // Se a coleção já existir, apenas informa
      console.log("Coleção students já existe");
    }
  } catch (error) {
    // Em caso de erro, exibe no console
    console.error("Erro:", error);
  } finally {
    // Sempre fecha a conexão com o banco, independente de sucesso ou erro
    await client.close();
    console.log("Conexão fechada");
  }
}

// Executa a função de setup
setup();
