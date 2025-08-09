export type Course = "Engenharia" | "Fisioterapia" | "Nutrição" | "Odontologia";
export type Period = `${number}-${number}`;

export type UserRole =
  | "admin"
  | "secretaria"
  | "coordenador"
  | "docente"
  | "funcionario";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  courses?: Course[]; // Cursos que o coordenador/docente tem acesso
  image?: string;
}

export interface Student {
  id: string;
  name: string;
  ra: string;
  photoUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  students: Student[];
}

export interface CourseGroup {
  course: Course;
  period: Period;
  groups: {
    id: string;
    name: string;
    students: {
      id: string;
      name: string;
      ra: string;
      photoUrl?: string;
    }[];
  }[];
}
