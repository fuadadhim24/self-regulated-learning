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
import { learningStrategyAPI } from "@/utils/apiClient"
import type { LearningStrategy } from "@/types/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { usePagination } from "@/hooks/usePagination"
import { Pagination } from "@/components/ui/Pagination"

export default function LearningStrategiesList() {
    const { toast } = useToast();
    const [strategies, setStrategies] = useState<LearningStrategy[]>([])
    const [filteredStrategies, setFilteredStrategies] = useState<LearningStrategy[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingStrategy, setEditingStrategy] = useState<LearningStrategy | null>(null)
    const [deletingStrategy, setDeletingStrategy] = useState<LearningStrategy | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const rowsPerPageOptions = [5, 10, 20, 50]

    const fetchStrategies = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            if (!token) throw new Error("User not authenticated")

            const data = await learningStrategyAPI.getAllStrategies()
            setStrategies(data)
            setFilteredStrategies(data)
        } catch (err: any) {
            setError(err.message)
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
            strategy.learning_strat_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (strategy.description && strategy.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setFilteredStrategies(filtered)
        setCurrentPage(1) // Reset to first page when search changes
    }, [searchQuery, strategies])

    const {
        currentPage,
        totalPages,
        pageSize,
        setCurrentPage,
        setPageSize,
        paginatedData: currentStrategies,
        startIndex,
        endIndex
    } = usePagination(filteredStrategies, {
        totalItems: filteredStrategies.length,
        initialPage: 1,
        pageSize: 5
    })

    const handleDelete = async (strategy: LearningStrategy) => {
        try {
            setDeletingId(strategy._id)
            await learningStrategyAPI.deleteStrategy(strategy._id)
            setStrategies((prev) => prev.filter((s) => s._id !== strategy._id))
            setFilteredStrategies((prev) => prev.filter((s) => s._id !== strategy._id))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeletingId(null)
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
                onStrategySaved={fetchStrategies}
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
                                <p className="font-medium">{deletingStrategy.learning_strat_name}</p>
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
                                        key={strategy._id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{strategy.learning_strat_name}</p>
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
        </div>
    )
}

