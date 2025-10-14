import { MessageSquare, MessageCircle, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ForumAnalytics = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      <Card>
        <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Total Posts</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Total Replies</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalReplies}</p>
            </div>
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Active Users</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Today's Activity</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.todaysActivity}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumAnalytics;