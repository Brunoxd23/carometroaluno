"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Course } from "@/types";

// Interface para o usuário da sessão incluindo role e courses
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  courses?: Course[];
}

// Interface para representar um estudante no grupo
interface Student {
  id: string;
  name: string;
  photoUrl?: string;
}

// Interface para grupo recuperado da API
interface CourseGroup {
  course: Course;
  period: string;
  groups: { students: Student[] }[]; // array de grupos contendo arrays de estudantes
}

// Configuração de ícones e cores para cada curso
const courseConfig = {
  Engenharia: {
    icon: AcademicCapIcon,
    color: "from-blue-600 to-cyan-500",
    lightColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  Fisioterapia: {
    icon: HeartIcon,
    color: "from-pink-600 to-rose-500",
    lightColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  Nutrição: {
    icon: ClipboardDocumentListIcon,
    color: "from-green-600 to-emerald-500",
    lightColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  Odontologia: {
    icon: BeakerIcon,
    color: "from-purple-600 to-indigo-500",
    lightColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
} as const;

export default function CarometrosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  // Extrair usuário da sessão com tipagem adequada
  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    // Se não estiver autenticado e terminou de carregar, redirecionar
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Só carregar dados se estiver autenticado
    if (status === "authenticated") {
      async function fetchGroups() {
        try {
          const res = await fetch("/api/groups");
          const data = await res.json();
          setCourseGroups(data);

          console.log("Dados carregados do banco:", data);

          // Calcular total de alunos considerando todos os grupos
          const totalStudents = data.reduce(
            (total: number, group: CourseGroup) => {
              return (
                total +
                group.groups.reduce(
                  (sum, studentGroup) => sum + studentGroup.students.length,
                  0
                )
              );
            },
            0
          );

          setTotalStudentsCount(totalStudents);
        } catch (error) {
          console.error("Erro ao carregar grupos:", error);
        } finally {
          setLoading(false);
        }
      }

      fetchGroups();
    }
  }, [status, router]);

  // Função para verificar se o usuário tem acesso a um curso específico
  const hasAccessToCourse = (course: Course) => {
    if (!user) return false;

    if (
      user.role === "admin" ||
      user.role === "secretaria" ||
      user.role === "funcionario"
    ) {
      return true;
    }

    if (
      (user.role === "coordenador" || user.role === "docente") &&
      Array.isArray(user.courses)
    ) {
      return user.courses.includes(course);
    }

    return false;
  };

  // Obter apenas os cursos que o usuário tem acesso
  const getAccessibleCourses = (): Course[] => {
    if (!user) return [];

    const allCourses: Course[] = (
      ["Engenharia", "Fisioterapia", "Nutrição", "Odontologia"] as Course[]
    ).filter((course) => hasAccessToCourse(course));

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
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Obter cursos acessíveis que possuem dados
  const coursesWithData = getAccessibleCourses().filter((course) =>
    courseGroups.some((group) => group.course === course)
  );

  // Filtrar cursos por termo de busca
  const filteredCourses = coursesWithData.filter((course) =>
    course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Carometros por Curso
            </h1>
            <div className="w-32 h-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-80 mb-2"></div>
            <div className="text-gray-600 text-sm flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              <span>
                {totalStudentsCount} alunos em {filteredCourses.length} cursos
              </span>
            </div>
          </div>

          {/* Card com total */}
          <div className="hidden md:block bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-700">
              {totalStudentsCount}
            </div>
            <div className="text-xs text-gray-600">Alunos</div>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              // Configurações para este curso
              const config = courseConfig[course];
              const Icon = config.icon;

              // Contagem de períodos disponíveis
              const periodsForCourse = courseGroups.filter(
                (group) => group.course === course
              );

              const periodsCount = periodsForCourse.length;

              // Contagem de alunos por curso
              const studentsCount = periodsForCourse.reduce(
                (total: number, group: CourseGroup) => {
                  return (
                    total +
                    group.groups.reduce(
                      (sum, groupObj) => sum + groupObj.students.length,
                      0
                    )
                  );
                },
                0
              );

              return (
                <div
                  key={course}
                  className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors hover:shadow-md"
                >
                  <div
                    className={`p-4 bg-gradient-to-r ${config.color} text-white`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">{course}</h2>
                      </div>
                      <div
                        className={`bg-white/20 px-2 py-1 rounded-full text-xs ${config.iconColor}`}
                      >
                        {periodsCount} períodos
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {studentsCount} alunos
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium rounded-full px-2 py-1 ${config.lightColor} ${config.iconColor}`}
                      >
                        {periodsCount} períodos
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/carometros/${course}`)}
                      className={`block w-full py-3 px-4 text-center rounded-lg ${config.lightColor} ${config.iconColor} font-medium hover:opacity-90 transition-all`}
                    >
                      Ver Períodos
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
              <p className="text-amber-700">
                {searchTerm
                  ? "Nenhum curso encontrado para a busca."
                  : "Não foram encontrados carometros disponíveis."}
              </p>
            </div>
          )}
        </div>

        {coursesWithData.length === 0 && user?.role === "coordenador" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <p className="text-blue-700">
              Você tem acesso apenas a cursos específicos. Por favor, contate o
              administrador caso precise de acesso a outros cursos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
