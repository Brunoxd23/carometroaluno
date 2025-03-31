"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/", icon: HomeIcon, label: "Início" },
  { href: "/secretaria", icon: ClipboardIcon, label: "Secretaria" },
  { href: "/carometros", icon: UserGroupIcon, label: "Carometros" },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="flex items-center justify-between h-20">
          {/* Logo e título com efeito hover */}
          <Link href="/" className="flex items-center group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative -my-4">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="h-12 border-l border-gray-200 pl-3 flex items-center ml-2">
              <span className="relative text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                Carometro
                <span className="hidden sm:inline font-medium"> Alunos</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
              </span>
            </div>
          </Link>

          {/* Menu Desktop com efeitos hover */}
          <nav className="hidden md:flex items-center gap-6">
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
