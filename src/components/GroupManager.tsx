"use client";

import { useState } from "react";
import { Group } from "@/types";
import {
  TrashIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Toast from "./Toast";

interface GroupManagerProps {
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
}

interface DeleteConfirmationProps {
  name: string;
  type: "group" | "student";
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({
  name,
  type,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  const title =
    type === "group" ? "Confirmar exclusão do grupo" : "Confirmar exclusão";
  const message =
    type === "group"
      ? `Tem certeza que deseja excluir o grupo "${name}" e todos os seus alunos?`
      : `Tem certeza que deseja excluir o aluno "${name}"?`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupManager({
  groups,
  onUpdateGroups,
  curso,
}: GroupManagerProps & { curso: string }) {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [groupInputs, setGroupInputs] = useState<Record<string, string>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    name: string;
    type: "group" | "student";
    groupId?: string;
  } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCourse] = useState<string>(curso);
  const [selectedPeriod] = useState<string | null>(null);

  const searchStudent = async (ra: string) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/students?ra=${ra}&curso=${curso}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar aluno");
      }

      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao buscar aluno");
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const addGroup = () => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: `Grupo ${groups.length + 1}`,
      students: [],
    };
    handleUpdateGroups([...groups, newGroup]);
  };

  const confirmDeleteGroup = (groupId: string, name: string) => {
    setDeleteConfirmation({ id: groupId, name, type: "group" });
  };

  const addStudent = async (groupId: string) => {
    const ra = groupInputs[groupId]?.trim();
    if (!ra) return;

    const student = await searchStudent(ra);
    if (!student) return;

    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          students: [
            ...group.students,
            {
              id: `student-${Date.now()}`,
              name: student.name,
              ra: student.ra,
              photoUrl: student.photoUrl || "",
            },
          ],
        };
      }
      return group;
    });

    handleUpdateGroups(updatedGroups);
    setGroupInputs((prev) => ({ ...prev, [groupId]: "" }));
    setSuccessMessage(`${student.name} adicionado(a) com sucesso!`);
  };

  const handleRAChange = (groupId: string, value: string) => {
    setGroupInputs((prev) => ({ ...prev, [groupId]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const confirmDeleteStudent = (
    groupId: string,
    studentId: string,
    studentName: string
  ) => {
    setDeleteConfirmation({
      id: studentId,
      name: studentName,
      type: "student",
      groupId,
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "group") {
      handleUpdateGroups(groups.filter((g) => g.id !== deleteConfirmation.id));
      setSuccessMessage(
        `Grupo "${deleteConfirmation.name}" excluído com sucesso`
      );
    } else {
      const updatedGroups = groups.map((group) => {
        if (group.id === deleteConfirmation.groupId) {
          return {
            ...group,
            students: group.students.filter(
              (s) => s.id !== deleteConfirmation.id
            ),
          };
        }
        return group;
      });
      handleUpdateGroups(updatedGroups);
      setSuccessMessage(
        `${deleteConfirmation.name} foi removido(a) com sucesso`
      );
    }
    setDeleteConfirmation(null);
  };

  const handleImageUpload = async (
    groupId: string,
    studentId: string,
    studentName: string,
    file: File
  ) => {
    try {
      setIsUploadingPhoto({ studentId, studentName });
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const updatedGroups = groups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              students: group.students.map((student) => {
                if (student.id === studentId) {
                  return { ...student, photoUrl: data.secure_url };
                }
                return student;
              }),
            };
          }
          return group;
        });

        handleUpdateGroups(updatedGroups);

        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsUploadingPhoto(null);
        setSuccessMessage("Foto atualizada com sucesso!");
      }
    } catch (error) {
      setIsUploadingPhoto(null);
      setError(
        `Erro ao fazer upload da imagem: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  };

  const scrollToGroup = (groupId: string) => {
    const element = document.getElementById(groupId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setSelectedGroup(groupId);
  };

  const handleUpdateGroups = async (newGroups: Group[]) => {
    if (!selectedCourse || !selectedPeriod) {
      onUpdateGroups(newGroups);
      return;
    }

    const newCourseGroup = {
      course: selectedCourse,
      period: selectedPeriod,
      groups: newGroups,
    };

    try {
      await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourseGroup),
      });

      onUpdateGroups(newGroups);
    } catch (error) {
      console.error("Erro ao salvar grupos:", error);
      setError("Erro ao salvar grupos. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toasts no topo */}
      <div className="fixed right-4 top-24 z-50">
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError(null)}
            duration={3000}
            showProgress
          />
        )}
        {successMessage && (
          <Toast
            message={successMessage}
            type={
              successMessage.includes("excluído") ||
              successMessage.includes("removido")
                ? "error"
                : "success"
            }
            onClose={() => setSuccessMessage(null)}
            duration={2000}
            showProgress
          />
        )}
        {isUploadingPhoto && (
          <Toast
            message={`Carregando foto de ${isUploadingPhoto.studentName}...`}
            type="info"
            showSpinner
            showProgress
            duration={3000}
          />
        )}
      </div>

      {/* Barra de ações fixa */}
      <div className="sticky top-[4.5rem] z-20 bg-gray-50 -mx-6 px-6">
        <div className="py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              onClick={addGroup}
              className={`px-4 py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] transform transition-all duration-200`}
            >
              Adicionar Grupo
            </button>

            {/* Select de Grupos */}
            {groups.length > 0 && (
              <div className="relative flex-1 sm:max-w-xs">
                <select
                  value={selectedGroup || ""}
                  onChange={(e) => scrollToGroup(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">Selecionar grupo...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.students.length} alunos)
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área de conteúdo com padding ajustado */}
      <div className="pt-4 space-y-6">
        {groups.map((group) => (
          <div
            key={group.id}
            id={group.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-colors duration-200 ${
              selectedGroup === group.id
                ? "border-blue-200 shadow-lg"
                : "border-gray-100 hover:border-blue-100"
            }`}
          >
            {/* Cabeçalho do Grupo com botão excluir mais visível */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {group.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {group.students.length} alunos
                </span>
                <button
                  onClick={() => confirmDeleteGroup(group.id, group.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir grupo"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Container de alunos */}
            <div className="relative">
              <div className="p-4 max-h-[480px] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.students.map((student) => (
                    <div
                      key={student.id}
                      className="group flex flex-col bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors relative"
                    >
                      {/* Botão excluir aluno sempre visível com hover */}
                      <button
                        onClick={() =>
                          confirmDeleteStudent(
                            group.id,
                            student.id,
                            student.name
                          )
                        }
                        className="absolute -top-1 -right-1 z-10 p-1.5 bg-red-100 text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all duration-200 transform hover:scale-110"
                        title="Excluir aluno"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>

                      {/* Container da foto */}
                      <div className="relative pb-[100%] rounded-lg overflow-hidden bg-gray-50 mb-2 mt-2">
                        <label className="cursor-pointer absolute inset-0 flex items-center justify-center group/upload">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(
                                  group.id,
                                  student.id,
                                  student.name,
                                  file
                                );
                              }
                            }}
                          />
                          {student.photoUrl ? (
                            <>
                              <Image
                                src={student.photoUrl}
                                alt={student.name}
                                className="object-cover group-hover/upload:opacity-75 transition-opacity"
                                fill
                                sizes="(max-width: 128px) 100vw, 128px"
                              />
                              {isUploadingPhoto?.studentId === student.id ? (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-white text-sm">
                                      Carregando...
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/20 flex items-center justify-center transition-all">
                                  <span className="text-white text-sm font-medium opacity-0 group-hover/upload:opacity-100">
                                    Alterar foto
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 group-hover/upload:bg-gray-200 transition-colors">
                              <span className="text-2xl font-medium text-gray-400 group-hover/upload:text-gray-500">
                                {student.name.charAt(0)}
                              </span>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                <span className="text-gray-600 text-sm font-medium">
                                  Adicionar foto
                                </span>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Informações do aluno */}
                      <div className="text-center mt-2">
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          {student.ra}
                        </p>
                        <p
                          className="text-sm text-gray-800 font-medium truncate"
                          title={student.name}
                        >
                          {student.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de RA com layout melhorado */}
              <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o RA do aluno"
                    value={groupInputs[group.id] || ""}
                    onChange={(e) => handleRAChange(group.id, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => addStudent(group.id)}
                    disabled={isSearching}
                    className={`px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserPlusIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adicionar/Editar Aluno */}
      {/* Modal de Adição/Edição de Aluno */}
      {deleteConfirmation && (
        <DeleteConfirmation
          name={deleteConfirmation.name}
          type={deleteConfirmation.type}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
}
