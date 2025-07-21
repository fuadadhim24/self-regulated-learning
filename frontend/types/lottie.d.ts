declare module '@lottiefiles/react-lottie-player' {
    import { Component } from 'react';

    interface PlayerProps {
        src: string;
        className?: string;
        loop?: boolean;
        autoplay?: boolean;
        style?: React.CSSProperties;
        [key: string]: any;
    }

    export class Player extends Component<PlayerProps> { }
} 