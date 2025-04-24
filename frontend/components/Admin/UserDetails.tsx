"use client"

import { useEffect, useState } from "react"
import { getUserByUsername, getBoardByUser } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, ChevronDown, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface UserDetails {
    _id: string
    username: string
    first_name: string
    last_name: string
    email: string
    role?: string
}

interface Board {
    id: string
    name: string
    lists: {
        id: string
        title: string
        cards: {
            id: string
            title: string
            sub_title: string
            difficulty: string
            priority: string
        }[]
    }[]
}

interface UserDetailsProps {
    username: string
    onClose: () => void
}

export default function UserDetails({ username, onClose }: UserDetailsProps) {
    const [user, setUser] = useState<UserDetails | null>(null)
    const [board, setBoard] = useState<Board | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedLists, setExpandedLists] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem("token")
                if (!token) {
                    setError("User not authenticated")
                    return
                }

                // Fetch user details by username
                const userRes = await getUserByUsername(username)
                if (!userRes.ok) throw new Error("Failed to fetch user details")

                const foundUser = await userRes.json()
                setUser(foundUser)

                // Fetch board using the user's ID
                const boardRes = await getBoardByUser(foundUser._id)
                if (!boardRes.ok) throw new Error("Failed to fetch user's board")

                const boardData = await boardRes.json()
                setBoard(boardData)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUserDetails()
    }, [username])

    // Toggle function for expanding/collapsing lists
    const toggleList = (listId: string) => {
        setExpandedLists((prev) => ({
            ...prev,
            [listId]: !prev[listId],
        }))
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                {error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                    </div>
                ) : (
                    <Tabs defaultValue="profile">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="board">Board</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>User Information</CardTitle>
                                    <CardDescription>Personal details and account information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                {user?.first_name} {user?.last_name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Username</p>
                                            <p>{user?.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                                            <Badge variant="outline">{user?.role || "User"}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="board" className="space-y-4 pt-4">
                            {!board ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>No Board Available</CardTitle>
                                        <CardDescription>This user doesn't have any boards yet</CardDescription>
                                    </CardHeader>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{board.name}</CardTitle>
                                        <CardDescription>{board.lists.length} columns</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {board.lists.map((list) => (
                                                <Collapsible
                                                    key={list.id}
                                                    open={expandedLists[list.id]}
                                                    onOpenChange={() => toggleList(list.id)}
                                                    className="border rounded-lg"
                                                >
                                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg">
                                                        <h3 className="font-medium">{list.title}</h3>
                                                        <Badge variant="outline">{list.cards.length} cards</Badge>
                                                        <ChevronDown
                                                            className={`h-4 w-4 transition-transform ${expandedLists[list.id] ? "transform rotate-180" : ""}`}
                                                        />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="px-3 pb-3">
                                                        {list.cards.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground py-2">No cards in this list.</p>
                                                        ) : (
                                                            <div className="space-y-2 mt-2">
                                                                {list.cards.map((card) => (
                                                                    <div key={card.id} className="bg-muted/50 p-3 rounded-md">
                                                                        <p className="font-medium">{card.title}</p>
                                                                        <p className="text-sm text-muted-foreground">{card.sub_title}</p>
                                                                        <div className="flex gap-2 mt-2">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Difficulty: {card.difficulty}
                                                                            </Badge>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Priority: {card.priority}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}

