"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/", icon: HomeIcon, label: "Início" },
  { href: "/secretaria", icon: ClipboardIcon, label: "Secretaria" },
  { href: "/carometros", icon: UserGroupIcon, label: "Carometros" },
];

export default function Header() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    if (mounted) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isMenuOpen, mounted]);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-20 h-20 sm:w-28 sm:h-28 relative -my-4">
              <Image
                src="/BASE-CAROMETRO.webp"
                alt="Logo"
                fill
                sizes="(max-width: 640px) 5rem, 7rem"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Título Centralizado com Gradiente */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-xl sm:text-2xl font-bold relative">
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Alunos
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-full"></span>
            </h1>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group relative py-2"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium relative">
                    {label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </nav>

            {/* Perfil do usuário */}
            <div className="relative">
              {session?.user ? (
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">
                      {session.user.name}
                    </span>
                  </button>

                  {/* Menu de perfil */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Sair</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm font-medium">Entrar</span>
                </Link>
              )}
            </div>
          </div>

          {/* Menu Mobile mais clean */}
          {mounted && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              )}
            </button>
          )}
          {/* Menu Mobile Overlay com efeito de barrinha */}
          {mounted && isMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pt-20 px-4">
                  <nav className="space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:text-blue-600 rounded-lg group relative"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium relative">
                          {label}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
