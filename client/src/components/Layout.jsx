"use client"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { Moon, Sun, Users, Settings, Code } from "lucide-react"

const Layout = ({ children }) => {
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="flex items-center space-x-2">
                                <Code className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold text-foreground">Student Progress</span>
                            </Link>

                            <nav className="hidden md:flex items-center space-x-6">
                                <Link
                                    to="/"
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Students</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/settings")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </nav>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden border-b border-border bg-card">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex space-x-4">
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/")
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            <span>Students</span>
                        </Link>

                        <Link
                            to="/settings"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/settings")
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
    )
}

export default Layout
