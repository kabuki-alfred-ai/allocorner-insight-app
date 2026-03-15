import { ReactNode } from"react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { cn } from"@/lib/utils";

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
 className ="" 
}: MetricCardProps) {
 return (
 <Card className={cn("", className)}>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 {title}
 </CardTitle>
 <div className="text-muted-foreground">
 {icon}
 </div>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-2">
 <div className="text-2xl font-medium">{value}</div>
 {trend && (
 <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full flex items-center",
 trend === 'up' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' : 
 trend === 'down' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' : 
 'text-muted-foreground bg-muted'
 )}>
 {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
 </span>
 )}
 </div>
 <div className="flex items-center justify-between mt-1">
 {subtitle && (
 <p className="text-xs text-muted-foreground truncate flex-1">
 {subtitle}
 </p>
 )}
 {badge && (
 <Badge variant="secondary" className="text-[10px] ml-2">
 {badge}
 </Badge>
 )}
 </div>
 </CardContent>
 </Card>
 );
}