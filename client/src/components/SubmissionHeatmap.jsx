const SubmissionHeatmap = ({ data }) => {
    // Generate last 365 days
    const generateDates = () => {
        const dates = []
        const today = new Date()

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            dates.push(date.toISOString().split("T")[0])
        }

        return dates
    }

    const dates = generateDates()
    const maxSubmissions = Math.max(...Object.values(data || {}), 1)

    const getIntensity = (count) => {
        if (!count) return 0
        return Math.min(Math.ceil((count / maxSubmissions) * 4), 4)
    }

    const getColor = (intensity) => {
        const colors = [
            "bg-muted", // 0 submissions
            "bg-green-200 dark:bg-green-900", // 1-25%
            "bg-green-300 dark:bg-green-700", // 26-50%
            "bg-green-400 dark:bg-green-600", // 51-75%
            "bg-green-500 dark:bg-green-500", // 76-100%
        ]
        return colors[intensity]
    }

    // Group dates by weeks
    const weeks = []
    for (let i = 0; i < dates.length; i += 7) {
        weeks.push(dates.slice(i, i + 7))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Submission activity over the last year</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex space-x-1">
                        {[0, 1, 2, 3, 4].map((intensity) => (
                            <div key={intensity} className={`w-3 h-3 rounded-sm ${getColor(intensity)}`} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex flex-col space-y-1 min-w-full">
                    {/* Day labels */}
                    <div className="flex space-x-1 mb-2">
                        <div className="w-8"></div> {/* Spacer for day labels */}
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col space-y-1">
                                {week.map((date, dayIndex) => {
                                    if (dayIndex === 0 && weekIndex % 4 === 0) {
                                        const monthName = new Date(date).toLocaleDateString("en-US", { month: "short" })
                                        return (
                                            <div key={date} className="text-xs text-muted-foreground w-3 text-center">
                                                {monthName}
                                            </div>
                                        )
                                    }
                                    return <div key={date} className="w-3 h-3"></div>
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex space-x-1">
                        {/* Day of week labels */}
                        <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
                            <div className="h-3"></div>
                            <div>Mon</div>
                            <div className="h-3"></div>
                            <div>Wed</div>
                            <div className="h-3"></div>
                            <div>Fri</div>
                            <div className="h-3"></div>
                        </div>

                        {/* Heatmap cells */}
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col space-y-1">
                                {week.map((date) => {
                                    const count = data?.[date] || 0
                                    const intensity = getIntensity(count)

                                    return (
                                        <div
                                            key={date}
                                            className={`w-3 h-3 rounded-sm heatmap-cell ${getColor(intensity)}`}
                                            title={`${date}: ${count} submissions`}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubmissionHeatmap
