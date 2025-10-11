import prisma from '../lib/prisma.js';

export const updateLastActive = async (req, res, next) => {
    try {
        if (req.auth && req.auth.userId) {
            // Update user's last active time with current UTC time
            prisma.user.update({
                where: { clerkId: req.auth.userId },
                data: { lastActiveAt: new Date() }
            }).catch(err => {
                if (!err.message.includes('Record to update not found')) {
                    console.error('Error updating last active time:', err);
                }
            });

            // For daily activity, we need to use local date but store it properly
            // Get current local date and convert to UTC midnight
            const now = new Date();
            const localYear = now.getFullYear();
            const localMonth = now.getMonth();
            const localDate = now.getDate();
            
            // Create a date that represents today in local timezone but stored as UTC
            // This ensures the date stored matches what the frontend expects
            const todayUTC = new Date(Date.UTC(localYear, localMonth, localDate));
            
            console.log('Storing daily activity for date:', todayUTC.toISOString().split('T')[0]);

            // Track daily activity
            prisma.user.findUnique({
                where: { clerkId: req.auth.userId },
                select: { id: true }
            }).then(user => {
                if (user) {
                    prisma.dailyUserActivity.upsert({
                        where: {
                            userId_date: {
                                userId: user.id,
                                date: todayUTC
                            }
                        },
                        update: {}, // Do nothing if already exists for today
                        create: {
                            userId: user.id,
                            date: todayUTC
                        }
                    }).catch(err => console.error('Error tracking daily activity:', err));
                }
            }).catch(err => console.error('Error finding user for daily activity:', err));
        }
        next();
    } catch (error) {
        console.error('Error in updateLastActive middleware:', error);
        next(); // Continue even if this fails
    }
};