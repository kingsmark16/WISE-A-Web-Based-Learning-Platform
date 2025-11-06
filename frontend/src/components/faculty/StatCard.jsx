import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'bg-blue-500', trend }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={`h-4 w-4 ${color} text-white rounded-full p-1 w-6 h-6`} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? 0}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
