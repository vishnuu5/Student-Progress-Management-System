
import { AlertTriangle } from "lucide-react"

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-foreground">{title}</h3>
                        </div>
                    </div>

                    <p className="text-muted-foreground mb-6">{message}</p>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
