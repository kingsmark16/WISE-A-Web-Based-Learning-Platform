import React, { useMemo } from "react";

const ModuleStats = ({ modules = [] }) => {
  const stats = useMemo(() => {
    const totalModules = modules.length;
    const totalLessons = modules.reduce((sum, m) => sum + (m._count?.videoLessons ?? 0), 0);
    // support multiple possible _count keys for quizzes (defensive)
    const totalQuizzes = modules.reduce((sum, m) => {
      return sum + (
        (m._count?.quizzes ?? m._count?.quiz ?? m._count?.quizCount ?? 0)
      );
    }, 0);

    return { totalModules, totalLessons, totalQuizzes };
  }, [modules]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 rounded-md border bg-card shadow-sm border-input">
        <div className="text-xs text-muted-foreground">Total modules</div>
        <div className="text-xl font-semibold">{stats.totalModules}</div>
      </div>
      <div className="p-4 rounded-md border bg-card shadow-sm border-input">
        <div className="text-xs text-muted-foreground">Total lessons</div>
        <div className="text-xl font-semibold">{stats.totalLessons}</div>
      </div>
      <div className="p-4 rounded-md border bg-card shadow-sm border-input">
        <div className="text-xs text-muted-foreground">Total quizzes</div>
        <div className="text-xl font-semibold">{stats.totalQuizzes}</div>
      </div>
    </div>
  );
};

export default ModuleStats;