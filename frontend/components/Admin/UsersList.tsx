"use client"

import { useEffect, useState } from "react"
import { userAPI } from "@/utils/apiClient"
import type { User } from "@/types/api"
import UserDetails from "./UserDetails"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Eye, MailIcon, Search, User as UserIcon, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePagination } from "@/hooks/usePagination"
import { Pagination } from "@/components/ui/Pagination"

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [selectedUsername, setSelectedUsername] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const rowsPerPageOptions = [10, 25, 50, 100]

    const {
        currentPage,
        totalPages,
        pageSize,
        setCurrentPage,
        setPageSize,
        paginatedData: currentUsers,
        startIndex,
        endIndex
    } = usePagination(filteredUsers, {
        totalItems: filteredUsers.length,
        initialPage: 1,
        pageSize: 5
    })

    // Fetch users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("No token found. Please log in.")
                    return
                }

                const data = await userAPI.getAllUsers()
                setUsers(data)
                setFilteredUsers(data)
            } catch (err: any) {
                setError(err.message || "An error occurred")
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
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedUsername(user.username)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-primary" />
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
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    pageSizeOptions={rowsPerPageOptions}
                                    onPageChange={setCurrentPage}
                                    onPageSizeChange={setPageSize}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {selectedUsername && <UserDetails username={selectedUsername} onClose={() => setSelectedUsername(null)} />}
        </div>
    )
}

