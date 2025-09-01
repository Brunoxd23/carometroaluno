"use client";

import Link from "next/link";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 pt-20">
      <div className="mb-8 w-full max-w-2xl margin-right: auto;">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bem-vindo, {user?.name || "usuário"}!
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-4xl mx-auto mt-0">
        <Link
          href="/secretaria"
          className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-[270px] w-full mx-auto"
        >
          <ClipboardDocumentListIcon className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Área da Secretaria
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Criar e gerenciar grupos de alunos por curso
          </p>
        </Link>

        <Link
          href="/carometros"
          className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-[270px] w-full mx-auto"
        >
          <UserGroupIcon className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Ver Carometros
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Visualizar carometros por curso
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-[270px] w-full mx-auto"
        >
          <Cog6ToothIcon className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Administração
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Configurações e permissões do sistema
          </p>
        </Link>
      </div>
    </div>
  );
}
