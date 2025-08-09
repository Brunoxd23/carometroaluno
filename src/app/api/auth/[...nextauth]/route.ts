import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Handler para a rota de API de autenticação
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
