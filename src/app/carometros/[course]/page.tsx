"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Course } from "@/types";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  HeartIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Interface para o usuário da sessão
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  courses?: Course[];
}

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

// Configuração para cada curso
const courseConfig = {
  Engenharia: {
    icon: AcademicCapIcon,
    color: "from-blue-600 to-cyan-500",
    bgLight: "bg-blue-50",
    text: "text-blue-700",
    gradient: "bg-gradient-to-r from-blue-600 to-cyan-500",
    title: "text-blue-600",
  },
  Fisioterapia: {
    icon: HeartIcon,
    color: "from-pink-600 to-rose-500",
    bgLight: "bg-pink-50",
    text: "text-pink-700",
    gradient: "bg-gradient-to-r from-pink-600 to-rose-500",
    title: "text-pink-600",
  },
  Nutrição: {
    icon: ClipboardDocumentListIcon,
    color: "from-green-600 to-emerald-500",
    bgLight: "bg-green-50",
    text: "text-green-700",
    gradient: "bg-gradient-to-r from-green-600 to-emerald-500",
    title: "text-green-600",
  },
  Odontologia: {
    icon: BeakerIcon,
    color: "from-purple-600 to-indigo-500",
    bgLight: "bg-purple-50",
    text: "text-purple-700",
    gradient: "bg-gradient-to-r from-purple-600 to-indigo-500",
    title: "text-purple-600",
  },
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);

  const courseParam = Array.isArray(params.course)
    ? params.course[0]
    : (params.course as string);

  // Normalize o parâmetro do curso
  const course = decodeURIComponent(courseParam) as Course;

  // Extrair usuário da sessão com tipagem adequada
  const user = session?.user as SessionUser | undefined;

  // Verificar acesso
  const hasAccess =
    user &&
    (user.role === "admin" ||
      user.role === "secretaria" ||
      user.role === "funcionario" ||
      (Array.isArray(user.courses) && user.courses.includes(course)));

  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Verificar acesso quando o status da sessão estiver disponível
    if (status === "authenticated" && !hasAccess) {
      router.push("/dashboard");
      return;
    }

    // Só carregar dados se estiver autenticado e tiver acesso
    if (status === "authenticated" && hasAccess) {
      async function fetchGroups() {
        try {
          const res = await fetch(
            `/api/groups?course=${encodeURIComponent(course)}`
          );

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          console.log("Dados recebidos:", data);
          setCourseGroups(data);

          // Calcular total de alunos
          const studentCount = data.reduce(
            (total: number, group: CourseGroup) => {
              if (group.groups) {
                return (
                  total +
                  group.groups.reduce((subtotal: number, g: Group) => {
                    return subtotal + (g.students ? g.students.length : 0);
                  }, 0)
                );
              }
              return total;
            },
            0
          );

          setTotalStudents(studentCount);
        } catch (error) {
          console.error("Erro ao carregar grupos:", error);
        } finally {
          setLoading(false);
        }
      }

      fetchGroups();
    }
  }, [status, router, hasAccess, course]);

  // Filtra os períodos disponíveis para o curso
  const periodsForCourse = courseGroups
    .filter((group) => group.course === course)
    .map((group) => group.period);

  // Filtra períodos de acordo com o termo de busca
  const filteredPeriods = periodsForCourse.filter((period) =>
    period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const config =
    courseConfig[course as keyof typeof courseConfig] ||
    courseConfig.Engenharia;
  const Icon = config.icon;

  // Carregamento
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar se o curso existe
  if (!Object.keys(courseConfig).includes(course)) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Curso não encontrado
          </h2>
          <p className="text-red-600 mb-4">O curso especificado não existe.</p>
          <Link
            href="/carometros"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar para carometros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/carometros"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className={`text-2xl font-bold ${config.title} mb-1`}>
                Carometros de {course}
              </h1>
              <div
                className="w-20 h-1 rounded-full mb-2"
                style={{
                  background: `linear-gradient(to right, var(--${course.toLowerCase()}-primary), var(--${course.toLowerCase()}-secondary))`,
                }}
              />
              <div className="flex items-center gap-2 text-gray-600">
                <p className="text-sm">
                  {periodsForCourse.length} períodos disponíveis
                </p>
                <span>•</span>
                <p className="text-sm flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {totalStudents} alunos
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas em cards pequenos */}
          <div
            className={`${config.bgLight} border ${config.text} border-opacity-20 rounded-lg p-3 hidden md:flex flex-col items-center justify-center`}
          >
            <div className={`text-xl font-bold ${config.text}`}>
              {totalStudents}
            </div>
            <div className="text-xs text-gray-500">Alunos</div>
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
              placeholder="Buscar períodos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Exibir períodos disponíveis para o curso */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPeriods.length > 0 ? (
            filteredPeriods.map((period) => {
              // Encontrar o grupo para obter a contagem de alunos
              const groupData = courseGroups.find(
                (g) => g.course === course && g.period === period
              );

              // Calcular contagens
              let studentsCount = 0;
              let groupsCount = 0;

              if (groupData && groupData.groups) {
                groupsCount = groupData.groups.length;

                // Somar estudantes de todos os grupos
                studentsCount = groupData.groups.reduce((count, group) => {
                  return (
                    count +
                    (Array.isArray(group.students) ? group.students.length : 0)
                  );
                }, 0);
              }

              return (
                <div
                  key={period}
                  className="bg-white shadow rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                >
                  <div
                    className={`p-4 bg-gradient-to-r ${config.color} text-white`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">{period}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${config.bgLight} p-2 rounded-full`}>
                          <UsersIcon className={`w-4 h-4 ${config.text}`} />
                        </div>
                        <span className="text-gray-700">
                          {studentsCount} alunos
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {groupsCount} grupos
                      </span>
                    </div>

                    <Link
                      href={`/carometros/${course}/${period}`}
                      className={`block w-full py-3 px-4 text-center rounded-lg ${config.bgLight} ${config.text} font-medium hover:opacity-90 transition-opacity`}
                    >
                      Visualizar Carometro
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
              <p className="text-amber-700">
                {searchTerm
                  ? "Nenhum período encontrado para a busca."
                  : "Não há períodos disponíveis para este curso."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
