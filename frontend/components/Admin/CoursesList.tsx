"use client"

import { useEffect, useState } from "react"
import { courseAPI } from "@/utils/apiClient"
import type { Course } from "@/types/api"
import CourseForm from "./CoursesForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, BookOpen, Edit, Loader2, MoreHorizontal, Search, Trash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { usePagination } from "@/hooks/usePagination"
import { Pagination } from "@/components/ui/Pagination"

export default function CoursesList() {
    const [courses, setCourses] = useState<Course[]>([])
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const rowsPerPageOptions = [5, 10, 20, 50]

    const {
        currentPage,
        totalPages,
        pageSize,
        setCurrentPage,
        setPageSize,
        paginatedData: currentCourses,
        startIndex,
        endIndex
    } = usePagination(filteredCourses, {
        totalItems: filteredCourses.length,
        initialPage: 1,
        pageSize: 5
    })

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            if (!token) throw new Error("User not authenticated")

            const data = await courseAPI.getCourses()
            // Sort courses by creation time (newest first)
            const sortedData = data.sort((a, b) => {
                return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime()
            })
            setCourses(sortedData)
            setFilteredCourses(sortedData)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    // Filter courses based on search query
    useEffect(() => {
        const filtered = courses.filter(course =>
            course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredCourses(filtered)
        setCurrentPage(1) // Reset to first page when search changes
    }, [searchQuery, courses])

    const handleDeleteCourse = async (course: Course) => {
        try {
            setDeletingId(course._id)
            await courseAPI.deleteCourse(course.course_code)
            setCourses((prev) => prev.filter((c) => c._id !== course._id))
            setFilteredCourses((prev) => prev.filter((c) => c._id !== course._id))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <CourseForm onCourseSaved={fetchCourses} />

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
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

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
                    ) : filteredCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No courses found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ? "No courses match your search." : "Add your first course using the form above."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {currentCourses.map((course) => (
                                    <div
                                        key={course._id}
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

