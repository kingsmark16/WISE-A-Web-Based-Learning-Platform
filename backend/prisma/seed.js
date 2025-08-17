import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {

    await prisma.course.createMany({
        data: [
            {title: "Test 1", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 2", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 3", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 4", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 5", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 6", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 7", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 8", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 9", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 10", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 11", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 12", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 13", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 14", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 15", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 16", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 17", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 18", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 19", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 20", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"},
            {title: "Test 21", category: "test", estimatedHours: 5, requiresApproval: true, isPublished: false, createdById: "01K1R310AMNWCMZMHM72THGH65"}
        ]
    })
}

seed().then(() => prisma.$disconnect());