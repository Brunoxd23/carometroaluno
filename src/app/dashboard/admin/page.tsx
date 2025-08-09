"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { User, UserRole, Course } from "@/types";
import Toast from "@/components/Toast";

// Interface para o usuário da sessão
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

// Interface para usuário com id como string
interface AdminUser extends Omit<User, "id"> {
  id: string;
  _id?: string;
}

// Lista de roles disponíveis
const userRoles: UserRole[] = [
  "admin",
  "secretaria",
  "coordenador",
  "docente",
  "funcionario",
];

// Lista de cursos disponíveis
const availableCourses: Course[] = [
  "Engenharia",
  "Fisioterapia",
  "Nutrição",
  "Odontologia",
];

// Componente para gerenciar usuários (apenas admin)
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "funcionario" as UserRole,
    courses: [] as Course[],
  });

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Resetar form quando o modal abrir/fechar ou mudar o usuário selecionado
  useEffect(() => {
    if (isModalOpen) {
      if (selectedUser) {
        setFormData({
          name: selectedUser.name || "",
          email: selectedUser.email || "",
          password: "", // Não preenchemos a senha ao editar
          role: selectedUser.role || "funcionario",
          courses: selectedUser.courses || [],
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "funcionario",
          courses: [],
        });
      }
    }
  }, [isModalOpen, selectedUser]);

  // Buscar usuários ao carregar a página
  useEffect(() => {
    async function fetchUsers() {
      // Só buscar quando a sessão estiver carregada
      if (status !== "authenticated") return;

      try {
        setError(null);
        console.log("Fazendo requisição para /api/admin/users");

        const response = await fetch("/api/admin/users", {
          credentials: "include", // Importante para enviar cookies de autenticação
        });

        console.log("Status da resposta:", response.status);

        if (response.status === 403) {
          setError("Você não tem permissão para acessar esta página.");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Verificar se data é um array
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error(
            "Dados de usuários não estão em formato de array:",
            data
          );
          setUsers([]);
          setError("Formato de dados inválido recebido do servidor");
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setError(
          error instanceof Error ? error.message : "Erro ao carregar usuários"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [status]);

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para lidar com checkboxes de cursos
  const handleCourseToggle = (course: Course) => {
    setFormData((prev) => {
      const courseExists = prev.courses.includes(course);

      if (courseExists) {
        return { ...prev, courses: prev.courses.filter((c) => c !== course) };
      } else {
        return { ...prev, courses: [...prev.courses, course] };
      }
    });
  };

  // Função para salvar usuário (criar ou atualizar)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validações básicas
      if (!formData.name.trim() || !formData.email.trim()) {
        setToast({ message: "Nome e email são obrigatórios", type: "error" });
        return;
      }

      if (!selectedUser && !formData.password) {
        setToast({
          message: "Senha é obrigatória para novos usuários",
          type: "error",
        });
        return;
      }

      // Se for coordenador ou docente, precisa ter pelo menos um curso
      if (
        ["coordenador", "docente"].includes(formData.role) &&
        formData.courses.length === 0
      ) {
        setToast({
          message: `${
            formData.role === "coordenador" ? "Coordenadores" : "Docentes"
          } precisam ter pelo menos um curso associado`,
          type: "error",
        });
        return;
      }

      // Preparar dados para envio
      const userData = {
        ...formData,
        // Não enviar a senha se estiver vazia (edição de usuário)
        ...(formData.password ? { password: formData.password } : {}),
      };

      const url = selectedUser
        ? `/api/admin/users/${selectedUser.id || selectedUser._id}`
        : "/api/admin/users";

      const method = selectedUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar usuário");
      }

      // Atualizar lista de usuários
      if (selectedUser) {
        // Edição: atualizar o usuário na lista
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id || user._id === selectedUser._id
              ? { ...user, ...userData }
              : user
          )
        );
        setToast({
          message: "Usuário atualizado com sucesso",
          type: "success",
        });
      } else {
        // Criação: adicionar à lista e buscar todos novamente para ter o ID correto
        const refreshResponse = await fetch("/api/admin/users");
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (Array.isArray(refreshData)) {
            setUsers(refreshData);
          }
        } else {
          // Fallback: adicionar à lista com ID temporário
          setUsers((prev) => [
            ...prev,
            { id: `temp-${Date.now()}`, ...userData },
          ]);
        }
        setToast({ message: "Usuário criado com sucesso", type: "success" });
      }

      // Fechar modal
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Erro ao salvar usuário",
        type: "error",
      });
    }
  };

  // Função para excluir usuário
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao excluir usuário");
      }

      // Remover da lista
      setUsers((prev) =>
        prev.filter((user) => user.id !== userId && user._id !== userId)
      );
      setToast({ message: "Usuário excluído com sucesso", type: "success" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Erro ao excluir usuário",
        type: "error",
      });
    }
  };

  // Mostrar carregamento enquanto verifica sessão
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar se o usuário é admin
  if (session?.user && (session.user as SessionUser).role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg text-center max-w-md">
          <ShieldExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 font-bold text-xl mb-2">Acesso Negado</h2>
          <p className="text-red-500 mb-4">
            Você não tem permissão para acessar esta área. Esta seção é
            exclusiva para administradores.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro se houver
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg text-center max-w-md">
          <ShieldExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 font-bold text-xl mb-2">Erro</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Toast notifications */}
      {toast && (
        <div className="fixed top-24 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={3000}
            showProgress
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Gerenciar Usuários
          </h1>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Novo Usuário
          </button>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Usuários
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {users.length} usuários encontrados
            </p>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Função
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cursos
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id || user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.courses && user.courses.length > 0
                          ? user.courses.join(", ")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Editar usuário"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteUser(user.id || user._id || "")
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Excluir usuário"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">Nenhum usuário encontrado.</p>
              <p className="text-sm text-gray-400 mt-2">
                Clique em &quot;Novo Usuário&quot; para adicionar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-6">
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Senha (obrigatória apenas para novos usuários) */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha{" "}
                  {selectedUser ? "(deixe em branco para não alterar)" : ""}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!selectedUser}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Função (Role) */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Função
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cursos (visível apenas para coordenadores e docentes) */}
              {(formData.role === "coordenador" ||
                formData.role === "docente") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cursos
                  </label>
                  <div className="space-y-2">
                    {availableCourses.map((course) => (
                      <div key={course} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`course-${course}`}
                          checked={formData.courses.includes(course)}
                          onChange={() => handleCourseToggle(course)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`course-${course}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {course}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.courses.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      Selecione pelo menos um curso
                    </p>
                  )}
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedUser ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
