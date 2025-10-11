import { clerkClient } from '@clerk/express';
import prisma from '../lib/prisma.js';

export const authCallback = async (req, res) => {
    try {
        const {id, firstName, lastName, emailAddress, imageUrl} = req.body;

        let clerkUser = await clerkClient.users.getUser(id);

        if(!clerkUser.publicMetadata?.role){
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    role: 'STUDENT'
                }
            })
            clerkUser = await clerkClient.users.getUser(id);
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: id
            }
        });

        const clerkUserRole = clerkUser.publicMetadata?.role;

        if(!user){

           const newUser =  await prisma.user.create({
                data: {
                    clerkId: id,
                    fullName: `${firstName} ${lastName || ""}`,
                    emailAddress,
                    imageUrl,
                    role: clerkUserRole
                }
            })

           return res.status(200).json({message: "User successfully sync to the database", user: newUser})
        } else{
            const updates = {};
            const newFullName = `${firstName} ${lastName || ""}`;

            if(user.fullName !== newFullName) updates.fullName = newFullName;
            if(user.emailAddress !== emailAddress) updates.emailAddress = emailAddress;
            if(user.imageUrl !== imageUrl) updates.imageUrl = imageUrl;
            if(user.role !== clerkUserRole) updates.role = clerkUserRole;

            if(Object.keys(updates).length > 0) {
                const updatedUser = await prisma.user.update({
                    where: {
                        clerkId: id
                    },
                    data: updates
                })
                return res.status(200).json({message: 'User updated successfully', user: updatedUser});
            } else{
                return res.json({message: "User already exist, no changes needed", user});
            }
        }
    } catch (error) {
        console.log("Error in authController", error);
        return res.status(500).json({message: "Internal server error"});
    }
}