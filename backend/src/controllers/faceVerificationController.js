import User from '../models/User.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Real face verification using face-api.js descriptors
const calculateEuclideanDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return 1.0; // Maximum distance (no match)
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

const calculateIdentityConfidence = (distance) => {
  // face-api.js typically uses 0.6 as threshold for same person
  // Distance < 0.4: very confident match
  // Distance 0.4-0.6: confident match
  // Distance > 0.6: different person
  const threshold = 0.6;
  const maxDistance = 1.0;
  
  if (distance >= maxDistance) return 0;
  if (distance <= 0.3) return 100;
  
  // Linear interpolation between 0.3 and 0.6
  const confidence = 100 - ((distance - 0.3) / (threshold - 0.3)) * 100;
  return Math.max(0, Math.min(100, confidence));
};

const detectBiometricAnomaly = (livenessScore, identityConfidence) => {
  return livenessScore < 60 || identityConfidence < 70;
};

export const captureFaceImage = async (req, res) => {
  try {
    const { imageData, faceDescriptor, livenessScore: frontendLivenessScore } = req.body;
    const userId = req.userId || 'unknown';

    // Log incoming request for debugging
    try {
      const logDir = path.resolve('logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const entry = {
        timestamp: new Date().toISOString(),
        route: 'captureFaceImage',
        userId,
        descriptorLength: Array.isArray(faceDescriptor) ? faceDescriptor.length : (faceDescriptor?.length ?? null),
        imageDataSize: typeof imageData === 'string' ? imageData.length : null
      };
      fs.appendFileSync(path.join(logDir, 'face-debug.log'), JSON.stringify(entry) + '\n');
      console.info('face-debug:', entry);
    } catch (logErr) {
      console.debug('Failed to write face debug log', logErr);
    }

    if (!imageData) {
      return res.status(400).json({ message: 'Image data required' });
    }

    if (!faceDescriptor) {
      return res.status(400).json({ message: 'Face descriptor required. Please ensure face detection is working.' });
    }

    const user = await User.findById(userId);
    const previousDescriptor = user?.faceVerificationImage;
    
    let identityConfidence = 100;
    let livenessScore = frontendLivenessScore || 75;
    let distance = null;

    if (previousDescriptor) {
      // Compare face descriptors using Euclidean distance
      distance = calculateEuclideanDistance(previousDescriptor, faceDescriptor);
      identityConfidence = calculateIdentityConfidence(distance);
      console.debug(`Face verification distance for user ${userId}:`, distance);
    }

    const biometricAnomaly = detectBiometricAnomaly(livenessScore, identityConfidence);

    if (previousDescriptor && identityConfidence < 70) {
      return res.status(400).json({
        message: 'Face does not match your enrolled profile. Please try again with a live selfie.',
        identityConfidence,
        livenessScore,
        biometricAnomaly,
        distance
      });
    }

    // If this is the first time (no previous descriptor), store the descriptor
    // and mark the user verified immediately (first-capture enrollment).
    if (!previousDescriptor) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          faceVerificationImage: faceDescriptor,
          faceVerified: true,
          faceVerificationDate: new Date(),
          faceLivenessScore: livenessScore,
          identityConfidence,
          biometricAnomaly,
          lastFaceVerificationAttempt: new Date()
        },
        { new: true }
      );

      return res.json({
        message: 'Face captured and verified successfully (enrolled)',
        faceVerified: true,
        livenessScore,
        identityConfidence,
        biometricAnomaly,
        distance
      });
    }

    // Existing flow for users who already have an enrolled descriptor
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        faceVerificationImage: faceDescriptor,
        faceVerified: true,
        faceVerificationDate: new Date(),
        faceLivenessScore: livenessScore,
        identityConfidence,
        biometricAnomaly,
        lastFaceVerificationAttempt: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Face captured and verified successfully',
      faceVerified: true,
      livenessScore,
      identityConfidence,
      biometricAnomaly,
      distance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyFaceBeforeVote = async (req, res) => {
  try {
    const { imageData, faceDescriptor, livenessScore: frontendLivenessScore } = req.body;
    const userId = req.userId;

    if (!imageData) {
      return res.status(400).json({ message: 'Image data required' });
    }

    if (!faceDescriptor) {
      return res.status(400).json({ message: 'Face descriptor required. Please ensure face detection is working.' });
    }

    const user = await User.findById(userId);

    if (!user.faceVerified || !user.faceVerificationImage) {
      return res.status(400).json({
        message: 'Face verification not set up. Please set up face verification first.',
        verified: false
      });
    }

    // Compare face descriptors using Euclidean distance
    const distance = calculateEuclideanDistance(user.faceVerificationImage, faceDescriptor);
    const identityConfidence = calculateIdentityConfidence(distance);
    const livenessScore = frontendLivenessScore || 75;
    const biometricAnomaly = detectBiometricAnomaly(livenessScore, identityConfidence);
    console.debug(`Face verify-before-vote distance for user ${userId}:`, distance);

    const verified = identityConfidence >= 70 && livenessScore >= 55;

    if (!verified) {
      return res.status(400).json({
        message: 'Face verification failed. Please try again with a live selfie.',
        verified: false,
        identityConfidence,
        livenessScore,
        biometricAnomaly,
        distance
      });
    }

    await User.findByIdAndUpdate(userId, {
      identityConfidence,
      faceLivenessScore: livenessScore,
      biometricAnomaly,
      lastFaceVerificationAttempt: new Date()
    });

    res.json({
      message: 'Face verified successfully',
      verified: true,
      identityConfidence,
      livenessScore,
      biometricAnomaly
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disableFaceVerification = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        faceVerificationImage: null,
        faceVerified: false
      },
      { new: true }
    );

    res.json({
      message: 'Face verification disabled',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const isFaceVerified = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select(
      'faceVerified faceVerificationDate faceLivenessScore identityConfidence biometricAnomaly lastFaceVerificationAttempt'
    );

    res.json({
      faceVerified: user.faceVerified,
      faceVerificationDate: user.faceVerificationDate,
      livenessScore: user.faceLivenessScore,
      identityConfidence: user.identityConfidence,
      biometricAnomaly: user.biometricAnomaly,
      lastAttempt: user.lastFaceVerificationAttempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
