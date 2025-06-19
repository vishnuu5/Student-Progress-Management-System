
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar, Trophy, Target, TrendingUp, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import ContestHistory from "../components/ContestHistory"
import ProblemSolvingData from "../components/ProblemSolvingData"
import { studentsApi } from "../services/api"

const StudentProfile = () => {
    const { id } = useParams()
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("contests")

    useEffect(() => {
        fetchStudent()
    }, [id])

    const fetchStudent = async () => {
        try {
            setLoading(true)
            const data = await studentsApi.getById(id)
            setStudent(data)
        } catch (error) {
            toast.error("Failed to fetch student data")
            console.error("Error fetching student:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!student) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Student not found</p>
                <Link to="/" className="inline-flex items-center space-x-2 mt-4 text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Students</span>
                </Link>
            </div>
        )
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link to="/" className="p-2 hover:bg-muted rounded-md transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
                    <p className="text-muted-foreground">Student Profile</p>
                </div>
            </div>

            {/* Student Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Current Rating</p>
                            <p className="text-xl font-semibold text-foreground">{student.currentRating || "Unrated"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-md">
                            <Target className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Max Rating</p>
                            <p className="text-xl font-semibold text-foreground">{student.maxRating || "Unrated"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">CF Handle</p>
                            <a
                                href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-semibold text-primary hover:underline"
                            >
                                {student.codeforcesHandle}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                            <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Update</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(student.lastDataUpdate)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-foreground">{student.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-foreground">{student.phoneNumber}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-card border border-border rounded-lg">
                <div className="border-b border-border">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab("contests")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "contests"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                }`}
                        >
                            Contest History
                        </button>
                        <button
                            onClick={() => setActiveTab("problems")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "problems"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                }`}
                        >
                            Problem Solving Data
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === "contests" && <ContestHistory studentId={id} />}
                    {activeTab === "problems" && <ProblemSolvingData studentId={id} />}
                </div>
            </div>
        </div>
    )
}

export default StudentProfile
