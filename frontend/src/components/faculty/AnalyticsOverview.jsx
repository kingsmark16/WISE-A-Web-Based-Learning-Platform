import CourseStatusDistribution from './CourseStatusDistribution';
import ContentOverviewChart from './ContentOverviewChart';

const AnalyticsOverview = ({ courseStats }) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Pie Chart + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourseStatusDistribution courseStats={courseStats} />
        <ContentOverviewChart courseStats={courseStats} />
      </div>
    </div>
  );
};

export default AnalyticsOverview;
