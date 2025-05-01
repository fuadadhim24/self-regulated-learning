"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
    rating: number
    onRate: (newRating: number) => void
    isDisabled?: boolean
}

export default function StarRating({ rating, onRate, isDisabled = false }: StarRatingProps) {
    const [hover, setHover] = useState<number | null>(null)

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={isDisabled}
                    className={`relative p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
                        }`}
                    onMouseEnter={() => !isDisabled && setHover(star)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => !isDisabled && onRate(star)}
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    <Star
                        className={`h-6 w-6 transition-colors duration-200 ${(hover || rating) >= star
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "fill-transparent text-gray-300 dark:text-gray-600"
                            } ${isDisabled ? "opacity-70" : ""}`}
                    />
                </button>
            ))}

            {rating > 0 && <span className="ml-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">{rating}/5</span>}
        </div>
    )
}
