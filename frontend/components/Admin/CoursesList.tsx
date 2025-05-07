"use client"

import { useEffect, useState } from "react"
import { getCourses, deleteCourse } from "@/utils/api"
import CourseForm from "./CoursesForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, BookOpen, Edit, Loader2, MoreHorizontal, Trash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

interface Course {
    id: string
    course_code: string
    course_name: string
}

export default function CoursesList() {
    const [courses, setCourses] = useState<Course[]>([])
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                return
            }

            const response = await getCourses()
            if (!response.ok) throw new Error("Failed to fetch courses.")

            const data = await response.json()
            setCourses(data)
        } catch (err: any) {
            setError(err.message || "An error occurred.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const handleDeleteCourse = async (course: Course) => {
        try {
            setDeletingId(course.course_code)
            const token = localStorage.getItem("token")
            if (!token) {
                setError("No token found. Please log in.")
                return
            }

            const response = await deleteCourse(course.course_code)
            if (!response.ok) throw new Error("Failed to delete course.")

            // Refresh the course list from the API instead of just removing locally
            fetchCourses()
        } catch (err: any) {
            setError(err.message || "An error occurred.")
        } finally {
            setDeletingId(null)
            setDeletingCourse(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <CourseForm onCourseSaved={() => fetchCourses()} />

            {/* Edit Modal */}
            <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>
                            Update the course details
                        </DialogDescription>
                    </DialogHeader>
                    {editingCourse && (
                        <CourseForm
                            course={editingCourse}
                            onCourseSaved={() => {
                                fetchCourses()
                                setEditingCourse(null)
                            }}
                            onCancel={() => setEditingCourse(null)}
                            isModal={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this course?
                        </DialogDescription>
                    </DialogHeader>
                    {deletingCourse && (
                        <div className="py-4">
                            <div className="space-y-2">
                                <p className="font-medium">{deletingCourse.course_name}</p>
                                <p className="text-sm text-muted-foreground">Course Code: {deletingCourse.course_code}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingCourse(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingCourse && handleDeleteCourse(deletingCourse)}
                            disabled={!!deletingId}
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Course"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Course List</CardTitle>
                    <CardDescription>Manage your available courses</CardDescription>
                </CardHeader>
                <CardContent>
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
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No courses found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Add your first course using the form above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{course.course_name}</p>
                                        <p className="text-sm text-muted-foreground">Code: {course.course_code}</p>
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
                                                <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingCourse(course)}
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

