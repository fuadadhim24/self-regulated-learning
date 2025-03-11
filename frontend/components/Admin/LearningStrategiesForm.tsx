"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { LearningStrategy } from "../../types"

interface LearningStrategyFormProps {
    strategy?: LearningStrategy // If provided, we're editing
    onStrategySaved: (strategy: LearningStrategy) => void
    onCancel?: () => void
}

export default function LearningStrategyForm({ strategy, onStrategySaved, onCancel }: LearningStrategyFormProps) {
    const [name, setName] = useState(strategy ? strategy.name : "")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (strategy) {
            setName(strategy.name)
        }
    }, [strategy])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const newStrategy: LearningStrategy = {
            id: strategy ? strategy.id : `${Date.now()}`, // Generate new ID if not editing
            name,
        }

        try {
            if (strategy) {
                // Update existing strategy via PUT
                const res = await fetch(`/api/learning-strategies/${newStrategy.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStrategy),
                })
                if (res.ok) {
                    onStrategySaved(newStrategy)
                }
            } else {
                // Create new strategy via POST
                const res = await fetch("/api/learning-strategies", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStrategy),
                })
                if (res.ok) {
                    onStrategySaved(newStrategy)
                    setName("")
                }
            }
        } catch (error) {
            console.error("Error saving learning strategy:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{strategy ? "Edit Learning Strategy" : "Add Learning Strategy"}</CardTitle>
                <CardDescription>
                    {strategy
                        ? "Update the details of this learning strategy"
                        : "Create a new learning strategy for your courses"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="space-y-2">
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Learning Strategy Name"
                            disabled={loading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={loading || !name}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Strategy"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

