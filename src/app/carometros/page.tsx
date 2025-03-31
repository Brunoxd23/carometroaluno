"use client";

import { Course } from "@/types";
import {
  AcademicCapIcon,
  HeartIcon,
  ClipboardDocumentIcon,
  BeakerIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { gradientClasses } from "@/styles/shared";
import { useEffect, useState, useCallback } from "react";

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

interface CourseGroup {
  course: string;
  period: string;
  groups: Array<{
    name: string;
    students: Array<{ name: string; photoUrl?: string }>;
  }>;
}

export default function CarometrosPage() {
  const [courseStats, setCourseStats] = useState<
    Record<
      Course,
      {
        groups: number;
        students: number;
        activePeriods: number;
      }
    >
  >({
    Engenharia: { groups: 0, students: 0, activePeriods: 0 },
    Fisioterapia: { groups: 0, students: 0, activePeriods: 0 },
    Nutrição: { groups: 0, students: 0, activePeriods: 0 },
    Odontologia: { groups: 0, students: 0, activePeriods: 0 },
  });

  const countStats = useCallback(() => {
    const stats: Record<
      Course,
      {
        groups: number;
        students: number;
        activePeriods: number;
      }
    > = {
      Engenharia: { groups: 0, students: 0, activePeriods: 0 },
      Fisioterapia: { groups: 0, students: 0, activePeriods: 0 },
      Nutrição: { groups: 0, students: 0, activePeriods: 0 },
      Odontologia: { groups: 0, students: 0, activePeriods: 0 },
    };

    Object.keys(courseConfig).forEach((course) => {
      const courseData = JSON.parse(
        localStorage.getItem("carometro-groups") || "[]"
      ) as CourseGroup[];
      const courseGroups = courseData.filter((g) => g.course === course);

      courseGroups.forEach((group) => {
        if (group.groups && group.groups.length > 0) {
          stats[course as Course].groups += group.groups.length;
          stats[course as Course].students += group.groups.reduce(
            (acc, g) => acc + (g.students?.length || 0),
            0
          );
          stats[course as Course].activePeriods += 1;
        }
      });
    });

    setCourseStats(stats);
  }, []);

  useEffect(() => {
    countStats();
    window.addEventListener("storage", countStats);
    return () => window.removeEventListener("storage", countStats);
  }, [countStats]);

  return (
    <>
      {/* Header Fixo com Borda e Padding Ajustado */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed top-16 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-24">
            {" "}
            {/* Aumentado height */}
            <Link
              href="/"
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </Link>
            <h1
              className={`
              text-2xl sm:text-3xl
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
              after:mt-3
              after:rounded-full
            `}
            >
              Carometros por Curso
            </h1>
          </div>
        </div>
      </header>

      {/* Container Principal com Padding Aumentado */}
      <main className="pt-48 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {" "}
        {/* Aumentado pt-48 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {" "}
          {/* Aumentado gap-8 */}
          {(Object.keys(courseConfig) as Course[]).map((course) => {
            const config = courseConfig[course];
            const Icon = config.icon;
            const stats = courseStats[course];

            return (
              <Link
                key={course}
                href={`/carometros/${course.toLowerCase()}`}
                className={`
                  bg-white/95 
                  backdrop-blur-sm 
                  rounded-xl 
                  shadow-sm 
                  overflow-hidden 
                  border border-gray-100 
                  ${config.borderHover} 
                  hover:shadow-lg 
                  hover:-translate-y-1 
                  transition-all 
                  duration-300 
                  group
                `}
              >
                <div className="p-5">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`p-3 rounded-xl ${config.lightColor}`}>
                      <Icon className={`w-7 h-7 ${config.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">
                        {course}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {stats.activePeriods > 0
                          ? `${stats.activePeriods} ${
                              stats.activePeriods === 1 ? "período" : "períodos"
                            }`
                          : "Sem períodos"}
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div
                      className={`${config.lightColor} rounded-lg p-2 text-center`}
                    >
                      <p className={`text-xl font-bold ${config.iconColor}`}>
                        {stats.groups}
                      </p>
                      <p className="text-xs text-gray-600">Grupos</p>
                    </div>
                    <div
                      className={`${config.lightColor} rounded-lg p-2 text-center`}
                    >
                      <p className={`text-xl font-bold ${config.iconColor}`}>
                        {stats.students}
                      </p>
                      <p className="text-xs text-gray-600">Alunos</p>
                    </div>
                  </div>

                  {/* Botão Visualizar */}
                  <div
                    className={`
                    flex items-center justify-between 
                    px-4 py-2.5 
                    rounded-lg 
                    bg-gradient-to-r ${config.color}
                    text-white 
                    opacity-90 
                    group-hover:opacity-100 
                    transition-all
                  `}
                  >
                    <span className="font-medium">Visualizar</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
