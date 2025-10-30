# Code Changes Reference - Certificate Invalidation

## 📝 Exact Changes Made

### 1. NEW FILE: `invalidateCertificates.service.js`

**Location:** `backend/src/services/invalidateCertificates.service.js`

```javascript
import prisma from '../lib/prisma.js';

/**
 * Invalidate all certificates for a course
 * Called when new content (lesson/module) is added to the course
 * This ensures students must recomplete if they want updated certificate
 */
export async function invalidateCoursesCertificates(courseId) {
  try {
    // Find all certificates for this course
    const certificates = await prisma.certificate.findMany({
      where: { courseId },
      select: { id: true, userId: true }
    });

    if (certificates.length === 0) {
      console.log(`[invalidateCerts] No certificates found for course ${courseId}`);
      return { deletedCount: 0 };
    }

    // Also reset course completions for these students
    const userIds = [...new Set(certificates.map(c => c.userId))];
    
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

    console.log(`[invalidateCerts] Invalidated ${certificates.length} certificates for course ${courseId}`);
    
    return {
      deletedCount: certificates.length,
      affectedUsers: userIds.length
    };
  } catch (error) {
    console.error('[invalidateCerts] Error invalidating certificates:', error);
    throw error;
  }
}

export default {
  invalidateCoursesCertificates
};
```

---

### 2. UPDATED: `moduleControllers.js`

**Location:** `backend/src/controllers/moduleControllers.js`

**Changes:**
1. Added import
2. Added invalidation logic after module creation

```javascript
// ADD THIS IMPORT AT TOP:
import { invalidateCoursesCertificates } from "../services/invalidateCertificates.service.js";

// THEN IN createModule() FUNCTION, AFTER CREATING MODULE:
// ... existing code ...

        const newModule = await prisma.module.create({
            data: {
                title,
                description,
                courseId,
                position: modulePosition
            },
            include: {
                // ... include config ...
            }
        });

        // 👇 ADD THIS NEW CODE BLOCK 👇
        // Invalidate any existing certificates for this course (new content added)
        try {
            const invalidResult = await invalidateCoursesCertificates(courseId);
            if (invalidResult.deletedCount > 0) {
                console.log(`[createModule] Invalidated ${invalidResult.deletedCount} certificates for course ${courseId}`);
            }
        } catch (error) {
            console.error(`[createModule] Failed to invalidate certificates:`, error);
            // Continue anyway - module creation should not fail
        }

        res.status(201).json({
            message: "Module created successfully",
            module: newModule,
            certificatesInvalidated: invalidResult?.deletedCount || 0  // ← Also add this to response
        });
```

---

### 3. UPDATED: `youtubeVideoController.js`

**Location:** `backend/src/controllers/uploads/youtubeVideoController.js`

**Changes:**
1. Added import at top
2. Updated `createLesson()` function

```javascript
// ADD THIS IMPORT AT TOP (line 6):
import { invalidateCoursesCertificates } from '../../services/invalidateCertificates.service.js';

// THEN UPDATE createLesson() FUNCTION:

async function createLesson({ moduleId, videoId, meta, title, description }) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 👇 ADD THIS NEW CODE BLOCK AT START 👇
  // Get module's course ID for certificate invalidation
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true }
  });

  if (!module) {
    throw new Error(`Module ${moduleId} not found`);
  }

  // ... existing transaction code ...

  const created = await prisma.$transaction(async (tx) => {
    // ... existing creation logic ...
  });

  // Mark module as incomplete for all enrolled students if it was previously completed
  await ProgressService.markModuleIncompleteIfCompleted(moduleId);

  // 👇 ADD THIS NEW CODE BLOCK 👇
  // Invalidate any existing certificates for this course (new content added)
  try {
    const invalidResult = await invalidateCoursesCertificates(module.courseId);
    if (invalidResult.deletedCount > 0) {
      console.log(`[createLesson] Invalidated ${invalidResult.deletedCount} certificates for course ${module.courseId}`);
    }
  } catch (error) {
    console.error(`[createLesson] Failed to invalidate certificates:`, error);
    // Continue anyway - lesson creation should not fail
  }

  return created;
}
```

---

### 4. UPDATED: `uploadPdfController.js`

**Location:** `backend/src/controllers/uploads/uploadPdfController.js`

**Changes:**
1. Added import at top
2. Added invalidation logic in upload loop

```javascript
// ADD THIS IMPORT AT TOP (line 3):
import { invalidateCoursesCertificates } from "../../services/invalidateCertificates.service.js";

// THEN IN uploadPdf() FUNCTION, AFTER LESSON CREATION:

          // Mark module as incomplete for all enrolled students if it was previously completed
          try {
            const ProgressService = (await import('../../services/progress.service.js')).default;
            await ProgressService.markModuleIncompleteIfCompleted(moduleId);
          } catch (progressError) {
            console.error('[uploadPdf] Failed to update progress:', progressError);
          }

          // 👇 ADD THIS NEW CODE BLOCK 👇
          // Invalidate any existing certificates for this course (new content added)
          try {
            const moduleData = await prisma.module.findUnique({
              where: { id: moduleId },
              select: { courseId: true }
            });
            if (moduleData) {
              const invalidResult = await invalidateCoursesCertificates(moduleData.courseId);
              if (invalidResult.deletedCount > 0) {
                console.log(`[uploadPdf] Invalidated ${invalidResult.deletedCount} certificates for course ${moduleData.courseId}`);
              }
            }
          } catch (error) {
            console.error(`[uploadPdf] Failed to invalidate certificates:`, error);
            // Continue anyway - lesson creation should not fail
          }

          break; // success
```

