export interface Card {
    id: string;
    title: string;
    sub_title: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    priority: "low" | "medium" | "high";
    learning_strategy: string;
    archived?: boolean;
}

export interface ListType {
    id: string;
    title: string;
    cards: Card[];
    isAddingCard: boolean;
}
