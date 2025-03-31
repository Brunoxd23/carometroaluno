"use client";

import { useState } from "react";
import type { Group } from "@/types";
import {
  PlusCircleIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import FotoUpload from "./FotoUpload";

interface GroupListProps {
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
}

export default function GroupList({ groups, onUpdateGroups }: GroupListProps) {
  const [newStudentName, setNewStudentName] = useState("");

  const addGroup = () => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: `Grupo ${groups.length + 1}`,
      students: [],
    };
    onUpdateGroups([...groups, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    onUpdateGroups(groups.filter((g) => g.id !== groupId));
  };

  const addStudent = (groupId: string) => {
    if (!newStudentName.trim()) return;

    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          students: [
            ...group.students,
            {
              id: `student-${Date.now()}`,
              name: newStudentName,
              photoUrl: "",
              ra: "",
            },
          ],
        };
      }
      return group;
    });

    onUpdateGroups(updatedGroups);
    setNewStudentName("");
  };

  const removeStudent = (groupId: string, studentId: string) => {
    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          students: group.students.filter((s) => s.id !== studentId),
        };
      }
      return group;
    });

    onUpdateGroups(updatedGroups);
  };

  const updateStudentPhoto = async (
    groupId: string,
    studentId: string,
    photoUrl: string
  ) => {
    console.log("Updating photo:", { groupId, studentId, photoUrl });

    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          students: group.students.map((student) =>
            student.id === studentId
              ? { ...student, photoUrl: photoUrl }
              : student
          ),
        };
      }
      return group;
    });

    console.log("Updated groups:", updatedGroups);
    onUpdateGroups(updatedGroups);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={addGroup}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        <PlusCircleIcon className="w-5 h-5" />
        Novo Grupo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <button
                onClick={() => deleteGroup(group.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {group.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                >
                  <FotoUpload
                    onUpload={(url) => {
                      console.log("Photo uploaded:", url);
                      updateStudentPhoto(group.id, student.id, url);
                    }}
                    fotoAtual={student.photoUrl}
                  />
                  <div className="flex-1">
                    <span className="block">{student.name}</span>
                    <input
                      type="text"
                      placeholder="RA do aluno"
                      className="text-sm text-gray-500 mt-1 px-2 py-1 border rounded"
                      value={student.ra || ""}
                      onChange={(e) => {
                        const updatedGroups = groups.map((g) => {
                          if (g.id === group.id) {
                            return {
                              ...g,
                              students: g.students.map((s) =>
                                s.id === student.id
                                  ? { ...s, ra: e.target.value }
                                  : s
                              ),
                            };
                          }
                          return g;
                        });
                        onUpdateGroups(updatedGroups);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeStudent(group.id, student.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nome do aluno"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={() => addStudent(group.id)}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <UserPlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {group.students.length} alunos
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
