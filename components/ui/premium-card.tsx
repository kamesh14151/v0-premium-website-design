import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  gradient?: boolean
}

export function PremiumCard({ children, hover = true, gradient = false, className, ...props }: PremiumCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden backdrop-blur-xl border transition-all duration-300",
        "bg-gradient-to-br from-card/50 to-card/30",
        "dark:from-card/50 dark:to-card/30",
        hover && "hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 hover:scale-[1.02]",
        gradient && "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:opacity-0 before:transition-opacity hover:before:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, description, icon, trend, trendUp }: StatCardProps) {
  return (
    <PremiumCard>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {value}
            </p>
          </div>
          {icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {trend && (
          <p className={cn(
            "text-xs font-medium mt-2 flex items-center gap-1",
            trendUp ? "text-green-500" : "text-amber-500"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </CardContent>
    </PremiumCard>
  )
}
