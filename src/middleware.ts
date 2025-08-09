import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import type { Course } from "@/types";

// Middleware principal
export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth?.token;
    const path = request.nextUrl.pathname;

    // Permite acesso à página de login sem autenticação
    if (path === "/login") {
      return NextResponse.next();
    }

    // Redireciona se não estiver autenticado
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protege rota de admin
    if (path.startsWith("/dashboard/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protege rota da secretaria
    if (
      path.startsWith("/secretaria") &&
      !["admin", "secretaria"].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Filtra acesso aos carometros para coordenadores e docentes
    if (path.startsWith("/carometros")) {
      // Verificação específica para visualização de um curso
      const courseMatch = path.match(/\/carometros\/([^\/]+)/);

      // Se for um path específico de um curso (não a página geral de carometros)
      if (
        courseMatch &&
        courseMatch[1] &&
        (token.role === "coordenador" || token.role === "docente") &&
        Array.isArray(token.courses) &&
        token.courses.length > 0
      ) {
        // Decodifica o curso da URL - usar apenas course
        const requestedCourse = decodeURIComponent(courseMatch[1]) as Course;

        // Lista de todos os cursos disponíveis
        const allCourses: Course[] = [
          "Engenharia",
          "Fisioterapia",
          "Nutrição",
          "Odontologia",
        ];

        // Verifica se o curso existe
        if (allCourses.includes(requestedCourse)) {
          // Se o usuário não tem acesso ao curso solicitado, redireciona para o dashboard
          if (!token.courses.includes(requestedCourse)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso a rotas públicas sem autenticação
        const path = req.nextUrl.pathname;
        if (
          path === "/login" ||
          path === "/api/auth/signin" ||
          path.startsWith("/api/auth") ||
          path === "/"
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

// Define os caminhos protegidos (todos exceto login e autenticação)
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos exceto:
     * 1. /api/auth (rotas de autenticação do NextAuth.js)
     * 2. /login (página de login)
     * 3. /_next (arquivos estáticos do Next.js)
     * 4. /favicon.ico, /manifest.json (arquivos de metadados do navegador)
     */
    "/((?!api/auth|login|_next|favicon.ico|manifest.json).*)",
  ],
};
