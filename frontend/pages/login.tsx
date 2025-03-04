import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Player } from '@lottiefiles/react-lottie-player'
import { login } from '@/utils/api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await login(username, password);
        if (response.ok) {
            const data = await response.json(); // data should contain { token, role }
            localStorage.setItem("token", data.token);
            if (data.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/board");
            }
        } else {
            alert("Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col lg:flex-row items-center bg-white shadow-md rounded-lg">
                {/* Lottie Animation on the Left */}
                <div className="flex justify-center items-center w-full lg:w-1/2 p-8">
                    <Player
                        src="https://assets7.lottiefiles.com/packages/lf20_87uabjh2.json"
                        className="w-full max-w-sm"
                        loop
                        autoplay
                    />
                </div>

                {/* Login Form on the Right */}
                <div className="w-full lg:w-1/2 p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}