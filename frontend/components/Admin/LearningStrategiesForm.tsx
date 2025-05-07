"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { LearningStrategy } from "../../types"
import { addLearningStrategy, updateLearningStrategy } from "../../utils/api"

interface LearningStrategyFormProps {
    strategy?: LearningStrategy // If provided, we're editing
    onStrategySaved: () => void
    onCancel?: () => void
    isModal?: boolean // New prop to determine if form is in modal
}

export default function LearningStrategyForm({ strategy, onStrategySaved, onCancel, isModal = false }: LearningStrategyFormProps) {
    const [name, setName] = useState(strategy?.name || "")
    const [description, setDescription] = useState(strategy?.description || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (strategy) {
            setName(strategy.name)
            setDescription(strategy.description || "")
        }
    }, [strategy])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                return
            }

            console.log('Submitting strategy with token:', token.substring(0, 10) + '...');
            if (strategy) {
                // Update existing strategy
                const updateData = {
                    name,
                    description: description.trim() || null
                };
                console.log('Updating strategy:', {
                    id: strategy.id,
                    ...updateData
                });
                const response = await updateLearningStrategy(strategy.id, updateData)
                console.log('Update response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Error response:', errorData);
                    throw new Error(`Failed to update learning strategy: ${response.status} ${response.statusText}`);
                }

                try {
                    const responseData = await response.json();
                    console.log('Update response data:', responseData);
                } catch (e) {
                    console.log('No response data to parse');
                }
            } else {
                // Create new strategy
                const createData = {
                    name,
                    description: description.trim() || null
                };
                console.log('Creating new strategy:', createData);
                const response = await addLearningStrategy(createData)
                console.log('Create response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Error response:', errorData);
                    throw new Error(`Failed to add learning strategy: ${response.status} ${response.statusText}`);
                }

                try {
                    const responseData = await response.json();
                    console.log('Create response data:', responseData);
                } catch (e) {
                    console.log('No response data to parse');
                }
            }

            onStrategySaved()
            if (!strategy) {
                setName("")
                setDescription("")
            }
        } catch (err: any) {
            console.error('Error in handleSubmit:', err);
            setError(err.message || "An error occurred while saving the strategy")
        } finally {
            setLoading(false)
        }
    }

    const formContent = (
        <form onSubmit={handleSubmit}>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Learning Strategy Name"
                    disabled={loading}
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    disabled={loading}
                />
            </div>
            <div className="flex justify-between mt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading || !name}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Saving..." : "Save Strategy"}
                </Button>
            </div>
        </form>
    )

    if (isModal) {
        return formContent
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
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    )
}

