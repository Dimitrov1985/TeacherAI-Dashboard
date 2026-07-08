export type AttendanceStatus = "present" | "absent" | "late";

export type Student = {
  name: string;
  grade: string;
  status: AttendanceStatus;
  color: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type ActivityType = "warmup" | "main" | "practice" | "review";

export type DetailedActivity = {
  type: ActivityType;
  title: string;
  duration: string;
  goal: string;
  instructions: string[];
};

export type GeneratedLessonPlan = {
  title: string;
  objectives: string[];
  flashcards: Flashcard[];
  activities: DetailedActivity[] | string[]; // Support both old and new format
  materialsNeeded: string[];
};

export type Material = {
  icon: string;
  title: string;
  meta: string;
  plan?: GeneratedLessonPlan;
};

export type HomeworkStatus = "pending" | "graded" | "overdue";

export type Homework = {
  title: string;
  due: string;
  status: HomeworkStatus;
  done: boolean;
};

export type LessonDetail = {
  icon: string;
  iconBg: string;
  students: Student[];
  materials: Material[];
  homework: Homework[];
};

export const LESSON_DETAILS: Record<string, LessonDetail> = {
  "Applied Science": {
    icon: "🔬",
    iconBg: "#fce4ec",
    students: [
      { name: "Alice Morgan", grade: "10A", status: "present", color: "#e91e63" },
      { name: "Brian Lee", grade: "10A", status: "absent", color: "#9c27b0" },
      { name: "Clara Davis", grade: "10A", status: "present", color: "#3f51b5" },
      { name: "Daniel Kim", grade: "10A", status: "late", color: "#009688" },
      { name: "Eva Hernandez", grade: "10A", status: "present", color: "#ff5722" },
      { name: "Frank Wilson", grade: "10A", status: "present", color: "#607d8b" },
    ],
    materials: [
      { icon: "📄", title: "Lab Report Template", meta: "PDF · 1.2 MB" },
      { icon: "📊", title: "Chapter 4 Slides", meta: "PPT · 3.8 MB" },
      { icon: "🎥", title: "Experiment Video", meta: "MP4 · 24 MB" },
    ],
    homework: [
      { title: "Read Chapter 5 & summarize", due: "Due: Thu, 26 Jun", status: "pending", done: false },
      { title: "Lab report write-up", due: "Due: Fri, 27 Jun", status: "pending", done: false },
      { title: "Quiz preparation (Ch. 1–4)", due: "Due: Mon, 30 Jun", status: "graded", done: true },
    ],
  },
  "Technology": {
    icon: "💻",
    iconBg: "#e3f2fd",
    students: [
      { name: "George Park", grade: "11B", status: "present", color: "#1565c0" },
      { name: "Hannah Scott", grade: "11B", status: "present", color: "#6a1b9a" },
      { name: "Ivan Torres", grade: "11B", status: "absent", color: "#558b2f" },
      { name: "Julia White", grade: "11B", status: "late", color: "#d84315" },
    ],
    materials: [
      { icon: "📄", title: "HTML/CSS Basics", meta: "PDF · 0.9 MB" },
      { icon: "🔗", title: "MDN Web Docs Link", meta: "Link" },
    ],
    homework: [
      { title: "Build a simple webpage", due: "Due: Fri, 27 Jun", status: "pending", done: false },
      { title: "CSS layout exercise", due: "Due: Mon, 30 Jun", status: "overdue", done: false },
    ],
  },
  "UX Design": {
    icon: "🎨",
    iconBg: "#fffde7",
    students: [
      { name: "Karen Adams", grade: "12A", status: "present", color: "#f57f17" },
      { name: "Leo Martinez", grade: "12A", status: "present", color: "#0277bd" },
      { name: "Mia Johnson", grade: "12A", status: "present", color: "#2e7d32" },
      { name: "Noah Brown", grade: "12A", status: "absent", color: "#6a1b9a" },
      { name: "Olivia Clark", grade: "12A", status: "late", color: "#c62828" },
    ],
    materials: [
      { icon: "📄", title: "Design Principles PDF", meta: "PDF · 2.1 MB" },
      { icon: "🖼️", title: "Figma Prototype", meta: "Figma Link" },
      { icon: "📊", title: "UX Research Slides", meta: "PPT · 5.2 MB" },
    ],
    homework: [
      { title: "User persona assignment", due: "Due: Sat, 28 Jun", status: "pending", done: false },
      { title: "Wireframe mockup in Figma", due: "Due: Mon, 30 Jun", status: "graded", done: true },
    ],
  },
  "Artificial Intelligence": {
    icon: "🤖",
    iconBg: "#e0f7fa",
    students: [
      { name: "Paul Garcia", grade: "12B", status: "present", color: "#006064" },
      { name: "Quinn Lewis", grade: "12B", status: "present", color: "#1a237e" },
      { name: "Rachel Hall", grade: "12B", status: "present", color: "#880e4f" },
      { name: "Sam Young", grade: "12B", status: "absent", color: "#bf360c" },
      { name: "Tina Allen", grade: "12B", status: "late", color: "#1b5e20" },
      { name: "Uma King", grade: "12B", status: "present", color: "#4a148c" },
      { name: "Victor Wright", grade: "12B", status: "present", color: "#33691e" },
    ],
    materials: [
      { icon: "📄", title: "Intro to Neural Networks", meta: "PDF · 3.4 MB" },
      { icon: "🎥", title: "ML Lecture Recording", meta: "MP4 · 180 MB" },
    ],
    homework: [
      { title: "Train simple classifier", due: "Due: Fri, 27 Jun", status: "pending", done: false },
      { title: "Read: ML Yearning Ch.1–5", due: "Due: Sun, 29 Jun", status: "overdue", done: false },
      { title: "Python NumPy exercises", due: "Due: Mon, 30 Jun", status: "graded", done: true },
    ],
  },
  "Business Management": {
    icon: "💼",
    iconBg: "#fff3e0",
    students: [
      { name: "Wendy Scott", grade: "11A", status: "present", color: "#e65100" },
      { name: "Xander Lee", grade: "11A", status: "present", color: "#0d47a1" },
      { name: "Yara Patel", grade: "11A", status: "absent", color: "#4a148c" },
      { name: "Zoe Turner", grade: "11A", status: "late", color: "#1b5e20" },
    ],
    materials: [
      { icon: "📄", title: "Market Analysis Template", meta: "PDF · 1.0 MB" },
      { icon: "📊", title: "Business Case Slides", meta: "PPT · 2.7 MB" },
    ],
    homework: [
      { title: "SWOT analysis for chosen company", due: "Due: Mon, 30 Jun", status: "pending", done: false },
    ],
  },
};
