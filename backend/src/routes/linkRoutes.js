import express from 'express';
import { requireAuth } from '@clerk/express';
import { updateLastActive } from '../middlewares/updateLastActiveMiddleware.js';
import {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
  reorderLinks
} from '../controllers/uploads/linkController.js';

const router = express.Router();

// All link routes require authentication
router.use(requireAuth());
router.use(updateLastActive);

// Routes for link management
router.post('/', createLink);                    // POST /api/link - Create a new link
router.get('/module/:moduleId', getLinks);       // GET /api/link/module/:moduleId - Get all links for a module
router.put('/:id', updateLink);                  // PUT /api/link/:id - Update a link
router.delete('/:id', deleteLink);               // DELETE /api/link/:id - Delete a link
router.post('/module/:moduleId/reorder', reorderLinks); // POST /api/link/module/:moduleId/reorder - Reorder links

export default router;