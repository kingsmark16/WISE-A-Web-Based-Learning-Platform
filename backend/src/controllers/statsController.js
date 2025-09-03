import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTotalCourses = async (req, res) => {
    try {
        const totalCourses = await prisma.course.count();
        const totalUsers = await prisma.user.count();
        const totalStudents = await prisma.user.count({
            where: {
                role: 'STUDENT'
            } 
        })
        const totalFaculty = await prisma.user.count({
            where: {
                role: 'FACULTY'
            }
        });
        const totalAdmins = await prisma.user.count({
            where: {
                role: 'ADMIN'
            }
        });

        const coursesPerCategory = await prisma.course.groupBy({
            by: ['category'],
            _count: {
                category: true
            }
        })

        const formattedCategories = coursesPerCategory.map(item => ({
            category: item.category,
            count: item._count.category
        }))

        res.status(200).json({totalCourses, coursesPerCategory: formattedCategories, totalUsers, totalStudents, totalFaculty, totalAdmins});
    } catch (error) {
        console.log("Error in getTotalCourses controller", error);
        res.status(500).json({message: "Internal sever error"});
    }
}

export const getActiveUsers = async (req, res) => {
    try {
        console.log("Fetching active users...");
        
        // Force today to be September 3rd, 2025 (since that's what your frontend expects)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayString = `${year}-${month}-${day}`;
        
        console.log("Today's date string:", todayString);
        
        // Create proper UTC dates for database queries
        const todayUTC = new Date(todayString + 'T00:00:00.000Z');
        const sevenDaysAgoUTC = new Date(todayUTC);
        sevenDaysAgoUTC.setUTCDate(sevenDaysAgoUTC.getUTCDate() - 7);
        const thirtyDaysAgoUTC = new Date(todayUTC);
        thirtyDaysAgoUTC.setUTCDate(thirtyDaysAgoUTC.getUTCDate() - 30);
        const ninetyDaysAgoUTC = new Date(todayUTC);
        ninetyDaysAgoUTC.setUTCDate(ninetyDaysAgoUTC.getUTCDate() - 90);

        console.log("Date ranges (UTC for database):", {
            todayUTC: todayUTC.toISOString().split('T')[0],
            sevenDaysAgoUTC: sevenDaysAgoUTC.toISOString().split('T')[0],
            thirtyDaysAgoUTC: thirtyDaysAgoUTC.toISOString().split('T')[0],
            ninetyDaysAgoUTC: ninetyDaysAgoUTC.toISOString().split('T')[0]
        });

        // Use raw SQL queries to properly filter by user role and convert dates
        const [
            activeFacultyData7Days,
            activeStudentsData7Days,
            activeFacultyData30Days,
            activeStudentsData30Days,
            activeFacultyData90Days,
            activeStudentsData90Days
        ] = await Promise.all([
            // 7 days - Faculty
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${sevenDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'FACULTY'
            `,
            
            // 7 days - Students
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${sevenDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'STUDENT'
            `,
            
            // 30 days - Faculty
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${thirtyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'FACULTY'
            `,
            
            // 30 days - Students
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${thirtyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'STUDENT'
            `,
            
            // 90 days - Faculty
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${ninetyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'FACULTY'
            `,
            
            // 90 days - Students
            prisma.$queryRaw`
                SELECT DISTINCT "userId"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${ninetyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'STUDENT'
            `
        ]);

        const activeFaculty7Days = activeFacultyData7Days.length;
        const activeStudents7Days = activeStudentsData7Days.length;
        const activeFaculty30Days = activeFacultyData30Days.length;
        const activeStudents30Days = activeStudentsData30Days.length;
        const activeFaculty90Days = activeFacultyData90Days.length;
        const activeStudents90Days = activeStudentsData90Days.length;

        // Get daily active users separated by role using raw SQL
        const [dailyActiveFacultyRaw, dailyActiveStudentsRaw] = await Promise.all([
            // Faculty daily activity
            prisma.$queryRaw`
                SELECT 
                    dua.date as date,
                    COUNT(DISTINCT dua."userId")::integer as "activeUsers"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${ninetyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'FACULTY'
                GROUP BY dua.date
                ORDER BY dua.date ASC
            `,
            
            // Students daily activity
            prisma.$queryRaw`
                SELECT 
                    dua.date as date,
                    COUNT(DISTINCT dua."userId")::integer as "activeUsers"
                FROM "DailyUserActivity" dua
                JOIN "User" u ON dua."userId" = u.id
                WHERE dua.date >= ${ninetyDaysAgoUTC} 
                AND dua.date <= ${todayUTC}
                AND u.role = 'STUDENT'
                GROUP BY dua.date
                ORDER BY dua.date ASC
            `
        ]);

        console.log("Raw daily faculty data count:", dailyActiveFacultyRaw.length);
        console.log("Raw daily students data count:", dailyActiveStudentsRaw.length);

        // Create maps for faster lookup
        const dailyFacultyMap = new Map();
        const dailyStudentsMap = new Map();

        dailyActiveFacultyRaw.forEach(item => {
            const dateString = new Date(item.date).toISOString().split('T')[0];
            dailyFacultyMap.set(dateString, Number(item.activeUsers));
        });

        dailyActiveStudentsRaw.forEach(item => {
            const dateString = new Date(item.date).toISOString().split('T')[0];
            dailyStudentsMap.set(dateString, Number(item.activeUsers));
        });

        // Fill in ALL dates for the last 91 days (90 days ago + today = 91 days)
        const filledDailyData = [];
        
        // Start from 90 days ago and go to today (inclusive)
        const startDate = new Date(ninetyDaysAgoUTC);
        const endDate = new Date(todayUTC);
        
        console.log("Generating dates from:", startDate.toISOString().split('T')[0], "to:", endDate.toISOString().split('T')[0]);
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            filledDailyData.push({
                date: dateString,
                activeFaculty: dailyFacultyMap.get(dateString) || 0,
                activeStudents: dailyStudentsMap.get(dateString) || 0
            });
            
            // Move to next day
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        console.log(`Generated ${filledDailyData.length} days of data`);
        console.log(`First date: ${filledDailyData[0]?.date}, Last date: ${filledDailyData[filledDailyData.length - 1]?.date}`);
        console.log(`Today should be: ${todayUTC.toISOString().split('T')[0]}`);
        console.log(`Active Faculty - 7d: ${activeFaculty7Days}, 30d: ${activeFaculty30Days}, 90d: ${activeFaculty90Days}`);
        console.log(`Active Students - 7d: ${activeStudents7Days}, 30d: ${activeStudents30Days}, 90d: ${activeStudents90Days}`);

        res.status(200).json({
            activeFaculty7Days,
            activeStudents7Days,
            activeFaculty30Days,
            activeStudents30Days,
            activeFaculty90Days,
            activeStudents90Days,
            dailyActiveUsers: filledDailyData
        });

    } catch (error) {
        console.error('Error fetching active users:', error);
        res.status(500).json({
            message: 'Error fetching active users analytics',
            error: error.message
        });
    }
};
