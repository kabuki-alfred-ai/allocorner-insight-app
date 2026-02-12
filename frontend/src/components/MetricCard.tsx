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
    <Card className={cn("group relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-5 px-5">
        <CardTitle className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
          {title}
        </CardTitle>
        <div className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-5 px-5">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black font-heading tracking-tighter text-foreground">
            {value}
          </div>
          {trend && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-chart-positive/10 text-chart-positive' : 
              trend === 'down' ? 'bg-chart-negative/10 text-chart-negative' : 
              'bg-muted text-muted-foreground'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          {subtitle && (
            <p className="text-[10px] font-bold text-muted-foreground/80 leading-tight">
              {subtitle}
            </p>
          )}
          {badge && (
            <Badge variant="outline" className="text-[9px] font-black py-0 h-4 border-primary/10 bg-primary/5 text-primary uppercase tracking-widest rounded-md shrink-0">
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}