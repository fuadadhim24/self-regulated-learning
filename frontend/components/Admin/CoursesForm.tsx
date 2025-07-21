"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { courseAPI } from "@/utils/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Course } from "@/types/api"

interface CourseFormProps {
    course?: Course
    onCourseSaved: () => void
    onCancel?: () => void
    isModal?: boolean
}

export default function CourseForm({ course, onCourseSaved, onCancel, isModal = false }: CourseFormProps) {
    const [courseCode, setCourseCode] = useState(course?.course_code || "")
    const [courseName, setCourseName] = useState(course?.course_name || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (course) {
            setCourseCode(course.course_code)
            setCourseName(course.course_name)
        }
    }, [course])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (course) {
                await courseAPI.updateCourse(course.course_code, {
                    course_code: courseCode,
                    course_name: courseName
                })
            } else {
                await courseAPI.addCourse({
                    course_code: courseCode,
                    course_name: courseName
                })
            }
            onCourseSaved()
            if (!course) {
                setCourseCode("")
                setCourseName("")
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.")
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

            <div className="space-y-4">
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
            </div>

            <div className="flex justify-between mt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading || !courseCode || !courseName}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Saving..." : course ? "Update Course" : "Save Course"}
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
                <CardTitle>{course ? "Edit Course" : "Add New Course"}</CardTitle>
                <CardDescription>
                    {course ? "Update the course details" : "Create a new course in the system"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    )
}

