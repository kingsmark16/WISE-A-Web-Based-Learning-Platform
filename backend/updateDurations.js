import { PrismaClient } from '@prisma/client';
import { getYouTubeClient } from '../services/googleAuth.js';

const prisma = new PrismaClient();

// YouTube duration format: PT4M13S, PT1H2M3S, PT30S, etc.
function parseDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    console.warn('Invalid duration input:', duration);
    return 0;
  }

  // Handle the P0D case specifically (YouTube still processing)
  if (duration === 'P0D' || duration === 'PT0S') {
    console.warn('Video duration is zero or still processing:', duration);
    return 0;
  }

  // YouTube duration format: PT4M13S, PT1H2M3S, PT30S, etc.
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    console.warn('Failed to parse duration format:', duration);
    return 0;
  }

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

async function updateExistingYouTubeDurations() {
  try {
    console.log('Starting update of existing YouTube lesson durations...');

    // Find all YouTube lessons that don't have duration set or have duration = 0
    const youtubeLessons = await prisma.lesson.findMany({
      where: {
        type: 'YOUTUBE',
        youtubeId: { not: null },
        OR: [
          { duration: null },
          { duration: 0 }
        ]
      },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        duration: true
      }
    });

    console.log(`Found ${youtubeLessons.length} YouTube lessons that need duration updates`);

    if (youtubeLessons.length === 0) {
      console.log('No lessons need updating. Exiting...');
      return;
    }

    const yt = await getYouTubeClient();
    let updatedCount = 0;

    for (const lesson of youtubeLessons) {
      try {
        console.log(`Updating lesson ${lesson.id} (${lesson.title}) with YouTube ID: ${lesson.youtubeId}`);

        // Get video details from YouTube
        const videoDetails = await yt.videos.list({
          part: ['contentDetails'],
          id: [lesson.youtubeId]
        });

        const videoMeta = videoDetails?.data?.items?.[0];
        if (!videoMeta) {
          console.warn(`Could not find YouTube video for lesson ${lesson.id} with ID ${lesson.youtubeId}`);
          continue;
        }

        const durationString = videoMeta.contentDetails?.duration;
        if (!durationString) {
          console.warn(`No duration found for YouTube video ${lesson.youtubeId}`);
          continue;
        }

        const durationSeconds = parseDuration(durationString);
        if (durationSeconds === 0) {
          console.warn(`Parsed duration is 0 for YouTube video ${lesson.youtubeId}`);
          continue;
        }

        // Update the lesson with the duration
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { duration: durationSeconds }
        });

        console.log(`✅ Updated lesson ${lesson.id}: ${lesson.title} -> ${durationSeconds} seconds`);
        updatedCount++;

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Failed to update lesson ${lesson.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} out of ${youtubeLessons.length} lessons`);

  } catch (error) {
    console.error('❌ Error updating YouTube durations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateExistingYouTubeDurations();