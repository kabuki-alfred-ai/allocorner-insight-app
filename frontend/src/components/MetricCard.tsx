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
    <div className={cn("adl-card-flat group relative overflow-hidden", className)}>
      <div className="pt-8 pb-3 px-8 flex items-center justify-between">
        <h3 className="label-uppercase transition-colors group-hover:text-primary/70">
          {title}
        </h3>
        <div className="text-muted-foreground/20 group-hover:text-primary transition-all duration-700 group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="px-8 pb-8 space-y-3">
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-black tracking-tighter text-foreground group-hover:scale-[1.03] transition-transform duration-700 origin-left">
            {value}
          </div>
          {trend && (
            <span className={cn(
              "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center",
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
            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] leading-tight flex-1 truncate">
              {subtitle}
            </p>
          )}
          {badge && (
            <Badge variant="outline" className="text-[9px] font-black py-0 h-4 border-none bg-primary/10 text-primary uppercase tracking-widest rounded-full shrink-0">
              {badge}
            </Badge>
          )}
        </div>
      </div>
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/[0.04] to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
    </div>
  );
}