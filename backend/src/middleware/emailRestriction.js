import Organization from '../models/Organization.js';

export const validateEmailDomain = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const domain = email.split('@')[1].toLowerCase();
    
    // Get all allowed organizations
    const organizations = await Organization.find({ isActive: true });
    const allowedDomains = organizations.map(org => org.allowedDomains).flat();

    // If no organizations exist or no domains restricted, allow all
    if (allowedDomains.length === 0) {
      return next();
    }

    // Check if email domain is allowed
    if (!allowedDomains.includes(domain)) {
      return res.status(403).json({ 
        message: 'Email domain not authorized. Please use your organization email.',
        allowedDomains 
      });
    }

    // Add organization info to request
    const organization = organizations.find(org => org.allowedDomains.includes(domain));
    req.organization = organization;

    next();
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({ message: 'Email validation failed' });
  }
};

export const addOrganizationToUser = (req, res, next) => {
  if (req.organization) {
    req.body.organizationId = req.organization._id;
    req.body.organizationName = req.organization.name;
  }
  next();
};
