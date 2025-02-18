import type { Card } from "@/types";

interface BoardActionsProps {
    card: Card;
    onUpdate: (key: keyof Card, value: any) => void;
}

export default function BoardActions({ card, onUpdate }: BoardActionsProps) {
    return (
        <div>
            <input
                type="text"
                value={card.title}
                onChange={(e) => onUpdate("title", e.target.value)}
            />
            <input
                type="text"
                value={card.sub_title}
                onChange={(e) => onUpdate("sub_title", e.target.value)}
            />
            <textarea
                value={card.description || ""}
                onChange={(e) => onUpdate("description", e.target.value)}
            />
            <select
                value={card.difficulty}
                onChange={(e) => onUpdate("difficulty", e.target.value as "easy" | "medium" | "hard")}
            >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
    );
}
