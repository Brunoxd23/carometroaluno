import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { UserRole } from "@/types";

// ===== EXTENSÃO DOS TIPOS DO NEXT-AUTH =====

// Estende o tipo da sessão para incluir role, id e courses
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

// Estende o tipo do JWT para incluir role, id e courses
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    courses?: string[];
  }
}

// ===== CONFIGURAÇÃO DO NEXT-AUTH =====

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const usersCollection = client.db("carometro").collection("users");

          const user = await usersCollection.findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("Usuário não encontrado");
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Senha incorreta");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            courses: user.courses || [],
            image: user.image || null,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Transfere os dados do usuário para o token na autenticação inicial
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.courses = user.courses;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfere os dados do token para a sessão em cada requisição
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

// ===== EXPORTAÇÃO =====

// Exportando o handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
