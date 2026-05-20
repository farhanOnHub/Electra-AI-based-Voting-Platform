import User from '../models/User.js';
import crypto from 'crypto';

// Simulate face detection/verification with image processing
const processFaceImage = (imageData) => {
  // In production, use face-api.js or a real biometrics service
  // For now, create a hash of the image so we can compare captures
  const hash = crypto.createHash('sha256').update(imageData).digest('hex');
  return hash;
};

const calculateLivenessScore = (imageData) => {
  const normalized = imageData.replace(/^data:image\/\w+;base64,/, '');
  const length = normalized.length;
  let score = Math.min(95, Math.max(35, (length / 20000) * 100));

  if (/png|jpeg|jpg/.test(imageData)) {
    score += 5;
  }

  if (imageData.includes('data:image') && length > 25000) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
};

const compareFaceHashes = (hash1, hash2) => {
  if (!hash1 || !hash2) return 0;
  const minLength = Math.min(hash1.length, hash2.length);
  let differences = 0;

  for (let i = 0; i < minLength; i++) {
    if (hash1[i] !== hash2[i]) differences += 1;
  }

  const similarity = 100 - (differences / minLength) * 100;
  return Number(Math.max(0, Math.min(100, similarity)).toFixed(2));
};

const detectBiometricAnomaly = (livenessScore, identityConfidence) => {
  return livenessScore < 60 || identityConfidence < 70;
};

export const captureFaceImage = async (req, res) => {
  try {
    const { imageData } = req.body;
    const userId = req.userId;

    if (!imageData) {
      return res.status(400).json({ message: 'Image data required' });
    }

    const faceHash = processFaceImage(imageData);
    const livenessScore = calculateLivenessScore(imageData);

    const user = await User.findById(userId);
    const previousHash = user?.faceVerificationImage;
    const identityConfidence = previousHash
      ? compareFaceHashes(previousHash, faceHash)
      : 100;

    const biometricAnomaly = detectBiometricAnomaly(livenessScore, identityConfidence);

    if (previousHash && identityConfidence < 70) {
      return res.status(400).json({
        message: 'Face does not match your enrolled profile. Please try again with a live selfie.',
        identityConfidence,
        livenessScore,
        biometricAnomaly
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        faceVerificationImage: faceHash,
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
      biometricAnomaly
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyFaceBeforeVote = async (req, res) => {
  try {
    const { imageData } = req.body;
    const userId = req.userId;

    if (!imageData) {
      return res.status(400).json({ message: 'Image data required' });
    }

    const user = await User.findById(userId);

    if (!user.faceVerified || !user.faceVerificationImage) {
      return res.status(400).json({
        message: 'Face verification not set up. Please set up face verification first.',
        verified: false
      });
    }

    const newFaceHash = processFaceImage(imageData);
    const currentConfidence = compareFaceHashes(user.faceVerificationImage, newFaceHash);
    const livenessScore = calculateLivenessScore(imageData);
    const biometricAnomaly = detectBiometricAnomaly(livenessScore, currentConfidence);

    const verified = currentConfidence >= 70 && livenessScore >= 55;

    if (!verified) {
      return res.status(400).json({
        message: 'Face verification failed. Please try again with a live selfie.',
        verified: false,
        identityConfidence: currentConfidence,
        livenessScore,
        biometricAnomaly
      });
    }

    await User.findByIdAndUpdate(userId, {
      identityConfidence: currentConfidence,
      faceLivenessScore: livenessScore,
      biometricAnomaly,
      lastFaceVerificationAttempt: new Date()
    });

    res.json({
      message: 'Face verified successfully',
      verified: true,
      identityConfidence: currentConfidence,
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
