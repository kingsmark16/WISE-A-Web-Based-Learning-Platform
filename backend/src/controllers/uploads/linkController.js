import { PrismaClient } from '@prisma/client';
import { toPhDateString } from '../../utils/time.js';

const prisma = new PrismaClient();

// Helper function to add Philippine time fields
function withPhTime(obj) {
  const result = { ...obj };
  if (obj.createdAt) {
    result.createdAtPh = toPhDateString(obj.createdAt);
  }
  if (obj.updatedAt) {
    result.updatedAtPh = toPhDateString(obj.updatedAt);
  }
  return result;
}

// Create a new link lesson
export async function createLink(req, res) {
  try {
    const { moduleId, title, description, url, position } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!moduleId || !url) {
      return res.status(400).json({
        message: 'Module ID and URL are required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        message: 'Invalid URL format'
      });
    }

    // Check if module exists and user has access
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            createdById: true,
            facultyId: true
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Check permissions (faculty or admin)
    if (user.id !== module.course.facultyId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create the link
    const created = await prisma.$transaction(async (tx) => {
      // Get the next available position if not provided
      let finalPosition = position;
      if (!finalPosition) {
        const lastLink = await tx.link.findFirst({
          where: { moduleId },
          orderBy: { position: 'desc' }
        });
        finalPosition = lastLink ? lastLink.position + 1 : 1;
      }

      const link = await tx.link.create({
        data: {
          moduleId,
          title: title || 'Link',
          description: description || '',
          url,
          position: finalPosition
        }
      });

      return link;
    });

    const response = withPhTime(created);
    res.status(201).json({
      message: 'Link created successfully',
      link: response
    });

  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({
      message: 'Failed to create link',
      error: error.message
    });
  }
}

// Get all link lessons for a module
export async function getLinks(req, res) {
  try {
    const { moduleId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    // Check if module exists and user has access
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            createdById: true,
            facultyId: true
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Check permissions (faculty or admin)
    if (user.id !== module.course.facultyId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all links for the module
    const links = await prisma.link.findMany({
      where: {
        moduleId
      },
      orderBy: { position: 'asc' }
    });

    const response = links.map(withPhTime);
    res.json({
      links: response,
      count: response.length
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      message: 'Failed to fetch links',
      error: error.message
    });
  }
}

// Update a link lesson
export async function updateLink(req, res) {
  try {
    const { id } = req.params;
    const { title, description, url, position } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!id) {
      return res.status(400).json({ message: 'Link ID is required' });
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          message: 'Invalid URL format'
        });
      }
    }

    // Find the link and check permissions
    const existingLink = await prisma.link.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                createdById: true,
                facultyId: true
              }
            }
          }
        }
      }
    });

    if (!existingLink) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Check permissions (faculty or admin)
    if (user.id !== existingLink.module.course.facultyId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the link
    const updated = await prisma.link.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
        ...(position !== undefined && { position: parseInt(position) })
      }
    });

    const response = withPhTime(updated);
    res.json({
      message: 'Link updated successfully',
      link: response
    });

  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({
      message: 'Failed to update link',
      error: error.message
    });
  }
}

// Delete a link lesson
export async function deleteLink(req, res) {
  try {
    const { id } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!id) {
      return res.status(400).json({ message: 'Link ID is required' });
    }

    // Find the link and check permissions
    const existingLink = await prisma.link.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                createdById: true,
                facultyId: true
              }
            }
          }
        }
      }
    });

    if (!existingLink) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Check permissions (faculty or admin)
    if (user.id !== existingLink.module.course.facultyId && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete the link
    await prisma.link.delete({
      where: { id }
    });

    res.json({
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      message: 'Failed to delete link',
      error: error.message
    });
  }
}

