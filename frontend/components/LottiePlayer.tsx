'use client';
import dynamic from 'next/dynamic';

// Dynamically import the Player component with SSR disabled
const Player = dynamic(
    () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
    { ssr: false }
);

export default Player;
