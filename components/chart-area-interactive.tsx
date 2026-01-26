"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "An interactive area chart"

interface ChartAreaInteractiveProps {
  defaultTimeRange?: "7d" | "30d" | "90d"
}

const chartConfig = {
  visitors: {
    label: "Visiteurs",
  },
  desktop: {
    label: "Terminées",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "En cours",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type TimeRange = "7d" | "30d" | "90d"

export function ChartAreaInteractive({ defaultTimeRange = "90d" }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(defaultTimeRange)
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useTrackingDashboard()

  React.useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  // Fonction de gestion du changement de période
  const handleTimeRangeChange = React.useCallback((value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") {
      setTimeRange(value)
    }
  }, [])

  // Générer des données basées sur les statistiques
  const generateChartData = React.useCallback(() => {
    if (!dashboardStats) return []

    const daysToGenerate = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const today = new Date()
    
    return Array.from({ length: daysToGenerate }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (daysToGenerate - 1 - i))
      
      // Utiliser les vraies statistiques comme base
      const baseDeliveries = dashboardStats.livraisons_aujourdhui
      
      // Simuler des variations réalistes
      const completedDeliveries = Math.round(
        baseDeliveries * (0.6 + Math.sin(i * 0.3) * 0.2 + Math.random() * 0.2)
      )
      const ongoingDeliveries = Math.round(
        baseDeliveries * (0.3 + Math.cos(i * 0.3) * 0.1 + Math.random() * 0.1)
      )

      return {
        date: date.toISOString().split('T')[0],
        desktop: completedDeliveries,
        mobile: ongoingDeliveries,
      }
    })
  }, [dashboardStats, timeRange])

  const chartData = React.useMemo(() => generateChartData(), [generateChartData])

  const filteredData = React.useMemo(() => {
    if (!dashboardStats || chartData.length === 0) return []

    const today = new Date()
    const daysToKeep = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    
    return chartData.filter((item) => {
      const itemDate = new Date(item.date)
      const cutoffDate = new Date(today)
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      return itemDate >= cutoffDate
    })
  }, [chartData, timeRange, dashboardStats])

  if (dashboardLoading || !dashboardStats) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-[160px]" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Évolution des livraisons</CardTitle>
          <CardDescription>
            Répartition entre livraisons terminées et en cours
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Sélectionner une période"
          >
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              3 derniers mois
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 derniers jours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 derniers jours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={timeRange === "7d" ? 32 : 64}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  month: timeRange === "7d" ? "short" : "numeric",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}