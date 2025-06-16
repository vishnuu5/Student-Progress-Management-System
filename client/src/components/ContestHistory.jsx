"use client"

import { useState, useEffect } from "react"
import { Calendar, Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import toast from "react-hot-toast"
import { codeforcesApi } from "../services/api"

const ContestHistory = ({ studentId }) => {
    const [contests, setContests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(365)

    useEffect(() => {
        fetchContests()
    }, [studentId, filter])

    const fetchContests = async () => {
        try {
            setLoading(true)
            const data = await codeforcesApi.getContests(studentId, filter)
            setContests(data)
        } catch (error) {
            toast.error("Failed to fetch contest history")
            console.error("Error fetching contests:", error)
        } finally {
            setLoading(false)
        }
    }

    const chartData = contests
        .map((contest) => ({
            date: new Date(contest.contestTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            rating: contest.newRating,
            change: contest.ratingChange,
        }))
        .reverse()

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">Filter by:</span>
                <div className="flex space-x-2">
                    {[30, 90, 365].map((days) => (
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

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : contests.length > 0 ? (
                <>
                    {/* Rating Chart */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-foreground mb-4">Rating Progress</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "6px",
                                            color: "hsl(var(--card-foreground))",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rating"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Contest List */}
                    <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4">Recent Contests</h4>
                        <div className="space-y-3">
                            {contests.map((contest) => (
                                <div key={contest._id} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-foreground">{contest.contestName}</h5>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(contest.contestTime)}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Trophy className="h-4 w-4" />
                                                    <span>Rank: {contest.rank}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-foreground">{contest.newRating}</div>
                                            <div
                                                className={`flex items-center space-x-1 text-sm ${contest.ratingChange >= 0 ? "text-green-500" : "text-red-500"
                                                    }`}
                                            >
                                                {contest.ratingChange >= 0 ? (
                                                    <TrendingUp className="h-4 w-4" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4" />
                                                )}
                                                <span>
                                                    {contest.ratingChange >= 0 ? "+" : ""}
                                                    {contest.ratingChange}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No contest history found for the selected period.</p>
                </div>
            )}
        </div>
    )
}

export default ContestHistory