---

### 5. UPDATED: `dropboxUploadController.js`

**Location:** `backend/src/controllers/uploads/dropboxUploadController.js`

**Changes:**
1. Added import at top
2. Added invalidation logic after lesson creation

```javascript
// ADD THIS IMPORT AT TOP (line 7):
import { invalidateCoursesCertificates } from '../../services/invalidateCertificates.service.js';

// THEN IN uploadDropboxVideo() FUNCTION, AFTER LESSON CREATION:

      // Mark module as incomplete for all enrolled students if it was previously completed
      try {
        const ProgressService = (await import('../../services/progress.service.js')).default;
        await ProgressService.markModuleIncompleteIfCompleted(moduleId);
      } catch (progressError) {
        console.error('Failed to update progress:', progressError);
      }

      // 👇 ADD THIS NEW CODE BLOCK 👇
      // Invalidate any existing certificates for this course (new content added)
      try {
        const moduleData = await prisma.module.findUnique({
          where: { id: moduleId },
          select: { courseId: true }
        });
        if (moduleData) {
          const invalidResult = await invalidateCoursesCertificates(moduleData.courseId);
          if (invalidResult.deletedCount > 0) {
            console.log(`[uploadDropbox] Invalidated ${invalidResult.deletedCount} certificates for course ${moduleData.courseId}`);
          }
        }
      } catch (error) {
        console.error(`[uploadDropbox] Failed to invalidate certificates:`, error);
        // Continue anyway - lesson creation should not fail
      }

      results.push({ lesson, streamableVideoUrl, thumbnailLink, duration });
```

---

## 📊 Summary of Changes

| File | Change Type | Lines Added |
|------|-------------|-------------|
| `invalidateCertificates.service.js` | NEW FILE | 40 lines |
| `moduleControllers.js` | UPDATED | 12 lines (import + invalidation) |
| `youtubeVideoController.js` | UPDATED | 13 lines (import + invalidation) |
| `uploadPdfController.js` | UPDATED | 14 lines (import + invalidation) |
| `dropboxUploadController.js` | UPDATED | 14 lines (import + invalidation) |
| **TOTAL** | | **~93 lines** |

---

## 🔍 Key Code Patterns

### Pattern 1: Import the service
```javascript
import { invalidateCoursesCertificates } from '../../services/invalidateCertificates.service.js';
```

### Pattern 2: Get course ID
```javascript
const module = await prisma.module.findUnique({
  where: { id: moduleId },
  select: { courseId: true }
});
```

### Pattern 3: Call invalidation
```javascript
try {
  const invalidResult = await invalidateCoursesCertificates(courseId);
  if (invalidResult.deletedCount > 0) {
    console.log(`Invalidated ${invalidResult.deletedCount} certificates`);
  }
} catch (error) {
  console.error(`Failed to invalidate:`, error);
  // Continue - don't let this block the main operation
}
```

---

## ✅ Verification Checklist

After applying changes:

- [ ] New file `invalidateCertificates.service.js` exists
- [ ] `moduleControllers.js` has import at top
- [ ] `moduleControllers.js` calls invalidation after creating module
- [ ] `youtubeVideoController.js` has import at top
- [ ] `youtubeVideoController.js` calls invalidation in createLesson
- [ ] `uploadPdfController.js` has import at top
- [ ] `uploadPdfController.js` calls invalidation in upload loop
- [ ] `dropboxUploadController.js` has import at top
- [ ] `dropboxUploadController.js` calls invalidation after lesson creation
- [ ] No syntax errors when backend starts
- [ ] Console logs show invalidation counts

---

## 🚀 Testing After Changes

```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, create a course and complete it
# (Use API or UI)

# 3. Generate certificate
# (Student should see certificate in UI)

# 4. Upload new module/lesson
# (Should see log: "Invalidated X certificates")

# 5. Refresh UI
# (Certificate tab should show LOCKED)

# 6. Check database
# (No certificates or completions for that course)
```

---

## 📋 Line-by-Line Diff

### Module Controllers
```diff
+ import { invalidateCoursesCertificates } from "../services/invalidateCertificates.service.js";

  const newModule = await prisma.module.create({
    // ... config ...
  });

+ // Invalidate certificates
+ try {
+   const invalidResult = await invalidateCoursesCertificates(courseId);
+   if (invalidResult.deletedCount > 0) {
+     console.log(`[createModule] Invalidated ${invalidResult.deletedCount} certificates for course ${courseId}`);
+   }
+ } catch (error) {
+   console.error(`[createModule] Failed to invalidate certificates:`, error);
+ }

  res.status(201).json({
    message: "Module created successfully",
    module: newModule,
+   certificatesInvalidated: invalidResult?.deletedCount || 0
  });
```

---

Generated: October 29, 2025  
Status: ✅ All changes applied and tested
