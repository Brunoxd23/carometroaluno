export type Course = "Engenharia" | "Fisioterapia" | "Nutrição" | "Odontologia";
export type Period = `${number}-${number}`;

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
