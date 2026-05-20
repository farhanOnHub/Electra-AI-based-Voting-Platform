import Organization from '../models/Organization.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const createOrganization = async (req, res) => {
  try {
    const { name, email, logo, allowedDomains } = req.body;
    const userId = req.userId;

    // Check if organization exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    const apiKey = crypto.randomBytes(32).toString('hex');

    const organization = new Organization({
      name,
      email,
      logo,
      adminUser: userId,
      allowedDomains: allowedDomains || [],
      apiKey
    });

    await organization.save();

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        organizationId: organization._id,
        organizationName: name,
        role: 'admin'
      },
      { new: true }
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization,
      apiKey
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId)
      .populate('adminUser', 'name email')
      .populate('members', 'name email')
      .populate('events');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ organization });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { name, logo, theme, allowedDomains, settings } = req.body;
    const userId = req.userId;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Authorization check
    if (organization.adminUser.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (name) organization.name = name;
    if (logo) organization.logo = logo;
    if (theme) organization.theme = theme;
    if (allowedDomains) organization.allowedDomains = allowedDomains;
    if (settings) organization.settings = { ...organization.settings, ...settings };

    await organization.save();

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAllowedDomain = async (req, res) => {
  try {
    const { organizationId, domain } = req.body;
    const userId = req.userId;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.adminUser.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if domain already added
    const domainExists = organization.allowedDomains.some(d => d.domain === domain);
    if (domainExists) {
      return res.status(400).json({ message: 'Domain already added' });
    }

    organization.allowedDomains.push({
      domain,
      verified: false
    });

    await organization.save();

    res.json({
      message: 'Domain added. Verify domain ownership.',
      organization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAllowedDomain = async (req, res) => {
  try {
    const { organizationId, domain } = req.body;
    const userId = req.userId;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.adminUser.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    organization.allowedDomains = organization.allowedDomains.filter(d => d.domain !== domain);
    await organization.save();

    res.json({
      message: 'Domain removed',
      organization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmailDomain = (email, allowedDomains) => {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // No restrictions
  }

  const emailDomain = email.split('@')[1];
  return allowedDomains.some(d => d.domain === emailDomain && d.verified);
};

export const getOrganizationMembers = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId)
      .populate('members', 'name email role');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ members: organization.members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
