"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Course } from "@/types";

// Interface para o usuário da sessão incluindo role e courses
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  courses?: Course[];
  image?: string;
}

// Interface para grupo recuperado da API
interface CourseGroup {
  course: Course;
  period: string;
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  ra: string;
  photoUrl?: string;
}

// Icones para os cursos
const courseIcons = {
  Engenharia: AcademicCapIcon,
  Fisioterapia: ChartBarIcon,
  Nutrição: ClipboardDocumentListIcon,
  Odontologia: Cog6ToothIcon,
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Extrair usuário da sessão com tipagem adequada
  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch("/api/groups");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (Array.isArray(data)) {
          setCourseGroups(data);
        } else {
          console.error("Dados recebidos não são um array:", data);
          setCourseGroups([]);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  // Obter apenas os cursos que o usuário tem acesso
  const getAccessibleCourses = (): Course[] => {
    if (!user) return [];

    const allCourses: Course[] = [
      "Engenharia",
      "Fisioterapia",
      "Nutrição",
      "Odontologia",
    ];

    if (
      user.role === "admin" ||
      user.role === "secretaria" ||
      user.role === "funcionario"
    ) {
      return allCourses;
    }

    if (
      (user.role === "coordenador" || user.role === "docente") &&
      Array.isArray(user.courses)
    ) {
      return user.courses;
    }

    return [];
  };

  // Carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Você está logado como{" "}
            <span className="font-semibold capitalize">
              {user?.role || "usuário"}
            </span>
            {user?.role === "coordenador" || user?.role === "docente" ? (
              <> de {user?.courses?.join(", ")}</>
            ) : null}
          </p>
        </div>

        {/* Cartões de acesso rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {/* Secretaria - apenas admin e secretaria */}
          {["admin", "secretaria"].includes(user?.role || "") && (
            <Link
              href="/secretaria"
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Área da Secretaria
                  </h3>
                  <p className="text-sm text-gray-500">Gerenciar carometros</p>
                </div>
              </div>
            </Link>
          )}

          {/* Carometros - todos os usuários */}
          <Link
            href="/carometros"
            className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ver Carometros</h3>
                <p className="text-sm text-gray-500">Visualizar carometros</p>
              </div>
            </div>
          </Link>

          {/* Administração - apenas admin */}
          {user?.role === "admin" && (
            <Link
              href="/dashboard/admin"
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Administração</h3>
                  <p className="text-sm text-gray-500">Gerenciar usuários</p>
                </div>
              </div>
            </Link>
          )}

          {/* Estatísticas - admin e secretaria */}
          {["admin", "secretaria"].includes(user?.role || "") && (
            <Link
              href="/dashboard/stats"
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <ChartBarIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Estatísticas</h3>
                  <p className="text-sm text-gray-500">Visualizar dados</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Seção de cursos disponíveis */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Carometros Disponíveis
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getAccessibleCourses().map((course) => {
            // Pega os períodos disponíveis para este curso
            const periodsForCourse = courseGroups
              .filter((group: CourseGroup) => group.course === course)
              .map((group: CourseGroup) => group.period);

            // Se não tiver períodos, não mostra o curso
            if (periodsForCourse.length === 0) return null;

            // Pegar o ícone do curso ou usar um padrão
            const CourseIcon =
              courseIcons[course as keyof typeof courseIcons] ||
              AcademicCapIcon;

            return (
              <div
                key={course}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <CourseIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {course}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {periodsForCourse.map((period) => (
                      <Link
                        key={`${course}-${period}`}
                        href={`/carometros/${course}/${period}`}
                        className="block w-full py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700">{period}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
