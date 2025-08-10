// lib/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "./mongodb";
import bcrypt from "bcrypt";
import { UserRole } from "@/types";

// Extensão dos tipos do NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      courses?: string[];
    };
  }

  interface User {
    id: string;
    role: UserRole;
    courses?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    courses?: string[];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        isTokenLogin: { label: "Token Login", type: "text" }, // Campo para identificar login via token
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Verificar se é login via token
          if (credentials.isTokenLogin === "true") {
            // Neste caso, não verificamos senha, apenas email
            // O token já foi verificado na API /api/auth/login
            const client = await clientPromise;
            const usersCollection = client.db("carometro").collection("users");

            const user = await usersCollection.findOne({
              email: credentials.email,
            });

            if (!user) {
              throw new Error("Usuário não encontrado");
            }

            // Não realizamos verificação de senha aqui
            // Esta autenticação só é válida se o token foi verificado anteriormente

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _password, ...userWithoutPassword } = user;

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              courses: user.courses || [],
              image: user.image || null,
            };
          }
          // Login normal com verificação de senha (mantido para compatibilidade, mas não deve ser usado)
          else if (credentials.password) {
            // Esta parte pode ser removida se você estiver usando apenas o novo fluxo
            const client = await clientPromise;
            const usersCollection = client.db("carometro").collection("users");

            // Criar cópia das credenciais para uso local e depois limpar
            const emailToCheck = credentials.email;
            const passwordToCheck = credentials.password;

            const user = await usersCollection.findOne({
              email: emailToCheck,
            });

            if (!user) {
              throw new Error("Usuário não encontrado");
            }

            const passwordMatch = await bcrypt.compare(
              passwordToCheck,
              user.password
            );

            if (!passwordMatch) {
              throw new Error("Senha incorreta");
            }

            // Remover o campo password de forma segura sem gerar avisos do ESLint
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _password, ...userWithoutPassword } = user;

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              courses: user.courses || [],
              image: user.image || null,
            };
          }

          return null;
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.courses = user.courses;
        // Nunca inclua a senha no token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.courses = token.courses;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret:
    process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
};