// Reorder links in a module
export async function reorderLinks(req, res) {
  try {
    const { moduleId } = req.params;
    const { orderedLinks } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    console.log('Reorder links request:', { moduleId, orderedLinks: orderedLinks?.length, userId });

    if (!moduleId) {
      console.log('Missing moduleId');
      return res.status(400).json({ message: 'Module ID is required' });
    }

    if (!orderedLinks || !Array.isArray(orderedLinks)) {
      console.log('Invalid orderedLinks:', orderedLinks);
      return res.status(400).json({ message: 'orderedLinks array is required' });
    }

    console.log('Finding module...');
    // Check if user has permission to reorder links in this module
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            createdById: true,
            facultyId: true
          }
        }
      }
    });

    if (!module) {
      console.log('Module not found:', moduleId);
      return res.status(404).json({ message: 'Module not found' });
    }

    console.log('Getting user...');
    // Get user details
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(403).json({ message: 'User not found' });
    }

    console.log('Checking permissions...');
    // Check permissions (faculty or admin)
    if (user.id !== module.course.facultyId && user.role !== 'ADMIN') {
      console.log('Access denied for user:', user.id, 'faculty:', module.course.facultyId, 'role:', user.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    // First, verify that the Link table exists and is accessible
    console.log('Checking Link table existence...');
    try {
      // Try to access the link model to see if it exists
      if (!prisma.link) {
        throw new Error('Link model not found in Prisma client');
      }
      await prisma.link.findFirst({ where: { moduleId } });
      console.log('Link table exists and is accessible');
    } catch (dbError) {
      console.error('Database error - Link table may not exist or Prisma client not updated:', dbError);
      return res.status(500).json({
        message: 'Database schema issue - Link table may not exist or Prisma client needs regeneration',
        error: dbError.message,
        suggestion: 'Run: npx prisma generate && npx prisma db push'
      });
    }

    console.log('Validating links...');
    // Validate that all links exist and belong to this module
    const linkIds = orderedLinks.map(l => l.id);
    const existingLinks = await prisma.link.findMany({
      where: {
        id: { in: linkIds },
        moduleId: moduleId
      },
      select: { id: true }
    });

    console.log('Found', existingLinks.length, 'existing links out of', linkIds.length, 'requested');

    if (existingLinks.length !== linkIds.length) {
      console.log('Missing links:', linkIds.filter(id => !existingLinks.find(l => l.id === id)));
      return res.status(400).json({
        message: 'Some links not found or do not belong to this module'
      });
    }

    console.log('Validating positions...');
    // Validate positions are unique and positive integers
    const positions = orderedLinks.map(l => l.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      console.log('Duplicate positions found:', positions);
      return res.status(400).json({
        message: 'Duplicate positions are not allowed'
      });
    }

    if (positions.some(p => !Number.isInteger(p) || p < 1)) {
      console.log('Invalid positions found:', positions);
      return res.status(400).json({
        message: 'Positions must be positive integers starting from 1'
      });
    }

    console.log('Starting transaction...');
    // Update positions in a transaction using temporary positions to avoid unique constraint conflicts
    const NEG_OFFSET = 1000000;
    const tempUpdates = orderedLinks.map(link => ({
      id: link.id,
      tempPosition: -(link.position + NEG_OFFSET)
    }));

    await prisma.$transaction(async (tx) => {
      // First, set temporary positions for all links
      for (const temp of tempUpdates) {
        console.log('Setting temp position for link', temp.id, 'to', temp.tempPosition);
        await tx.link.update({
          where: { id: temp.id },
          data: { position: temp.tempPosition }
        });
      }

      // Then, set final positions
      for (const link of orderedLinks) {
        console.log('Setting final position for link', link.id, 'to', link.position);
        await tx.link.update({
          where: { id: link.id },
          data: { position: link.position }
        });
      }
    });

    console.log('Transaction completed successfully');

    res.json({
      message: 'Links reordered successfully'
    });

  } catch (error) {
    console.error('Error reordering links:', error);
    res.status(500).json({
      message: 'Failed to reorder links',
      error: error.message
    });
  }
}