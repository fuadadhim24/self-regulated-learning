"use client"

import { useEffect, useState } from "react"
import { userAPI, boardAPI, studySessionAPI } from "@/utils/apiClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, ChevronDown, User, History, Clock, Move } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { usePagination } from "@/hooks/usePagination"
import { Pagination } from "@/components/ui/Pagination"
import type { Board } from "@/types/api"

interface UserDetails {
    _id: string
    username: string
    first_name: string
    last_name: string
    email: string
    role?: string
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
    const [cardTitle, setCardTitle] = useState<string>("")
    const rowsPerPageOptions = [5, 10, 20, 50]
    const {
        currentPage,
        totalPages,
        pageSize,
        setCurrentPage,
        setPageSize,
        paginatedData: currentMovements,
        startIndex,
        endIndex
    } = usePagination(movements, {
        totalItems: movements.length,
        initialPage: 1,
        pageSize: 5
    })
    const [columnTimes, setColumnTimes] = useState<{ [key: string]: number }>({})
    const { toast } = useToast();

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
            let foundCardTitle = ""

            for (const list of board.lists) {
                const card = list.cards.find(c => c._id === cardId || (c as any).id === cardId)
                if (card) {
                    // Try different possible field names for movements
                    if (card.column_movements && Array.isArray(card.column_movements)) {
                        cardMovements = card.column_movements
                    } else if ((card as any).movements && Array.isArray((card as any).movements)) {
                        cardMovements = (card as any).movements
                    } else if ((card as any).card_movements && Array.isArray((card as any).card_movements)) {
                        cardMovements = (card as any).card_movements
                    }

                    foundCardTitle = card.title || "Untitled Card"
                    break
                }
            }

            setMovements(cardMovements)
            setCardTitle(foundCardTitle)

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

            setColumnTimes(times)
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Error calculating times", variant: "destructive" })
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="card-movement-description">
                <DialogHeader>
                    <DialogTitle>Card Movement History - {cardTitle}</DialogTitle>
                    <div id="card-movement-description" className="sr-only">
                        Detailed view of card movement history including time spent in each column and movement timeline.
                    </div>
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
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Time Spent in Each Column</CardTitle>
                                <CardDescription>Total time: 0s</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {board?.lists.map(list => (
                                        <div key={list._id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <span className="text-sm font-medium">{list.title}</span>
                                            <span className="text-sm text-muted-foreground">0s</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <p className="text-center text-muted-foreground py-4">No movement history available for this card</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Time Summary */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Time Spent in Each Column</CardTitle>
                                <CardDescription>
                                    Total time: {formatDuration(Object.values(columnTimes).reduce((sum, time) => sum + time, 0))}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {board?.lists.map(list => (
                                        <div key={list._id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
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
                                {currentMovements.map((movement) => (
                                    <TableRow key={(movement as any)._id || `${movement.timestamp}-${movement.fromColumn}-${movement.toColumn}`}>
                                        <TableCell>{new Date(movement.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{displayNameMap[movement.fromColumn] || movement.fromColumn}</TableCell>
                                        <TableCell>{displayNameMap[movement.toColumn] || movement.toColumn}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
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
    const [cardStudyTimes, setCardStudyTimes] = useState<Map<string, number>>(new Map())
    const [updatingAdmin, setUpdatingAdmin] = useState(false)
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true)
                setError(null)

                const foundUser = await userAPI.getUserByUsername(username)
                setUser(foundUser)

                const boardData = await boardAPI.getBoardByUser(foundUser._id)
                setBoard(boardData)

                // Fetch study time for each card
                const studyTimePromises = boardData.lists.flatMap((list: any) =>
                    list.cards.map(async (card: any) => {
                        try {
                            const studyData = await studySessionAPI.getCardSessions(card._id)
                            // Calculate total study time from sessions array
                            const totalTime = Array.isArray(studyData)
                                ? studyData.reduce((total: number, session: any) => total + (session.total_study_time_minutes || 0), 0)
                                : 0
                            return { cardId: card._id, studyTime: totalTime }
                        } catch (error: any) {
                            toast({ title: "Error", description: `Error fetching study time for card ${card._id}: ${error.message}`, variant: "destructive" })
                            return { cardId: card._id, studyTime: 0 }
                        }
                    })
                )

                const studyTimes = await Promise.all(studyTimePromises)
                const studyTimeMap = new Map<string, number>(studyTimes.map((st: any) => [st.cardId, st.studyTime]))
                setCardStudyTimes(studyTimeMap)

            } catch (err: any) {
                setError(err.message || "Failed to fetch user details")
            } finally {
                setLoading(false)
            }
        }

        fetchUserDetails()
    }, [username])

    // Function to toggle admin status
    const toggleAdminStatus = async () => {
        if (!user) return

        try {
            setUpdatingAdmin(true)
            await userAPI.makeUserAdmin(user._id)

            // Update local state
            setUser(prev => prev ? { ...prev, role: prev.role === "admin" ? "user" : "admin" } : null)

            toast({
                title: "Success",
                description: `User role updated to ${user.role === "admin" ? "user" : "admin"}`,
                variant: "default"
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update user role",
                variant: "destructive"
            })
        } finally {
            setUpdatingAdmin(false)
        }
    }

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
        <>
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

                                        {/* Admin Toggle */}
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">Admin Privileges</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user?.role === "admin"
                                                            ? "This user has admin privileges"
                                                            : "Grant admin privileges to this user"
                                                        }
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={toggleAdminStatus}
                                                    disabled={updatingAdmin}
                                                    variant={user?.role === "admin" ? "destructive" : "default"}
                                                    size="sm"
                                                >
                                                    {updatingAdmin ? "Updating..." : user?.role === "admin" ? "Remove Admin" : "Make Admin"}
                                                </Button>
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
                                                        key={list._id}
                                                        open={expandedLists[list._id]}
                                                        onOpenChange={() => toggleList(list._id)}
                                                        className="border rounded-lg"
                                                    >
                                                        <CollapsibleTrigger asChild>
                                                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/75 transition-colors">
                                                                <div className="flex items-center space-x-2">
                                                                    <ChevronDown
                                                                        className={`h-4 w-4 transition-transform ${expandedLists[list._id] ? "rotate-180" : ""
                                                                            }`}
                                                                    />
                                                                    <h3 className="font-medium">{list.title}</h3>
                                                                    <Badge variant="secondary">{list.cards.length} cards</Badge>
                                                                </div>
                                                            </div>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="mt-2 space-y-2">
                                                            {list.cards.map((card) => (
                                                                <div
                                                                    key={card._id}
                                                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium">{card.title}</h4>
                                                                            <p className="text-sm text-muted-foreground mt-1">{card.sub_title}</p>
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {card.difficulty}
                                                                                </Badge>
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {card.priority}
                                                                                </Badge>
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    Created: {new Date(card.created_at).toLocaleDateString()}
                                                                                </Badge>
                                                                                {cardStudyTimes.get(card._id) && cardStudyTimes.get(card._id)! > 0 && (
                                                                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                                                        <Clock className="h-3 w-3" />
                                                                                        {formatTime(cardStudyTimes.get(card._id) || 0)}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 ml-4">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const cardId = card._id || (card as any).id
                                                                                    setSelectedCardId(cardId)
                                                                                }}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                <Move className="h-3 w-3" />
                                                                                View Movements {card.column_movements && card.column_movements.length > 0 && `(${card.column_movements.length})`}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
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

            {/* Separate CardMovementModal */}
            {selectedCardId && (
                <CardMovementModal
                    cardId={selectedCardId}
                    board={board}
                    isOpen={!!selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </>
    )
}

