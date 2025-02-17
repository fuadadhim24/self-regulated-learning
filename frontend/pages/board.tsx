import Board from '@/components/Board/Board'
import Navbar from '@/components/Navbar'
import Chatbot from '@/components/Chatbot/Chatbot'

export default function BoardPage() {
    return (
        <div>
            <Navbar />
            <Board />
            <Chatbot />
        </div>
    )
}