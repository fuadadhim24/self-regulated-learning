"use client"

import { useEffect, useState } from "react"
import LearningStrategyForm from "./LearningStrategiesForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Lightbulb, Loader2, MoreHorizontal, Search, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { getAllLearningStrategies, deleteLearningStrategy } from "@/utils/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

interface LearningStrategy {
    id: string
    name: string
    description?: string
}

export default function LearningStrategiesList() {
    const [strategies, setStrategies] = useState<LearningStrategy[]>([])
    const [filteredStrategies, setFilteredStrategies] = useState<LearningStrategy[]>([])
    const [editingStrategy, setEditingStrategy] = useState<LearningStrategy | null>(null)
    const [deletingStrategy, setDeletingStrategy] = useState<LearningStrategy | null>(null)
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Fetch strategies from the API
    const fetchStrategies = async () => {
        try {
            setLoading(true)
            setError(null)
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                return
            }

            console.log('Fetching strategies with token:', token.substring(0, 10) + '...');
            const response = await getAllLearningStrategies()
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                throw new Error(`Failed to fetch learning strategies: ${response.status} ${response.statusText}`);
            }

            const data = await response.json()
            console.log('Fetched strategies data:', data);

            // Map the data to match our interface
            const mappedStrategies = data.map((strategy: any) => ({
                id: strategy._id || strategy.id,
                name: strategy.learning_strat_name || strategy.name,
                description: strategy.description
            }));

            console.log('Mapped strategies:', mappedStrategies);
            setStrategies(mappedStrategies)
            setFilteredStrategies(mappedStrategies)
        } catch (err: any) {
            console.error('Error in fetchStrategies:', err);
            setError(err.message || "An error occurred while fetching strategies")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStrategies()
    }, [])

    // Filter strategies based on search query
    useEffect(() => {
        const filtered = strategies.filter(strategy =>
            strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (strategy.description && strategy.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setFilteredStrategies(filtered)
        setCurrentPage(1) // Reset to first page when search changes
    }, [searchQuery, strategies])

    // Calculate pagination
    const totalPages = Math.ceil(filteredStrategies.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentStrategies = filteredStrategies.slice(startIndex, endIndex)

    const handleDelete = async (strategy: LearningStrategy) => {
        try {
            setDeletingId(strategy.id)
            setError(null)
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                return
            }

            const response = await deleteLearningStrategy(strategy.id)
            if (!response.ok) {
                throw new Error("Failed to delete learning strategy")
            }

            // Refresh the list after successful deletion
            fetchStrategies()
        } catch (err: any) {
            setError(err.message || "An error occurred while deleting the strategy")
        } finally {
            setDeletingId(null)
            setDeletingStrategy(null)
        }
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Learning Strategies</h2>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Form for adding a new strategy */}
            <LearningStrategyForm
                onStrategySaved={() => {
                    fetchStrategies()
                }}
            />

            {/* Edit Modal */}
            <Dialog open={!!editingStrategy} onOpenChange={() => setEditingStrategy(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Learning Strategy</DialogTitle>
                        <DialogDescription>
                            Update the details of this learning strategy
                        </DialogDescription>
                    </DialogHeader>
                    {editingStrategy && (
                        <LearningStrategyForm
                            strategy={editingStrategy}
                            onStrategySaved={() => {
                                fetchStrategies()
                                setEditingStrategy(null)
                            }}
                            onCancel={() => setEditingStrategy(null)}
                            isModal={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingStrategy} onOpenChange={() => setDeletingStrategy(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Learning Strategy</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this learning strategy?
                        </DialogDescription>
                    </DialogHeader>
                    {deletingStrategy && (
                        <div className="py-4">
                            <div className="space-y-2">
                                <p className="font-medium">{deletingStrategy.name}</p>
                                {deletingStrategy.description && (
                                    <p className="text-sm text-muted-foreground">{deletingStrategy.description}</p>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingStrategy(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingStrategy && handleDelete(deletingStrategy)}
                            disabled={!!deletingId}
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Strategy"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Strategy List</CardTitle>
                    <CardDescription>Manage your learning strategies</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search strategies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-9 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredStrategies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No strategies found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ? "No strategies match your search." : "Add your first learning strategy using the form above."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {currentStrategies.map((strategy) => (
                                    <div
                                        key={strategy.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{strategy.name}</p>
                                            {strategy.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingStrategy(strategy)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeletingStrategy(strategy)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredStrategies.length)} of {filteredStrategies.length} strategies
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
        </div>
    )
}

