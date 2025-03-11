"use client"

import type React from "react"

import { useState } from "react"
import { BookOpen, GraduationCap, Lightbulb, Users, Bell, Search, Menu } from "lucide-react"
import CoursesList from "@/components/Admin/CoursesList"
import LearningStrategiesList from "@/components/Admin/LearningStrategiesList"
import UsersList from "@/components/Admin/UsersList"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type Section = "courses" | "learningStrategies" | "users"

export default function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState<Section>("courses")

    const NavItem = ({
        title,
        icon: Icon,
        value,
        active,
    }: {
        title: string
        icon: React.ElementType
        value: Section
        active: boolean
    }) => (
        <button
            onClick={() => setSelectedSection(value)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{title}</span>
        </button>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b sticky top-0 z-30 bg-background">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden mr-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex flex-col h-full">
                                <div className="border-b p-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6" />
                                        Learning Admin
                                    </h2>
                                </div>
                                <nav className="flex-1 p-4 space-y-2">
                                    <NavItem title="Courses" icon={BookOpen} value="courses" active={selectedSection === "courses"} />
                                    <NavItem
                                        title="Learning Strategies"
                                        icon={Lightbulb}
                                        value="learningStrategies"
                                        active={selectedSection === "learningStrategies"}
                                    />
                                    <NavItem title="Users & Boards" icon={Users} value="users" active={selectedSection === "users"} />
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2 md:hidden">
                        <GraduationCap className="h-6 w-6" />
                        <h1 className="text-xl font-bold">Learning Admin</h1>
                    </div>

                    <div className="hidden md:flex md:flex-1 md:items-center md:gap-4 md:px-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg" alt="Admin" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Admin User</p>
                                        <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
                    <div className="flex h-14 items-center border-b px-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Learning Admin
                        </h2>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <NavItem title="Courses" icon={BookOpen} value="courses" active={selectedSection === "courses"} />
                        <NavItem
                            title="Learning Strategies"
                            icon={Lightbulb}
                            value="learningStrategies"
                            active={selectedSection === "learningStrategies"}
                        />
                        <NavItem title="Users & Boards" icon={Users} value="users" active={selectedSection === "users"} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-5xl">
                        {selectedSection === "courses" && <CoursesList />}
                        {selectedSection === "learningStrategies" && <LearningStrategiesList />}
                        {selectedSection === "users" && <UsersList />}
                    </div>
                </main>
            </div>
        </div>
    )
}

