import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  badge?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  badge,
  className = "" 
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-chart-positive';
      case 'down': return 'text-chart-negative';
      default: return 'text-chart-neutral';
    }
  };

  return (
    <Card className={cn("premium-card group", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-6 px-8">
        <CardTitle className="label-uppercase group-hover:text-primary/60 transition-colors">
          {title}
        </CardTitle>
        <div className="text-muted-foreground/30 group-hover:text-primary/60 transition-colors duration-500 scale-90 group-hover:scale-110">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-8 px-8">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black font-heading tracking-tight text-foreground group-hover:scale-[1.02] transition-transform duration-500 origin-left">
            {value}
          </div>
          {trend && (
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-lg",
              trend === 'up' ? 'bg-chart-positive/10 text-chart-positive' : 
              trend === 'down' ? 'bg-chart-negative/10 text-chart-negative' : 
              'bg-muted/50 text-muted-foreground'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          {subtitle && (
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-tight truncate">
              {subtitle}
            </p>
          )}
          {badge && (
            <Badge variant="outline" className="text-[9px] font-black py-0 h-4 border-none bg-primary/10 text-primary uppercase tracking-widest rounded-md shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-1000" />
      </CardContent>
    </Card>
  );
}