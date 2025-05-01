"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ClockIcon, Search, UserCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { getAllLogs } from "@/utils/api"

interface Log {
    id: string
    description: string
    created_at: string
    action_type: "login" | "logout"
    username: string
}

export default function LogsList() {
    const [logs, setLogs] = useState<Log[]>([])
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const logsPerPage = 10

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("No token found. Please log in.")
                    return
                }

                const response = await getAllLogs()
                if (!response.ok) throw new Error("Failed to fetch logs")

                const data = await response.json()
                setLogs(data)
                setFilteredLogs(data)
            } catch (err: any) {
                setError(err.message || "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredLogs(logs)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredLogs(
                logs.filter(
                    (log) =>
                        log.description.toLowerCase().includes(query) ||
                        log.username.toLowerCase().includes(query) ||
                        log.action_type.toLowerCase().includes(query),
                ),
            )
        }
    }, [searchQuery, logs])

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "MMM dd, yyyy HH:mm:ss")
        } catch (error) {
            return dateString
        }
    }

    // Paginate logs based on current page
    const indexOfLastLog = currentPage * logsPerPage
    const indexOfFirstLog = indexOfLastLog - logsPerPage
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredLogs.length / logsPerPage)) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Authentication Logs</CardTitle>
                    <CardDescription>Track user login and logout activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search logs..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-9 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No logs found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ? "Try a different search term" : "No authentication logs are available yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">No</th>
                                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Description</th>
                                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Action</th>
                                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLogs.map((log, index) => (
                                        <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{indexOfFirstLog + index + 1}</td> {/* Adjusted index */}
                                            <td className="py-3 px-4">{log.description}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={log.action_type === "login" ? "default" : "secondary"} className="font-normal">
                                                    {log.action_type === "login" ? (
                                                        <UserCheck className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <UserCheck className="mr-1 h-3 w-3" />
                                                    )}
                                                    {log.action_type}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{formatDate(log.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="py-2 px-4 text-white bg-blue-500 rounded disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {Math.ceil(filteredLogs.length / logsPerPage)}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(filteredLogs.length / logsPerPage)}
                    className="py-2 px-4 text-white bg-blue-500 rounded disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
