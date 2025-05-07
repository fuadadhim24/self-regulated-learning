"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

interface AlertDialogContentProps {
    children: React.ReactNode
    className?: string
}

interface AlertDialogHeaderProps {
    children: React.ReactNode
    className?: string
}

interface AlertDialogFooterProps {
    children: React.ReactNode
    className?: string
}

interface AlertDialogTitleProps {
    children: React.ReactNode
    className?: string
}

interface AlertDialogDescriptionProps {
    children: React.ReactNode
    className?: string
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    className?: string
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    className?: string
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0">
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    )
}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = ({ className, ...props }: AlertDialogTitleProps) => (
    <h2 className={cn("text-lg font-semibold", className)} {...props} />
)
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = ({ className, ...props }: AlertDialogDescriptionProps) => (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
    ({ className, ...props }, ref) => (
        <Button ref={ref} className={cn("mt-2 sm:mt-0", className)} {...props} />
    )
)
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
    ({ className, ...props }, ref) => (
        <Button ref={ref} variant="outline" className={cn("mt-2 sm:mt-0", className)} {...props} />
    )
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} 