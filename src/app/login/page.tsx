"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CameraIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (status === "authenticated" && !loginSuccess) {
      router.push("/dashboard");
    }
  }, [status, router, loginSuccess]);

  // Efeito para recarregar a página após login bem-sucedido
  useEffect(() => {
    if (loginSuccess) {
      // Pequeno atraso para mostrar o loading
      const timer = setTimeout(() => {
        // Usar window.location para forçar recarregamento completo da página
        window.location.href = "/dashboard";
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Criar cópias temporárias e depois limpar o estado original
      const tempEmail = email;
      const tempPassword = password;

      // Limpar os campos de formulário imediatamente
      setEmail("");
      setPassword("");

      // Login com NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email: tempEmail,
        password: tempPassword,
      });

      if (result?.error) {
        setError("Email ou senha incorretos");
        setIsLoading(false);
        return;
      }

      // Marcar login como bem-sucedido para ativar o efeito de recarregamento
      setLoginSuccess(true);
    } catch (err) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
      console.error("Erro de login:", err);
      setIsLoading(false);
    }
  };

  // Se login foi bem-sucedido, mostrar loading de redirecionamento
  if (loginSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-700 font-medium">Entrando no sistema...</p>
      </div>
    );
  }

  // Se já estiver autenticado, mostrar carregamento
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Componente de fallback elegante para o logo
  const LogoFallback = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center mb-1">
        <div className="bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg p-2 mr-2">
          <CameraIcon className="h-8 w-8 text-white" />
        </div>
        <UserGroupIcon className="h-10 w-10 text-white" />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-white text-xl tracking-wider">
          CARÔMETRO
        </h3>
        <div className="h-1 w-16 bg-white/60 mx-auto rounded-full mt-1"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6">
          <div className="flex justify-center">
            <div className="w-44 h-24 relative flex items-center justify-center">
              {imageError ? (
                <LogoFallback />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="Carômetro Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    priority={true}
                    className="object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
            </div>
          </div>
          <h2 className="mt-2 text-center text-2xl font-bold text-white">
            Acesse sua conta
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <EyeIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Aguarde..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
