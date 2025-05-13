"use client"

import { useEffect, useState } from "react"
import { getUserByUsername, getBoardByUser, getCardMovements } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, ChevronDown, User, History, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
            created_at: string
            column_movements?: CardMovement[]
        }[]
    }[]
}

interface UserDetailsProps {
    username: string
    onClose: () => void
}

interface CardMovement {
    fromColumn: string
    toColumn: string
    timestamp: string
}

interface CardMovementModalProps {
    cardId: string
    board: Board | null
    isOpen: boolean
    onClose: () => void
}

interface StudySession {
    total_study_time_minutes: number
}

function CardMovementModal({ cardId, board, isOpen, onClose }: CardMovementModalProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [movements, setMovements] = useState<CardMovement[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [columnTimes, setColumnTimes] = useState<{ [key: string]: number }>({})
    const rowsPerPage = 5

    // Map list titles to column names
    const columnNameMap: { [key: string]: string } = {
        "Planning (To Do)": "list1",
        "Monitoring (In Progress)": "list2",
        "Controlling (Review)": "list3",
        "Reflection (Done)": "list4"
    }

    // Reverse mapping for display
    const displayNameMap: { [key: string]: string } = {
        "list1": "Planning (To Do)",
        "list2": "Monitoring (In Progress)",
        "list3": "Controlling (Review)",
        "list4": "Reflection (Done)"
    }

    useEffect(() => {
        if (!isOpen || !board) return

        try {
            // Find the card in the board data
            let cardMovements: CardMovement[] = []
            for (const list of board.lists) {
                const card = list.cards.find(c => c.id === cardId)
                if (card?.column_movements) {
                    cardMovements = card.column_movements
                    break
                }
            }
            setMovements(cardMovements)

            // Calculate time spent in each column
            const times: { [key: string]: number } = {}

            // Initialize times for all columns
            board.lists.forEach(list => {
                times[list.title] = 0
            })

            // Sort movements by timestamp to ensure correct order
            const sortedMovements = [...cardMovements].sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            // Calculate duration for each movement
            for (let i = 0; i < sortedMovements.length; i++) {
                const currentMovement = sortedMovements[i]
                const nextMovement = sortedMovements[i + 1]

                const startTime = new Date(currentMovement.timestamp).getTime()
                const endTime = nextMovement
                    ? new Date(nextMovement.timestamp).getTime()
                    : new Date().getTime()

                const duration = endTime - startTime

                // Find the list title that corresponds to this column
                const listTitle = Object.entries(columnNameMap).find(([_, colName]) =>
                    colName === currentMovement.toColumn
                )?.[0]

                if (listTitle) {
                    times[listTitle] += duration
                }
            }

            console.log('Column times:', times) // Debug log
            setColumnTimes(times)
        } catch (err: any) {
            console.error('Error calculating times:', err) // Debug log
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [cardId, board, isOpen])

    // Reset to first page when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1)
        }
    }, [isOpen])

    // Calculate pagination
    const totalPages = Math.ceil(movements.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentMovements = movements.slice(startIndex, endIndex)

    // Format duration in hours, minutes, seconds
    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const days = Math.floor(totalSeconds / (24 * 3600))
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`
        } else {
            return `${seconds}s`
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Card Movement History</DialogTitle>
                </DialogHeader>

                {error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-[200px] w-full" />
                    </div>
                ) : movements.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No movement history available</p>
                ) : (
                    <div className="space-y-4">
                        {/* Time Summary */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Time Spent in Each Column</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {board?.lists.map(list => (
                                        <div key={list.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <span className="text-sm font-medium">{list.title}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDuration(columnTimes[list.title] || 0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentMovements.map((movement, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{new Date(movement.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{displayNameMap[movement.fromColumn] || movement.fromColumn}</TableCell>
                                        <TableCell>{displayNameMap[movement.toColumn] || movement.toColumn}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1}-{Math.min(endIndex, movements.length)} of {movements.length} movements
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default function UserDetails({ username, onClose }: UserDetailsProps) {
    const [user, setUser] = useState<UserDetails | null>(null)
    const [board, setBoard] = useState<Board | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedLists, setExpandedLists] = useState<{ [key: string]: boolean }>({})
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
    const [studyTimes, setStudyTimes] = useState<{ [key: string]: number }>({})

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

    // Add new useEffect for fetching study times
    useEffect(() => {
        const fetchStudyTimes = async () => {
            if (!board) return

            const times: { [key: string]: number } = {}
            const token = localStorage.getItem("token")
            if (!token) return

            // Fetch study times for all cards
            for (const list of board.lists) {
                for (const card of list.cards) {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-sessions/card/${card.id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        })

                        if (!response.ok) continue

                        const data: StudySession = await response.json()
                        times[card.id] = data.total_study_time_minutes
                    } catch (error) {
                        console.error(`Error fetching study time for card ${card.id}:`, error)
                    }
                }
            }

            setStudyTimes(times)
        }

        if (board) {
            fetchStudyTimes()
        }
    }, [board])

    // Toggle function for expanding/collapsing lists
    const toggleList = (listId: string) => {
        setExpandedLists((prev) => ({
            ...prev,
            [listId]: !prev[listId],
        }))
    }

    // Format time function
    const formatTime = (minutes: number) => {
        const totalSeconds = minutes * 60
        const days = Math.floor(totalSeconds / (24 * 3600))
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
        const remainingMinutes = Math.floor((totalSeconds % 3600) / 60)

        if (days > 0) {
            return `${days}d ${hours}h ${remainingMinutes}m`
        } else if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`
        } else {
            return `${remainingMinutes}m`
        }
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
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Difficulty: {card.difficulty}
                                                                            </Badge>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Priority: {card.priority}
                                                                            </Badge>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Created: {new Date(card.created_at).toLocaleDateString()}
                                                                            </Badge>
                                                                            {studyTimes[card.id] > 0 && (
                                                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    {formatTime(studyTimes[card.id])}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="mt-2"
                                                                            onClick={() => setSelectedCardId(card.id)}
                                                                        >
                                                                            <History className="h-4 w-4 mr-2" />
                                                                            View Card Movement
                                                                        </Button>
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
            {selectedCardId && (
                <CardMovementModal
                    cardId={selectedCardId}
                    board={board}
                    isOpen={!!selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </Dialog>
    )
}

