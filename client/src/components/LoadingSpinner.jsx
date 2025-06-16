"use client"

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-sm">{message}</p>
            <p className="text-xs text-muted-foreground">Backend might be starting up, please wait...</p>
        </div>
    )
}

export default LoadingSpinner
