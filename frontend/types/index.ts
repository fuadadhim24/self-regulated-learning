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
export interface Card {
    id: string;
    title: string;
    sub_title: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    priority: "low" | "medium" | "high";
    learning_strategy: string;
    archived?: boolean;
    checklists?: Checklists[];
}

export interface ListType {
    id: string;
    title: string;
    cards: Card[];
    isAddingCard: boolean;
}
