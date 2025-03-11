"use client"

import type React from "react"

import { useState } from "react"
import { addCourse } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Course {
    id: string
    course_code: string
    course_name: string
}

interface CourseFormProps {
    onCourseSaved: (course: Course) => void
}

export default function CourseForm({ onCourseSaved }: CourseFormProps) {
    const [courseCode, setCourseCode] = useState("")
    const [courseName, setCourseName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                setLoading(false)
                return
            }

            const newCourse = { course_code: courseCode, course_name: courseName }
            const response = await addCourse(token, newCourse)

            if (!response.ok) {
                throw new Error("Failed to add course.")
            }

            const savedCourse = await response.json()
            onCourseSaved(savedCourse)
            setCourseCode("")
            setCourseName("")
        } catch (err: any) {
            setError(err.message || "An error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Course</CardTitle>
                <CardDescription>Create a new course in the system</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="Course Code"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Course Name"
                            disabled={loading}
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" disabled={loading || !courseCode || !courseName}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Course"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

