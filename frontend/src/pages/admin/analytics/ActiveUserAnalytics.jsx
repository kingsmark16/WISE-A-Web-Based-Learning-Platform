import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = ""

const chartConfig = {
  activeFaculty: {
    label: "Faculty",
    color: "var(--chart-1)",
  },
  activeStudents: {
    label: "Students",
    color: "var(--chart-2)",
  },
}

export function ActiveUserAnalytics({ activeUsersData, isLoading, error }) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Get the correct local date
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Debug logs
  console.log("Active users data:", activeUsersData)
  console.log("Today's date:", getLocalDateString())

  const filteredData = React.useMemo(() => {
    if (!activeUsersData?.dailyActiveUsers) return []

    // Use local date instead of UTC
    const now = new Date()
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    )

    let daysToSubtract = 89 // For 90 days total

    if (timeRange === "30d") {
      daysToSubtract = 29 // For 30 days total
    } else if (timeRange === "7d") {
      daysToSubtract = 6 // For 7 days total
    }

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    startDate.setHours(0, 0, 0, 0)

    const filtered = activeUsersData.dailyActiveUsers.filter((item) => {
      const itemDate = new Date(item.date + "T12:00:00")
      return itemDate >= startDate && itemDate <= today
    })

    console.log(`Filtered data for ${timeRange}:`, filtered.length, "days")
    console.log(
      "Date range:",
      startDate.toISOString().split("T")[0],
      "to",
      today.toISOString().split("T")[0]
    )
    console.log("Last few dates:", filtered.slice(-5).map((item) => item.date))

    return filtered
  }, [activeUsersData, timeRange])

 
  
  if (isLoading)
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full sm:w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 sm:h-80 w-full" />
        </CardContent>
      </Card>
    )
  if (error)
    return (
      <Card className="w-full border-destructive">
        <CardContent className="flex justify-center p-4 sm:p-8 text-destructive text-sm">
          Error loading active users: {error.message}
        </CardContent>
      </Card>
    )

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d":
        return "last 7 days"
      case "30d":
        return "last 30 days"
      case "90d":
        return "last 3 months"
      default:
        return "last 3 months"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4 space-y-0 border-b pb-3 sm:pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-0.5 sm:gap-1">
          <CardTitle className="text-base sm:text-lg">Active Users</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Showing active faculty and students for the {getTimeRangeLabel()}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-full sm:w-40 rounded-lg text-xs sm:text-sm"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs sm:text-sm">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="w-full overflow-x-auto -mx-3 sm:mx-0">
          <div className="px-3 sm:px-0 min-w-full sm:min-w-0">
            <ChartContainer
              config={chartConfig}
              className="h-64 sm:h-80 w-full"
            >
              <AreaChart data={filteredData} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                <defs>
                  <linearGradient id="fillActiveFaculty" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-activeFaculty)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-activeFaculty)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillActiveStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-activeStudents)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-activeStudents)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value + "T12:00:00")
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                  tick={{ fontSize: 12 }}
                  padding={{ top: 12, bottom: 0 }}
                  allowDecimals={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value + "T12:00:00").toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="activeFaculty"
                  type="monotone"
                  fill="url(#fillActiveFaculty)"
                  stroke="var(--color-activeFaculty)"
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                <Area
                  dataKey="activeStudents"
                  type="monotone"
                  fill="url(#fillActiveStudents)"
                  stroke="var(--color-activeStudents)"
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
