export interface Lesson {
  dayNumber: number;
  title: string;
  content: string;
  status: "locked" | "in-progress" | "completed";
}

export interface Plan {
  _id: string;
  title: string;
  duration: number;
}