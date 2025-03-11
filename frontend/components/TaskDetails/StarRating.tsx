import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface StarRatingProps {
    rating: number;
    onRate: (newRating: number) => void;
    isDisabled?: boolean;
}

export default function StarRating({ rating, onRate, isDisabled = false }: StarRatingProps) {
    const [hover, setHover] = useState<number | null>(null);

    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    className={`text-3xl transition-colors 
                        ${(hover || rating) >= star ? "text-yellow-400" : "text-gray-300"} 
                        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    onMouseEnter={() => !isDisabled && setHover(star)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => !isDisabled && onRate(star)}
                />
            ))}
        </div>
    );
}
