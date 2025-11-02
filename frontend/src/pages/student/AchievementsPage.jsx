import AchievementsTab from '@/components/student/AchievementsTab';

const AchievementsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">My Achievements</h1>
        <p className="text-muted-foreground">View all your earned certifications and achievements</p>
      </div>
      <AchievementsTab />
    </div>
  );
};

export default AchievementsPage;
