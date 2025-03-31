"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  HeartIcon,
  ClipboardDocumentIcon,
  BeakerIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Period, CourseGroup, Course } from "@/types";
import Image from "next/image";
import { use } from "react";
import { gradientClasses } from "@/styles/shared";
import PhotoModal from "@/components/PhotoModal";

const coursePeriods: Record<Course, Period[]> = {
  Engenharia: ["2023-1", "2024-1", "2025-1"],
  Fisioterapia: ["2022-1", "2023-1", "2024-1", "2025-1"],
  Nutrição: ["2024-1", "2025-1"],
  Odontologia: ["2023-1", "2024-1", "2025-1"],
};

const courseConfig = {
  Engenharia: {
    icon: AcademicCapIcon,
    color: "from-blue-600 to-cyan-500",
    lightColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  Fisioterapia: {
    icon: HeartIcon,
    color: "from-pink-600 to-rose-500",
    lightColor: "bg-pink-50",
    iconColor: "text-pink-600",
    borderHover: "hover:border-pink-200",
  },
  Nutrição: {
    icon: ClipboardDocumentIcon,
    color: "from-green-600 to-emerald-500",
    lightColor: "bg-green-50",
    iconColor: "text-green-600",
    borderHover: "hover:border-green-200",
  },
  Odontologia: {
    icon: BeakerIcon,
    color: "from-purple-600 to-indigo-500",
    lightColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderHover: "hover:border-purple-200",
  },
} as const;

export default function CarometroCursoPage({
  params,
}: {
  params: Promise<{ curso: string }>;
}) {
  const resolvedParams = use(params);
  const curso = decodeURIComponent(resolvedParams.curso);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [courseData, setCourseData] = useState<CourseGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [periodStats, setPeriodStats] = useState<
    Record<string, { groups: number; students: number }>
  >({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const courseName = (curso.charAt(0).toUpperCase() + curso.slice(1)) as Course;
  const availablePeriods = useMemo(
    () => coursePeriods[courseName] || [],
    [courseName]
  );

  useEffect(() => {
    setMounted(true);

    const stats: Record<string, { groups: number; students: number }> = {};
    availablePeriods.forEach((period) => {
      const data = window.localStorage.getItem(
        `carometro-${curso.toLowerCase()}-${period}`
      );
      if (data) {
        const periodData = JSON.parse(data) as CourseGroup;
        stats[period] = {
          groups: periodData.groups?.length || 0,
          students:
            periodData.groups?.reduce(
              (acc, group) => acc + (group.students?.length || 0),
              0
            ) || 0,
        };
      } else {
        stats[period] = { groups: 0, students: 0 };
      }
    });
    setPeriodStats(stats);
  }, [curso, availablePeriods]);

  const loadPeriodData = useCallback(
    (period: Period) => {
      if (!mounted) return;

      setSelectedPeriod(period);
      const saved = window.localStorage.getItem(
        `carometro-${curso.toLowerCase()}-${period}`
      );
      setCourseData(saved ? JSON.parse(saved) : null);
    },
    [curso, mounted]
  );

  const handleBack = () => {
    if (selectedPeriod) {
      // Se estiver visualizando grupos, volta para seleção de período
      setSelectedPeriod(null);
      setCourseData(null);
    } else {
      // Se estiver na seleção de período, volta para lista de carometros
      window.location.href = "/carometros";
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fixo Responsivo com altura aumentada para mobile */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto container px-4 sm:px-6 lg:px-8">
          {/* Navegação e Título com altura ajustada */}
          <div className="h-20 sm:h-14 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${gradientClasses.text} font-sans relative inline-block after:content-[''] after:block after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:mx-auto after:mt-2 after:rounded-full`}
            >
              {selectedPeriod
                ? `Carometro - ${courseName} - ${selectedPeriod}`
                : `Carometro - ${courseName}`}
            </h1>
          </div>

          {/* Barra de Busca e Seletor com mais espaço */}
          {selectedPeriod &&
            courseData?.groups &&
            courseData.groups.length > 0 && (
              <div className="py-4 sm:py-2 space-y-3 sm:space-y-0 sm:flex sm:gap-2 mb-2 sm:mb-0">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {searchTerm.startsWith("ra:") ? "RA" : "Nome"}
                  </div>
                </div>

                {/* Seletor de Grupo Atualizado */}
                <div className="relative shrink-0 sm:w-64">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <span className="truncate">
                      {searchTerm &&
                      courseData.groups.find((g) => g.name === searchTerm)
                        ? `${searchTerm} (${
                            courseData.groups.find((g) => g.name === searchTerm)
                              ?.students.length || 0
                          } alunos)`
                        : "Todos os Grupos"}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 font-medium text-blue-600"
                      >
                        Todos os Grupos (
                        {courseData.groups.reduce(
                          (acc, group) => acc + group.students.length,
                          0
                        )}{" "}
                        alunos)
                      </button>
                      <div className="h-px bg-gray-200 my-1" />
                      {courseData.groups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            setSearchTerm(group.name);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="truncate">{group.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {group.students.length} alunos
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </header>

      {/* Container Principal com padding top aumentado */}
      <div className="mx-auto container min-h-screen pt-48 sm:pt-48">
        <div className="px-2 sm:px-6 lg:px-8 mt-6 sm:mt-0">
          {!selectedPeriod ? (
            <div className="mt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {availablePeriods.map((period) => {
                  const stats = periodStats[period] || {
                    groups: 0,
                    students: 0,
                  };
                  const config = courseConfig[courseName];

                  return (
                    <div key={period} className="flex">
                      <button
                        onClick={() => loadPeriodData(period)}
                        className="w-full bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col p-6"
                      >
                        <div className="flex-1 flex flex-col">
                          {/* Header do Card */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`p-3 rounded-lg ${config.lightColor}`}
                            >
                              <CalendarIcon
                                className={`w-6 h-6 ${config.iconColor}`}
                              />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800">
                                Período {period}
                              </h3>
                            </div>
                          </div>

                          {/* Estatísticas */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div
                              className={`${config.lightColor} rounded-lg p-3`}
                            >
                              <p className="text-sm text-gray-600">Grupos</p>
                              <p className="text-xl font-semibold text-gray-800">
                                {stats.groups}
                              </p>
                            </div>
                            <div
                              className={`${config.lightColor} rounded-lg p-3`}
                            >
                              <p className="text-sm text-gray-600">Alunos</p>
                              <p className="text-xl font-semibold text-gray-800">
                                {stats.students}
                              </p>
                            </div>
                          </div>

                          {/* Botão Visualizar */}
                          <div className="mt-auto">
                            <div
                              className={`flex items-center justify-between px-4 py-2 rounded-lg bg-gradient-to-r ${config.color} text-white opacity-90 group-hover:opacity-100 transition-opacity`}
                            >
                              <span className="font-medium">
                                Visualizar turmas
                              </span>
                              <span className="text-lg">→</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !courseData?.groups?.length ? (
            // Mensagem quando não há grupos
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className={`p-4 rounded-xl ${courseConfig[courseName].lightColor} mb-4`}
              >
                <CalendarIcon
                  className={`w-12 h-12 ${courseConfig[courseName].iconColor}`}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum grupo encontrado
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Não há grupos ou alunos cadastrados para {courseName} no período{" "}
                {selectedPeriod}. Os grupos podem ser criados na área da
                secretaria.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {courseData?.groups
                ?.filter((group) => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  if (search.startsWith("ra:")) {
                    const ra = search.substring(3);
                    return group.students.some((student) =>
                      student.ra.toLowerCase().includes(ra)
                    );
                  }
                  return (
                    group.name.toLowerCase().includes(search) ||
                    group.students.some((student) =>
                      student.name.toLowerCase().includes(search)
                    )
                  );
                })
                .map((group, index) => (
                  <div
                    key={group.id}
                    className={`bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-200 transition-all duration-200 overflow-hidden max-w-full ${
                      index === 0 ? "mt-[80px] sm:mt-0" : "mt-6 sm:mt-0"
                    }`}
                  >
                    {/* Cabeçalho do Grupo com padding ajustado para mobile */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3
                          className={`text-lg font-medium ${gradientClasses.text} mb-2 sm:mb-0`}
                        >
                          {group.name}
                        </h3>
                        <span className="px-3 py-1 bg-gray-50 rounded-full text-sm text-gray-600 self-start sm:self-auto">
                          {group.students.length} alunos
                        </span>
                      </div>
                    </div>

                    {/* Container dos cards de alunos */}
                    <div className="p-3 sm:p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                        {group.students.map((student) => (
                          <div key={student.id} className="flex flex-col">
                            <button
                              onClick={() =>
                                student.photoUrl &&
                                setSelectedPhoto({
                                  url: student.photoUrl,
                                  name: student.name,
                                })
                              }
                              className="relative w-full pt-[100%]"
                            >
                              <div className="absolute inset-0 rounded-lg overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                                {student.photoUrl ? (
                                  <>
                                    <Image
                                      src={student.photoUrl}
                                      alt={student.name}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                    />
                                  </>
                                ) : (
                                  <div
                                    className={`absolute inset-0 ${gradientClasses.bg} bg-opacity-10 flex items-center justify-center`}
                                  >
                                    <span className="text-2xl text-blue-600 font-medium">
                                      {student.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>

                            <div className="mt-2 sm:mt-3 w-full text-center">
                              <p className="text-xs font-medium text-blue-600 mb-0.5 sm:mb-1">
                                {student.ra}
                              </p>
                              <p
                                className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 hover:line-clamp-none transition-all"
                                title={student.name}
                              >
                                {student.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto.url}
          studentName={selectedPhoto.name}
        />
      )}
    </div>
  );
}
