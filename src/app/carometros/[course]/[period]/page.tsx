"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Course, Group } from "@/types";
import {
  ArrowLeftIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

// Configuração para cada curso
const courseConfig = {
  Engenharia: {
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    title: "text-blue-600",
    lightBg: "bg-blue-50",
  },
  Fisioterapia: {
    color: "from-pink-600 to-rose-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    title: "text-pink-600",
    lightBg: "bg-pink-50",
  },
  Nutrição: {
    color: "from-green-600 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    title: "text-green-600",
    lightBg: "bg-green-50",
  },
  Odontologia: {
    color: "from-purple-600 to-indigo-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    title: "text-purple-600",
    lightBg: "bg-purple-50",
  },
};

export default function CarometroPage() {
  const params = useParams();
  const router = useRouter();
  const [courseGroup, setCourseGroup] = useState<{
    course: Course;
    period: string;
    groups: Group[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);

  const course = decodeURIComponent(params.course as string) as Course;
  const period = decodeURIComponent(params.period as string);

  console.log("Parâmetros:", { course, period });

  // Função para buscar os dados do carometro
  useEffect(() => {
    async function fetchCarometro() {
      try {
        setLoading(true);
        console.log(`Buscando dados para ${course}/${period}`);

        const response = await fetch(
          `/api/groups?course=${course}&period=${period}`
        );
        console.log("Status da resposta:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados recebidos:", data);

        // Encontrar o grupo do curso e período específicos
        const groupData = Array.isArray(data)
          ? data.find(
              (group) => group.course === course && group.period === period
            )
          : null;

        console.log("Grupo encontrado:", groupData);

        if (!groupData) {
          setError("Carometro não encontrado para este curso e período");
          return;
        }

        setCourseGroup(groupData);
        // Calcular total de alunos
        const studentsCount =
          groupData.groups?.reduce(
            (total: number, group: Group) =>
              total + (group.students?.length || 0),
            0
          ) || 0;
        setTotalStudents(studentsCount);
      } catch (err) {
        console.error("Erro ao buscar dados do carometro:", err);
        setError("Erro ao carregar o carometro");
      } finally {
        setLoading(false);
      }
    }

    fetchCarometro();
  }, [course, period]);

  // Função para filtrar alunos
  const filterGroups = (groups: Group[]) => {
    if (!searchTerm) return groups;

    return groups
      .map((group) => ({
        ...group,
        students: group.students.filter(
          (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.ra.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.students.length > 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !courseGroup) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {course} - {period}
            </h1>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {error || "Carometro não encontrado"}
            </h2>
            <p className="text-red-600 mb-4">
              Não foi possível carregar o carometro para este curso e período.
            </p>
            <Link
              href={`/carometros/${course}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Voltar para períodos de {course}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar grupos
  const filteredGroups = courseGroup ? filterGroups(courseGroup.groups) : [];

  // Configuração de cores específicas para o curso atual
  const config =
    courseConfig[course as keyof typeof courseConfig] ||
    courseConfig.Engenharia;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com navegação */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/carometros/${course}`}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className={`text-2xl font-bold ${config.title} mb-1`}>
                Carometro {course}
              </h1>
              <div
                className="w-20 h-1 rounded-full mb-2"
                style={{
                  background: `linear-gradient(to right, var(--${course.toLowerCase()}-primary), var(--${course.toLowerCase()}-secondary))`,
                }}
              />
              <p className="text-gray-600 flex items-center gap-1">
                Período {period}
                <span className="mx-1">•</span>
                <span className="text-sm">{totalStudents} alunos</span>
              </p>
            </div>
          </div>

          {/* Contagem em card */}
          <div
            className={`${config.lightBg} ${config.borderColor} border rounded-lg p-3 hidden md:block text-center`}
          >
            <div className={`text-xl font-bold ${config.textColor}`}>
              {totalStudents}
            </div>
            <div className="text-xs text-gray-600">Alunos</div>
          </div>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar por nome ou RA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-lg border ${
                isFilterOpen
                  ? `${config.borderColor} ${config.bgColor} ${config.textColor}`
                  : "border-gray-200 bg-white"
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grupos */}
        <div className="space-y-8">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className={`bg-white rounded-xl shadow overflow-hidden border ${config.borderColor}`}
              >
                <div
                  className={`p-4 ${config.bgColor} flex justify-between items-center`}
                >
                  <h2 className={`text-lg font-semibold ${config.textColor}`}>
                    {group.name}
                  </h2>
                  <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
                    {group.students.length} alunos
                  </span>
                </div>

                <div className="p-6">
                  {/* Grid de alunos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {group.students && group.students.length > 0 ? (
                      group.students.map((student) => (
                        <div
                          key={student.id}
                          className="flex flex-col items-center group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden mb-2 bg-gray-100">
                            {student.photoUrl ? (
                              <Image
                                src={student.photoUrl}
                                alt={student.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserCircleIcon className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-800 text-center line-clamp-2">
                            {student.name}
                          </h3>
                          <p className={`text-xs ${config.textColor}`}>
                            {student.ra}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500 py-4">
                        Nenhum aluno cadastrado neste grupo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div
              className={`${config.lightBg} border ${config.borderColor} rounded-lg p-6 text-center`}
            >
              <p className={config.textColor}>
                Nenhum aluno encontrado com o termo &quot;{searchTerm}&quot;.
              </p>
            </div>
          ) : (
            <div
              className={`${config.lightBg} border ${config.borderColor} rounded-lg p-6 text-center`}
            >
              <p className={config.textColor}>
                Não há grupos cadastrados para este período.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
