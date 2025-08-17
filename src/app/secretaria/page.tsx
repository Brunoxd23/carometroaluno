"use client";

import React, { useState, useEffect } from "react";
import { Course, Period, CourseGroup, Group } from "@/types";
import GroupManager from "@/components/GroupManager";
import {
  ArrowLeftIcon,
  BeakerIcon,
  AcademicCapIcon,
  HeartIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { gradientClasses } from "@/styles/shared";

const courses: Course[] = [
  "Engenharia",
  "Fisioterapia",
  "Nutrição",
  "Odontologia",
];

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
  },
  Fisioterapia: {
    icon: HeartIcon,
    color: "from-pink-600 to-rose-500",
    lightColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  Nutrição: {
    icon: ClipboardDocumentIcon,
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

/* FotoUpload component removed because it was defined but never used. */

export default function SecretariaPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>(() => {
    // Load saved data from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("carometro-groups");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showCourseSelector, setShowCourseSelector] = useState(true);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);

    // Verificar se existem grupos salvos para este curso
    const existingGroups = courseGroups.filter(
      (group) => group.course === course
    );
    if (existingGroups.length > 0) {
      // Se existirem grupos, mostrar períodos disponíveis
      setShowCourseSelector(false);
    }
    // Resetar período selecionado
    setSelectedPeriod(null);
  };

  const handlePeriodSelect = (period: Period) => {
    setSelectedPeriod(period);
    setSelectedPeriod(period);
    setShowCourseSelector(false);
  };

  // Função para retornar à seleção de curso/período
  const handleBackToSelection = () => {
    setShowCourseSelector(true);
  };

  // Função para buscar dados dos grupos diretamente da API
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch("/api/groups?all=true");
        if (!response.ok) {
          throw new Error("Erro ao buscar grupos");
        }
        const data = await response.json();
        setCourseGroups(data);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      }
    }

    fetchGroups();
  }, []);

  // Atualizar grupos e sincronizar com o backend
  const handleUpdateGroups = async (newGroups: Group[]) => {
    if (!selectedCourse || !selectedPeriod) return;

    try {
      await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: selectedCourse,
          period: selectedPeriod,
          groups: newGroups,
        }),
      });

      const updatedGroups = courseGroups.filter(
        (cg) => cg.course !== selectedCourse || cg.period !== selectedPeriod
      );

      const newCourseGroup: CourseGroup = {
        course: selectedCourse,
        period: selectedPeriod,
        groups: newGroups,
      };

      const finalGroups = [...updatedGroups, newCourseGroup];
      setCourseGroups(finalGroups);
    } catch (error) {
      console.error("Erro ao salvar grupos:", error);
    }
  };

  const getCurrentGroups = () => {
    if (!selectedCourse || !selectedPeriod) return [];
    const current = courseGroups.find(
      (cg) => cg.course === selectedCourse && cg.period === selectedPeriod
    );
    return current?.groups || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Header Fixo */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showCourseSelector ? (
                <button
                  onClick={handleBackToSelection}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
              ) : (
                <Link
                  href="/"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                </Link>
              )}
              <h1
                className={`
                text-xl sm:text-2xl lg:text-3xl
                font-extrabold
                tracking-tight
                ${gradientClasses.text}
                font-sans
                relative
                inline-block
                after:content-['']
                after:block
                after:w-full
                after:h-1
                after:bg-gradient-to-r
                after:from-blue-500
                after:to-purple-500
                after:mx-auto
                after:mt-2
                after:rounded-full
              `}
              >
                {selectedCourse && selectedPeriod ? (
                  <>
                    Gerenciar {selectedCourse} - {selectedPeriod}
                  </>
                ) : (
                  "Gerenciar Carometros"
                )}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2 lg:px-8">
          {showCourseSelector ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {courses.map((course) => {
                const config = courseConfig[course];
                const Icon = config.icon;

                return (
                  <div
                    key={course}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className={`p-6 border-b border-gray-100`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${config.lightColor}`}>
                          <Icon className={`w-8 h-8 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {course}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {coursePeriods[course].map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              handleCourseSelect(course);
                              handlePeriodSelect(period);
                            }}
                            className={`
                              px-4 py-2.5 rounded-lg
                              text-sm font-medium
                              bg-gradient-to-r ${config.color}
                              text-white
                              transform transition-all duration-200
                              hover:scale-[1.02] hover:shadow-md
                              active:scale-95
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${config.iconColor}
                            `}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Conteúdo principal com sidebar e grupos
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Cabeçalho do Curso */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-4 mb-2">
                        <div
                          className={`p-3 rounded-xl ${
                            courseConfig[selectedCourse!].lightColor
                          }`}
                        >
                          {React.createElement(
                            courseConfig[selectedCourse!].icon,
                            {
                              className: `w-6 h-6 ${
                                courseConfig[selectedCourse!].iconColor
                              }`,
                            }
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {selectedCourse}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Período {selectedPeriod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas com cores do curso */}
                    <div className="p-6 space-y-4">
                      <div
                        className={`${
                          courseConfig[selectedCourse!].lightColor
                        } rounded-xl p-6`}
                      >
                        <div className="text-center">
                          <p
                            className={`text-3xl font-bold ${
                              courseConfig[selectedCourse!].iconColor
                            }`}
                          >
                            {getCurrentGroups().length}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              courseConfig[selectedCourse!].iconColor
                            } mt-1 opacity-80`}
                          >
                            Total de Grupos
                          </p>
                        </div>
                      </div>

                      <div
                        className={`${
                          courseConfig[selectedCourse!].lightColor
                        } rounded-xl p-6`}
                      >
                        <div className="text-center">
                          <p
                            className={`text-3xl font-bold ${
                              courseConfig[selectedCourse!].iconColor
                            }`}
                          >
                            {getCurrentGroups().reduce(
                              (acc, group) => acc + group.students.length,
                              0
                            )}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              courseConfig[selectedCourse!].iconColor
                            } mt-1 opacity-80`}
                          >
                            Total de Alunos
                          </p>
                        </div>
                      </div>

                      {/* Botão trocar curso/período */}
                      <button
                        onClick={handleBackToSelection}
                        className={`
                          w-full px-4 py-3 rounded-lg
                          border-2 border-gray-100
                          hover:border-gray-200
                          active:scale-[0.98]
                          font-medium text-gray-600
                          transition-all duration-200
                        `}
                      >
                        Trocar Curso/Período
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Área Principal */}
              <main className="flex-1 lg:min-h-0">
                <GroupManager
                  groups={getCurrentGroups()}
                  onUpdateGroups={handleUpdateGroups}
                  course={selectedCourse!}
                  period={selectedPeriod!} // <-- Passe o período selecionado aqui
                />
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
