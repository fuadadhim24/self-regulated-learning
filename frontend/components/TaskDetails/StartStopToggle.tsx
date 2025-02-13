import { useState } from 'react';

interface StartStopToggleProps {
    isToggleOn: boolean;
    onToggle: () => void;
}

export default function StartStopToggle({ isToggleOn, onToggle }: StartStopToggleProps) {
    return (
        <div className="flex items-center mb-4">
            <div
                onClick={onToggle}
                className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${isToggleOn ? 'bg-green-500' : 'bg-gray-300'
                    }`}
            >
                <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isToggleOn ? 'transform translate-x-8' : ''
                        }`}
                />
            </div>
            <span className="ml-4 text-gray-700 font-semibold">{isToggleOn ? 'Stop' : 'Start'}</span>
        </div>
    );
}
