import { useState, useEffect } from 'react';

interface TaskInfoProps {
    card: {
        id: string;
        title: string;
        sub_title: string;
        description?: string;
    };
    onUpdateTitle: (cardId: string, newTitle: string) => void;
    onUpdateSubTitle: (cardId: string, newSubTitle: string) => void;
    onUpdateDescription: (cardId: string, newDescription: string) => void;
}

export default function TaskInfo({
    card,
    onUpdateTitle,
    onUpdateSubTitle,
    onUpdateDescription,
}: TaskInfoProps) {
    const [title, setTitle] = useState(card.title);
    const [subTitle, setSubTitle] = useState(card.sub_title);
    const [description, setDescription] = useState(card.description || '');

    // Sync with props if card changes
    useEffect(() => {
        setTitle(card.title);
        setSubTitle(card.sub_title);
        setDescription(card.description || '');
    }, [card]);

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        onUpdateTitle(card.id, newTitle);
    };

    const handleSubTitleChange = (newSubTitle: string) => {
        setSubTitle(newSubTitle);
        onUpdateSubTitle(card.id, newSubTitle);
    };

    const handleDescriptionChange = (newDescription: string) => {
        setDescription(newDescription);
        onUpdateDescription(card.id, newDescription);
    };

    return (
        <div>
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-center font-bold text-2xl p-2 border rounded"
                    placeholder="Task Title"
                />
            </h2>

            {/* Sub-title */}
            <div className="mb-4">
                <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => handleSubTitleChange(e.target.value)}
                    className="w-full text-center text-lg p-2 border rounded"
                    placeholder="Sub-title"
                />
            </div>

            {/* Description */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="w-full border border-gray-300 rounded p-3"
                    rows={5}
                    placeholder="Add task details..."
                />
            </div>
        </div>
    );
}
