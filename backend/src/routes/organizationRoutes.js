import express from 'express';
import * as organizationController from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, organizationController.createOrganization);
router.get('/:organizationId', authenticate, organizationController.getOrganization);
router.put('/:organizationId', authenticate, organizationController.updateOrganization);
router.post('/:organizationId/domain', authenticate, organizationController.addAllowedDomain);
router.delete('/:organizationId/domain', authenticate, organizationController.removeAllowedDomain);
router.get('/:organizationId/members', authenticate, organizationController.getOrganizationMembers);

export default router;
