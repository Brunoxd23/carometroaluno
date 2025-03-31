"use client";

import Link from "next/link";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 w-full max-w-4xl mt-20 md:mt-0">
        <Link
          href="/secretaria"
          className="flex flex-col items-center p-8 sm:p-12 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <ClipboardDocumentListIcon className="w-16 h-16 sm:w-24 sm:h-24 text-primary mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Área da Secretaria
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Criar e gerenciar grupos de alunos por curso
          </p>
        </Link>

        <Link
          href="/carometros"
          className="flex flex-col items-center p-8 sm:p-12 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <UserGroupIcon className="w-16 h-16 sm:w-24 sm:h-24 text-primary mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Ver Carometros
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Visualizar carometros por curso
          </p>
        </Link>
      </div>
    </div>
  );
}
