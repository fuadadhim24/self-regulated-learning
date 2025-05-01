"use client"

import { Plus, Trash2, LinkIcon } from "lucide-react"

interface WorkLinksProps {
    links: string[]
    onChange: (updatedLinks: string[]) => void
}

export default function WorkLinks({ links, onChange }: WorkLinksProps) {
    const handleLinkChange = (index: number, value: string) => {
        const updated = [...links]
        updated[index] = value
        onChange(updated)
    }

    const addLinkField = () => {
        onChange([...links, ""])
    }

    const removeLink = (index: number) => {
        let updated = links.filter((_, i) => i !== index)
        if (updated.length === 0) updated = [""]
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Work Links</label>
                <button
                    onClick={addLinkField}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Link
                </button>
            </div>

            {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                            placeholder="https://example.com/my-work"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => removeLink(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md"
                        aria-label="Remove link"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <div className="text-xs text-gray-500 mt-1">
                Add links to your work, documents, or resources related to this task.
            </div>
        </div>
    )
}
