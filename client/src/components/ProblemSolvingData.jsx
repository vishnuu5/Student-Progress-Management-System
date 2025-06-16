"use client"

import { useState, useEffect } from "react"
import { Target, Calendar, BarChart3, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import toast from "react-hot-toast"
import SubmissionHeatmap from "./SubmissionHeatmap"
import { codeforcesApi } from "../services/api"

const ProblemSolvingData = ({ studentId }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(90)

    useEffect(() => {
        fetchProblemData()
    }, [studentId, filter])

    const fetchProblemData = async () => {
        try {
            setLoading(true)
            const result = await codeforcesApi.getProblems(studentId, filter)
            setData(result)
        } catch (error) {
            toast.error("Failed to fetch problem solving data")
            console.error("Error fetching problem data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load problem solving data.</p>
            </div>
        )
    }

    const chartData = Object.entries(data.ratingBuckets).map(([range, count]) => ({
        range,
        count,
    }))

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">Filter by:</span>
                <div className="flex space-x-2">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setFilter(days)}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${filter === days
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {days} days
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <Target className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Problems</p>
                            <p className="text-2xl font-bold text-foreground">{data.totalProblems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-md">
                            <BarChart3 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Rating</p>
                            <p className="text-2xl font-bold text-foreground">{data.avgRating}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/10 rounded-md">
                            <Activity className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Problems/Day</p>
                            <p className="text-2xl font-bold text-foreground">{data.avgProblemsPerDay}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                            <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Hardest Problem</p>
                            <p className="text-lg font-bold text-foreground">{data.mostDifficult.problemRating || "N/A"}</p>
                            {data.mostDifficult.problemName && (
                                <p className="text-xs text-muted-foreground truncate">{data.mostDifficult.problemName}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Distribution Chart */}
            <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-foreground mb-4">Problems by Rating</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="range" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "6px",
                                    color: "hsl(var(--card-foreground))",
                                }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Submission Heatmap */}
            <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-foreground mb-4">Submission Activity</h4>
                <SubmissionHeatmap data={data.heatmapData} />
            </div>

            {/* Recent Submissions */}
            {data.submissions && data.submissions.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {data.submissions.slice(0, 10).map((submission) => (
                            <div key={submission._id} className="flex items-center justify-between p-3 bg-background rounded-md">
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{submission.problemName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(submission.submissionTime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${submission.verdict === "OK" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            }`}
                                    >
                                        {submission.verdict}
                                    </span>
                                    {submission.problemRating && (
                                        <p className="text-sm text-muted-foreground mt-1">Rating: {submission.problemRating}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProblemSolvingData
