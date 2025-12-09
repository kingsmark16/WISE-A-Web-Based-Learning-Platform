import prisma from '../lib/prisma.js';
import { removeObject } from '../storage/providers/supabase.js';


export async function invalidateCoursesCertificates(courseId) {
  try {
    // Find all certificates for this course with certificateNumber to delete storage files
    const certificates = await prisma.certificate.findMany({
      where: { courseId },
      select: { 
        id: true, 
        userId: true,
        certificateNumber: true,
        courseId: true
      }
    });

    if (certificates.length === 0) {
      console.log(`[invalidateCerts] No certificates found for course ${courseId}`);
      return { deletedCount: 0, deletedFiles: 0 };
    }

    // Also reset course completions for these students
    const userIds = [...new Set(certificates.map(c => c.userId))];
    
    // Delete PDF files from Supabase storage
    let deletedFilesCount = 0;
    const currentYear = new Date().getFullYear();
    
    console.log(`[invalidateCerts] Starting to delete ${certificates.length} certificate PDFs from Supabase storage...`);
    
    for (const cert of certificates) {
      try {
        // Reconstruct the storage path: certificates/{year}/{courseId-certificateNumber}.pdf
        // This matches the pattern in certificateStorage.js uploadBufferToSupabase()
        const publicId = `${cert.courseId}-${cert.certificateNumber}`;
        const storageKey = `certificates/${currentYear}/${publicId}.pdf`;
        console.log(`[invalidateCerts] Attempting to delete: ${storageKey}`);
        const result = await removeObject(storageKey);
        deletedFilesCount++;
        console.log(`[invalidateCerts] ✅ Deleted storage file: ${storageKey}`, result);
      } catch (storageError) {
        console.warn(`[invalidateCerts] ❌ Failed to delete storage file for certificate ${cert.certificateNumber}:`, 
          { 
            message: storageError?.message,
            status: storageError?.status,
            statusText: storageError?.statusText,
            error: storageError?.error
          });
        // Continue with next certificate even if storage deletion fails
      }
    }

    // Delete database records
    await Promise.all([
      // Delete all certificates for this course
      prisma.certificate.deleteMany({
        where: { courseId }
      }),
      // Reset course completions for affected students
      prisma.courseCompletion.deleteMany({
        where: {
          courseId,
          userId: { in: userIds }
        }
      })
    ]);

    console.log(`[invalidateCerts] Invalidated ${certificates.length} certificates for course ${courseId} (${deletedFilesCount} files deleted from storage)`);
    
    return {
      deletedCount: certificates.length,
      affectedUsers: userIds.length,
      deletedFiles: deletedFilesCount
    };
  } catch (error) {
    console.error('[invalidateCerts] Error invalidating certificates:', error);
    throw error;
  }
}

export default {
  invalidateCoursesCertificates
};
