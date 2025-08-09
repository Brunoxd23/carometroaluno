// Este arquivo é JavaScript, não TypeScript, portanto alguns erros ESLint são esperados
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MongoClient } = require("mongodb");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdmin() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB");

    const db = client.db("carometro");
    const usersCollection = db.collection("users");

    // Verifica se já existe um admin
    const existingAdmin = await usersCollection.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Já existe um usuário administrador");
      return;
    }

    // Cria o hash da senha
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Cria o usuário admin
    const result = await usersCollection.insertOne({
      name: "Administrador",
      email: "admin@exemplo.com",
      password: hashedPassword,
      role: "admin",
      courses: [],
      createdAt: new Date(),
    });

    console.log("Administrador criado com sucesso");
    console.log("Email: admin@exemplo.com");
    console.log("Senha: admin123");
    console.log("ID:", result.insertedId);
  } catch (error) {
    console.error("Erro ao criar administrador:", error);
  } finally {
    await client.close();
  }
}

createAdmin();
