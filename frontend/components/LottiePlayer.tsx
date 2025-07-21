'use client';
import dynamic from 'next/dynamic';

// Dynamically import the Player component with SSR disabled
const LottiePlayer = dynamic(
    () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
    { ssr: false }
);

// Simple wrapper component
const Player = (props: any) => {
    return <LottiePlayer {...props} />;
};

export default Player;
