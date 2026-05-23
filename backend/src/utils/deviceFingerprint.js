import crypto from 'crypto';

/**
 * Generate a device fingerprint from request headers
 * This creates a unique identifier based on browser characteristics
 */
export const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';

  // Create a hash from combined device characteristics
  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
  const hash = crypto.createHash('sha256').update(fingerprintData).digest('hex');

  return hash;
};

/**
 * Generate a secure vote hash
 * Creates a unique hash for each vote to prevent tampering
 */
export const generateVoteHash = (userId, candidateId, eventId, timestamp) => {
  const voteData = `${userId}|${candidateId}|${eventId}|${timestamp}`;
  const hash = crypto.createHash('sha256').update(voteData).digest('hex');
  return hash;
};

/**
 * Check if account is old enough to vote
 * Default minimum age: 10 minutes
 */
export const isAccountOldEnough = (userCreatedAt, minimumMinutes = 10) => {
  const accountAge = Date.now() - new Date(userCreatedAt).getTime();
  const minimumAgeMs = minimumMinutes * 60 * 1000;
  return accountAge >= minimumAgeMs;
};

/**
 * Detect suspicious voting patterns
 */
export const detectSuspiciousActivity = async (Vote, eventId, ipAddress, deviceId) => {
  const suspiciousPatterns = [];

  // Check for multiple votes from same IP in short time
  const recentVotesFromIP = await Vote.countDocuments({
    eventId,
    ipAddress,
    timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
  });

  if (recentVotesFromIP > 3) {
    suspiciousPatterns.push('Multiple votes from same IP in short time');
  }

  // Check for multiple votes from same device
  const votesFromDevice = await Vote.countDocuments({
    eventId,
    deviceId
  });

  if (votesFromDevice > 1) {
    suspiciousPatterns.push('Multiple votes from same device');
  }

  return suspiciousPatterns;
};
