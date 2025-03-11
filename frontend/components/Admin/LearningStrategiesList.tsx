"use client"

import { useEffect, useState } from "react"
import LearningStrategyForm from "./LearningStrategiesForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Lightbulb, Loader2, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface LearningStrategy {
    id: string
    name: string
}

export default function LearningStrategiesList() {
    const [strategies, setStrategies] = useState<LearningStrategy[]>([])
    const [editingStrategy, setEditingStrategy] = useState<LearningStrategy | null>(null)
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Fetch strategies from the API
    useEffect(() => {
        setLoading(true)
        fetch("/api/learning-strategies")
            .then((res) => res.json())
            .then((data) => {
                setStrategies(data)
                setLoading(false)
            })
            .catch((error) => {
                console.error("Error fetching strategies:", error)
                setLoading(false)
            })
    }, [])

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id)
            await fetch(`/api/learning-strategies/${id}`, { method: "DELETE" })
            setStrategies((prev) => prev.filter((strategy) => strategy.id !== id))
        } catch (error) {
            console.error("Error deleting strategy:", error)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Learning Strategies</h2>
            </div>

            {/* Form for adding a new strategy */}
            {!editingStrategy && (
                <LearningStrategyForm onStrategySaved={(newStrategy) => setStrategies((prev) => [...prev, newStrategy])} />
            )}

            {/* Editing form */}
            {editingStrategy && (
                <LearningStrategyForm
                    strategy={editingStrategy}
                    onStrategySaved={(updatedStrategy) => {
                        setStrategies((prev) => prev.map((s) => (s.id === updatedStrategy.id ? updatedStrategy : s)))
                        setEditingStrategy(null)
                    }}
                    onCancel={() => setEditingStrategy(null)}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Strategy List</CardTitle>
                    <CardDescription>Manage your learning strategies</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-9 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : strategies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No strategies found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add your first learning strategy using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {strategies.map((strategy) => (
                                <div
                                    key={strategy.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <p className="font-medium">{strategy.name}</p>
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
                                                    onClick={() => handleDelete(strategy.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {deletingId === strategy.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

