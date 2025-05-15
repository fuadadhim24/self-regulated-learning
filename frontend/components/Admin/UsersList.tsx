"use client"

import { useEffect, useState } from "react"
import { getAllUsers } from "@/utils/api"
import UserDetails from "./UserDetails"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Eye, MailIcon, Search, User, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface UserType {
    _id: string
    username: string
    first_name: string
    last_name: string
    email: string
}

export default function UsersList() {
    const [users, setUsers] = useState<UserType[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
    const [selectedUsername, setSelectedUsername] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) throw new Error("User not authenticated")

                const response = await getAllUsers()
                if (!response.ok) throw new Error("Failed to fetch users")

                const data: UserType[] = await response.json()
                setUsers(data)
                setFilteredUsers(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.first_name.toLowerCase().includes(query) ||
                        user.last_name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query) ||
                        user.username.toLowerCase().includes(query),
                ),
            )
        }
        setCurrentPage(1) // Reset to first page when search changes
    }, [searchQuery, users])

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentUsers = filteredUsers.slice(startIndex, endIndex)

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Users & Boards</h2>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage user accounts and their boards</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-4 w-[150px]" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-9 w-[100px]" />
                                </div>
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No users found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ? "Try a different search term" : "No users are available in the system"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {currentUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MailIcon className="mr-1 h-3 w-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedUsername(user.username)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {selectedUsername && <UserDetails username={selectedUsername} onClose={() => setSelectedUsername(null)} />}
        </div>
    )
}

