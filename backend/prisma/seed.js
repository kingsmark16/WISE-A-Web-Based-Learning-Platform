import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  console.log('Starting seed...');

  const courseId = '01K3EE8Z193HQBFG8GVCSBEM9X';
  const authorId = '01K1R310AMNWCMZMHM72THGH65';

  // Verify course and user exist
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  const author = await prisma.user.findUnique({
    where: { id: authorId }
  });

  if (!course) {
    console.error('Course not found!');
    return;
  }

  if (!author) {
    console.error('Author not found!');
    return;
  }

  console.log(`Found course: ${course.title}`);
  console.log(`Found author: ${author.fullName}`);

  // Get all users for variety in posts
  const allUsers = await prisma.user.findMany();
  console.log(`Found ${allUsers.length} users in database`);

  // Create forum posts
  console.log('Creating forum posts...');
  
  const postData = [
    {
      title: "Welcome to the course!",
      content: "Hello everyone! Welcome to this course. Feel free to ask any questions throughout the semester. Let's make this a great learning experience!",
      courseId: courseId,
      authorId: authorId,
      isPinned: true,
    },
    {
      title: "Question about Assignment 1",
      content: "I'm having trouble understanding the requirements for the first assignment. Can someone help clarify what we need to submit?",
      courseId: courseId,
      authorId: allUsers[Math.min(1, allUsers.length - 1)].id,
    },
    {
      title: "Best resources for learning?",
      content: "What are some good resources you all recommend for this course? I want to get ahead and practice more outside of class.",
      courseId: courseId,
      authorId: allUsers[Math.min(2, allUsers.length - 1)].id,
    },
    {
      title: "Study group formation",
      content: "Is anyone interested in forming a study group for the upcoming midterm? We could meet on Zoom or in the library.",
      courseId: courseId,
      authorId: allUsers[Math.min(3, allUsers.length - 1)].id,
    },
    {
      title: "Clarification on lecture material",
      content: "I'm confused about the topic we covered in the last lecture. Can someone explain it in simpler terms?",
      courseId: courseId,
      authorId: allUsers[Math.min(4, allUsers.length - 1)].id,
    },
    {
      title: "Project idea discussion",
      content: "For the final project, I'm thinking of exploring a specific topic. Does anyone have suggestions or want to collaborate?",
      courseId: courseId,
      authorId: allUsers[Math.min(5, allUsers.length - 1)].id,
    },
    {
      title: "Error in lecture code example",
      content: "I think there might be a small error in the code example from last week's lecture. Can someone verify this?",
      courseId: courseId,
      authorId: allUsers[Math.min(6, allUsers.length - 1)].id,
    },
    {
      title: "Recommended tools and software",
      content: "What tools and software do you all use for this course? Looking for recommendations to improve my workflow.",
      courseId: courseId,
      authorId: allUsers[Math.min(7, allUsers.length - 1)].id,
    },
    {
      title: "Office hours schedule",
      content: "Reminder that office hours are available. Feel free to drop by with any questions!",
      courseId: courseId,
      authorId: authorId,
      isPinned: true,
    },
    {
      title: "Tutorial request",
      content: "I'm completely new to this topic. Is there a good beginner tutorial anyone can recommend?",
      courseId: courseId,
      authorId: allUsers[Math.min(8, allUsers.length - 1)].id,
    },
    {
      title: "Tips and tricks",
      content: "What are your best tips for succeeding in this course? I'm struggling with some concepts.",
      courseId: courseId,
      authorId: allUsers[Math.min(9, allUsers.length - 1)].id,
    },
    {
      title: "Help with assignment",
      content: "I'm trying to complete the assignment but getting stuck on a specific part. Any suggestions?",
      courseId: courseId,
      authorId: allUsers[Math.min(10, allUsers.length - 1)].id,
    },
    {
      title: "Looking for study partner",
      content: "Looking for someone to study with. It would be great to learn from each other!",
      courseId: courseId,
      authorId: allUsers[Math.min(11, allUsers.length - 1)].id,
    },
    {
      title: "Career advice related to course",
      content: "How does this course material relate to real-world applications? Any career advice?",
      courseId: courseId,
      authorId: allUsers[Math.min(12, allUsers.length - 1)].id,
    },
    {
      title: "Problem-solving strategies",
      content: "What strategies do you all use when working on difficult problems? I spend hours trying to find solutions.",
      courseId: courseId,
      authorId: allUsers[Math.min(13, allUsers.length - 1)].id,
    },
    {
      title: "Extension request discussion",
      content: "Would it be possible to discuss deadline extensions? Many of us have multiple deadlines this week.",
      courseId: courseId,
      authorId: allUsers[Math.min(14, allUsers.length - 1)].id,
    },
    {
      title: "Sharing helpful resources",
      content: "I created a study guide for the upcoming exam. Would anyone like me to share it?",
      courseId: courseId,
      authorId: allUsers[Math.min(15, allUsers.length - 1)].id,
    },
    {
      title: "Additional practice recommendations",
      content: "Where can I find additional practice problems? Looking for ways to improve my understanding.",
      courseId: courseId,
      authorId: allUsers[Math.min(16, allUsers.length - 1)].id,
    },
    {
      title: "Advanced topics discussion",
      content: "For those interested in going deeper, what advanced topics should we explore after this course?",
      courseId: courseId,
      authorId: allUsers[Math.min(17, allUsers.length - 1)].id,
    },
    {
      title: "Understanding complex concepts",
      content: "Can someone explain this complex concept in simpler terms? I'm having trouble wrapping my head around it.",
      courseId: courseId,
      authorId: allUsers[Math.min(18, allUsers.length - 1)].id,
    },
    {
      title: "Thank you and appreciation",
      content: "Just wanted to say thanks to everyone for making this such a supportive learning environment!",
      courseId: courseId,
      authorId: allUsers[Math.min(19, allUsers.length - 1)].id,
    },
    {
      title: "Review session organization",
      content: "Should we organize a review session before the final exam? Who would be interested?",
      courseId: courseId,
      authorId: allUsers[Math.min(20, allUsers.length - 1)].id,
    },
    {
      title: "Group project coordination",
      content: "For those in group projects, how are you coordinating? What tools are you using?",
      courseId: courseId,
      authorId: allUsers[Math.min(21, allUsers.length - 1)].id,
    },
    {
      title: "Common mistakes to avoid",
      content: "What are the most common mistakes people make in this course? Let's help each other avoid them!",
      courseId: courseId,
      authorId: allUsers[Math.min(22, allUsers.length - 1)].id,
    },
    {
      title: "Extra credit opportunities",
      content: "Are there any extra credit opportunities available? Looking for ways to improve my grade.",
      courseId: courseId,
      authorId: allUsers[Math.min(23, allUsers.length - 1)].id,
    },
    {
      title: "Feedback on teaching style",
      content: "I really appreciate the teaching approach in this course. The explanations are very clear!",
      courseId: courseId,
      authorId: allUsers[Math.min(24, allUsers.length - 1)].id,
    },
  ];

  const createdPosts = [];
  for (const post of postData) {
    const created = await prisma.forumPost.create({
      data: post
    });
    createdPosts.push(created);
  }
  console.log(`Created ${createdPosts.length} forum posts`);

  // Create some replies for variety
  console.log('Creating forum replies...');
  
  const replyData = [
    {
      postId: createdPosts[1].id, // Reply to "Question about Assignment 1"
      content: "You need to submit all required files by the deadline. Make sure to include documentation.",
      authorId: authorId,
    },
    {
      postId: createdPosts[1].id,
      content: "Thanks! That helps a lot.",
      authorId: allUsers[Math.min(1, allUsers.length - 1)].id,
    },
    {
      postId: createdPosts[2].id, // Reply to "Best resources for learning?"
      content: "I highly recommend checking the course materials first. They're comprehensive.",
      authorId: authorId,
    },
    {
      postId: createdPosts[2].id,
      content: "Also check out the library resources!",
      authorId: allUsers[Math.min(2, allUsers.length - 1)].id,
    },
    {
      postId: createdPosts[3].id, // Reply to "Study group formation"
      content: "I'm interested! When were you thinking?",
      authorId: allUsers[Math.min(3, allUsers.length - 1)].id,
    },
    {
      postId: createdPosts[3].id,
      content: "Count me in too!",
      authorId: allUsers[Math.min(4, allUsers.length - 1)].id,
    },
    {
      postId: createdPosts[4].id, // Reply to "Clarification on lecture material"
      content: "Let me explain it in a different way that might help...",
      authorId: authorId,
    },
    {
      postId: createdPosts[6].id, // Reply to "Error in lecture code example"
      content: "Thanks for catching that! I'll update the materials.",
      authorId: authorId,
    },
  ];

  for (const reply of replyData) {
    await prisma.forumReply.create({
      data: reply
    });
  }
  console.log(`Created ${replyData.length} forum replies`);

  console.log('Seed completed successfully!');
};

seed()
  .then(() => {
    console.log('Disconnecting from database...');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seed error:', e);
    return prisma.$disconnect();
  });