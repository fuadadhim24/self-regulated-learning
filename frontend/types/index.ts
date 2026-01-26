export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklists {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Links {
  id: string;
  url: string;
}

export interface ColumnMovement {
  fromColumn: string;
  toColumn: string;
  timestamp: string;
}

export interface Card {
  id: string;
  title: string;
  sub_title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  priority: "low" | "medium" | "high" | "critical";
  learning_strategy: string;
  archived?: boolean;
  deleted?: boolean;
  checklists?: Checklists[];
  links?: Links[];
  rating?: number;
  notes?: string;
  pre_test_grade?: string;
  post_test_grade?: string;
  created_at: string;
  column_movements: ColumnMovement[];
}

export interface ListType {
  id: string;
  title: string;
  cards: Card[];
  isAddingCard: boolean;
}

export interface LearningStrategy {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: string;
}

export interface Board {
  id: string;
  name: string;
  lists: ListType[];
}
