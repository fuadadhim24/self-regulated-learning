"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Check, ExternalLink } from "lucide-react"

// Match the structure that would be stored in the database
interface Link {
    id: string
    url: string
}

interface LinkInputProps {
    cardId: string
    links?: Link[]
    onUpdateLinks: (updatedLinks: Link[]) => void
}

export default function LinkInput({ cardId, links = [], onUpdateLinks }: LinkInputProps) {
    const [localLinks, setLocalLinks] = useState<Link[]>(links)
    const [showInput, setShowInput] = useState(false)
    const [newLinkUrl, setNewLinkUrl] = useState("")
    const [isValidUrl, setIsValidUrl] = useState(true)

    useEffect(() => {
        setLocalLinks(links)
    }, [links])

    const validateUrl = (url: string) => {
        if (url.trim() === "") return true
        try {
            // Check if it's a valid URL format
            new URL(url)
            return true
        } catch (e) {
            // Try adding https:// prefix if missing
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                try {
                    new URL(`https://${url}`)
                    return true
                } catch (e) {
                    return false
                }
            }
            return false
        }
    }

    const formatUrl = (url: string) => {
        if (url.trim() === "") return ""
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return `https://${url}`
        }
        return url
    }

    const handleAddLink = () => {
        if (newLinkUrl.trim() === "") return

        const formattedUrl = formatUrl(newLinkUrl)

        if (!validateUrl(formattedUrl)) {
            setIsValidUrl(false)
            return
        }

        const newLink: Link = {
            id: `link-${Date.now()}`,
            url: formattedUrl,
        }

        const updatedLinks = [...localLinks, newLink]
        setLocalLinks(updatedLinks)
        onUpdateLinks(updatedLinks)

        setNewLinkUrl("")
        setShowInput(false)
        setIsValidUrl(true)
    }

    const handleDeleteLink = (linkId: string) => {
        const updatedLinks = localLinks.filter((link) => link.id !== linkId)
        setLocalLinks(updatedLinks)
        onUpdateLinks(updatedLinks)
    }

    const handleInputChange = (value: string) => {
        setNewLinkUrl(value)
        setIsValidUrl(validateUrl(value))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    Links
                </h3>
                {!showInput && (
                    <button
                        onClick={() => setShowInput(true)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Link
                    </button>
                )}
            </div>

            {showInput && (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <div className="relative">
                        <input
                            type="text"
                            value={newLinkUrl}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Enter URL (e.g., example.com)"
                            className={`w-full border ${isValidUrl ? "border-indigo-300 dark:border-indigo-700" : "border-red-500"} p-2 pr-10 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-800/80`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddLink()
                                }
                            }}
                        />
                        <button
                            onClick={handleAddLink}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            disabled={!isValidUrl}
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    </div>
                    {!isValidUrl && <p className="text-red-500 text-xs mt-1">Please enter a valid URL</p>}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => {
                                setShowInput(false)
                                setNewLinkUrl("")
                                setIsValidUrl(true)
                            }}
                            className="py-1.5 px-3 border border-indigo-300 dark:border-indigo-700 rounded-md text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {localLinks.length === 0 && !showInput && (
                <div className="text-center py-6 text-indigo-500 dark:text-indigo-400 text-sm">
                    No links added yet. Add links to relevant resources.
                </div>
            )}

            {localLinks.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-md border border-indigo-200 dark:border-indigo-800 shadow-sm overflow-hidden">
                    <div className="p-3">
                        <ul className="space-y-2">
                            {localLinks.map((link) => (
                                <li key={link.id} className="flex items-center justify-between group">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm truncate max-w-[90%]"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{link.url}</span>
                                    </a>
                                    <button
                                        onClick={() => handleDeleteLink(link.id)}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete link"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
