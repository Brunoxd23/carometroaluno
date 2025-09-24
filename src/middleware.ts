import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import type { Course } from "@/types";

// Middleware principal
export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth?.token;
    const path = request.nextUrl.pathname;

    // Verifica token personalizado no header
    const authHeader = request.headers.get("authorization");
    const customToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Permite acesso à página de login sem autenticação
    if (path === "/login") {
      return NextResponse.next();
    }

    // Se a rota começa com /api/, permite acesso com token personalizado
    if (path.startsWith("/api/") && customToken) {
      return NextResponse.next();
    }

    // Para outras rotas, exige autenticação NextAuth
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protege rota de admin
    if (
      token &&
      path.startsWith("/dashboard/admin") &&
      token.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protege rota da secretaria
    if (
      token &&
      path.startsWith("/secretaria") &&
      !["admin", "secretaria"].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Filtra acesso aos carometros para coordenadores e docentes
    if (token && path.startsWith("/carometros")) {
      const courseMatch = path.match(/\/carometros\/([^\/]+)/);

      if (
        courseMatch &&
        courseMatch[1] &&
        (token.role === "coordenador" || token.role === "docente") &&
        Array.isArray(token.courses) &&
        token.courses.length > 0
      ) {
        const requestedCourse = decodeURIComponent(courseMatch[1]) as Course;
        const allCourses: Course[] = [
          "Engenharia",
          "Fisioterapia",
          "Nutrição",
          "Odontologia",
        ];

        if (allCourses.includes(requestedCourse)) {
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
        const path = req.nextUrl.pathname;

        // Permitir acesso a rotas públicas sem autenticação
        if (
          path === "/login" ||
          path === "/api/auth/signin" ||
          path.startsWith("/api/auth") ||
          path === "/"
        ) {
          return true;
        }

        // Permitir acesso a rotas da API se tiver token no header
        if (path.startsWith("/api/")) {
          const authHeader = req.headers.get("authorization");
          if (authHeader?.startsWith("Bearer ")) {
            return true;
          }
        }

        return !!token;
      },
    },
  }
);

// Define os caminhos protegidos (todos exceto login e autenticação)
export const config = {
  matcher: ["/((?!api/auth|login|_next|favicon.ico|manifest.json).*)"],
};
