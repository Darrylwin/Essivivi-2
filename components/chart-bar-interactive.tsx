"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "An interactive bar chart"

interface ChartBarInteractiveProps {
  timeRange?: "7d" | "30d" | "90d"
}

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarInteractive({ timeRange = "90d" }: ChartBarInteractiveProps) {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useTrackingDashboard()
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop")

  React.useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  // Transformez les données du tableau de bord en format de graphique
  const chartData = React.useMemo(() => {
    if (!dashboardStats) return []

    // Pour l'exemple, créons des données basées sur les statistiques
    // Dans un cas réel, vous auriez des données historiques
    const today = new Date()
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      
      // Simuler des données basées sur les statistiques (déterministes pour éviter Math.random)
      const baseDelivery = dashboardStats.livraisons_aujourdhui
      
      // Use deterministic pseudo-random factors derived from the index to keep render pure
      const desktopFactor = 0.6 + (((i * 73) % 100) / 100) * 0.8
      const mobileFactor = 0.4 + (((i * 37 + 13) % 100) / 100) * 0.6

      return {
        date: date.toISOString().split('T')[0],
        desktop: Math.round(baseDelivery * desktopFactor),
        mobile: Math.round(baseDelivery * mobileFactor),
      }
    })

    return data
  }, [dashboardStats])

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [chartData]
  )

  if (dashboardLoading || !dashboardStats) {
    return (
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex">
            {["desktop", "mobile"].map((key) => (
              <div
                key={key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Livraisons par dispositif</CardTitle>
          <CardDescription>
            Répartition des livraisons sur les 7 derniers jours
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chart === "desktop" ? "Livraisons terminées" : "En cours"}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar 
              dataKey={activeChart} 
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}