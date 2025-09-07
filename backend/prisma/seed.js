import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {

    await prisma.user.createMany({
        data: [
            {clerkId: "Test 1", fullName: "test", emailAddress: 'e1.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 2", fullName: "test", emailAddress: 'e2.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 3", fullName: "test", emailAddress: 'e3.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 4", fullName: "test", emailAddress: 'e4.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test e.gmail.com", fullName: "test", emailAddress: 'e5.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 6", fullName: "test", emailAddress: 'e8.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 7", fullName: "test", emailAddress: 'e7.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 8", fullName: "test", emailAddress: 'e6.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 9", fullName: "test", emailAddress: 'e9.@gmail.com', role: 'FACULTY'},
            {clerkId: "Test 10", fullName: "test", emailAddress: 'e10@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 11", fullName: "test", emailAddress: 'e11@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 12", fullName: "test", emailAddress: 'e12@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 13", fullName: "test", emailAddress: 'e14@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 14", fullName: "test", emailAddress: 'e13@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 1e.gmail.com", fullName: "test", emailAddress: 'e14@4.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 16", fullName: "test", emailAddress: 'e22@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 17", fullName: "test", emailAddress: 'e33@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 18", fullName: "test", emailAddress: 'e44@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 19", fullName: "test", emailAddress: 'e45@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 20", fullName: "test", emailAddress: 'e55@.gmail.com', role: 'FACULTY'},
            {clerkId: "Test 21", fullName: "test", emailAddress: 'e56@.gmail.com', role: 'FACULTY'}
        ]
    })
}

seed().then(() => prisma.$disconnect());