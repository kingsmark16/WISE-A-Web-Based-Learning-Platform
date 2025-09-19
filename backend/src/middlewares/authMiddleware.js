import { clerkClient } from '@clerk/express';
export const requireRole = (allowedRole) => async (req, res, next) => {
    try {
        const auth = req.auth();
        const userId = auth?.userId;
        
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        console.log('User ID:', userId);
        
        // Fetch user data from Clerk using the userId
        const user = await clerkClient.users.getUser(userId);
        const userRole = user.publicMetadata?.role;
        
        console.log('User role from Clerk:', userRole);
        console.log('Allowed roles:', allowedRole);

        if (!userRole || !allowedRole.includes(userRole)) {
            console.log('Access denied - role mismatch');
            return res.status(403).json({ message: 'Access denied' });
        }

        console.log('Access granted');
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Authentication error' });
    }
}