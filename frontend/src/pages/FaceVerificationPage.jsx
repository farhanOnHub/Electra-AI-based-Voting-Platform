import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { faceVerificationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, Shield, ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import * as faceapi from 'face-api.js';

export const FaceVerificationPage = () => {
  const { eventId } = useParams();
  const [imageData, setImageData] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessDetected, setLivenessDetected] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const navigate = useNavigate();
  const imgRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        toast.success('Face detection models loaded');
      } catch (error) {
        console.error('Error loading face-api models:', error);
        toast.error('Failed to load face detection models');
      }
    };

    const loadStatus = async () => {
      try {
        const response = await faceVerificationAPI.checkFaceVerification();
        setStatus(response);
      } catch (error) {
        console.error(error);
      }
    };

    loadModels();
    loadStatus();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setImageData(reader.result);
      setFaceDetected(false);
      setFaceDescriptor(null);

      // Detect face after image loads
      if (modelsLoaded) {
        await detectFace(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const detectFace = async (imageSrc) => {
    try {
      const img = await faceapi.fetchImage(imageSrc);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor()
        .withFaceExpressions();

      if (detections) {
        setFaceDetected(true);
        setFaceDescriptor(Array.from(detections.descriptor));
        
        // Simple liveness detection using expressions
        const expressions = detections.expressions;
        const isNeutral = expressions.neutral > 0.5;
        const hasExpression = Object.values(expressions).some(e => e > 0.3);
        setLivenessDetected(hasExpression);
        
        toast.success('Face detected successfully');
      } else {
        setFaceDetected(false);
        setFaceDescriptor(null);
        toast.error('No face detected in image. Please use a clear photo with your face visible.');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      toast.error('Failed to detect face');
    }
  };

  const handleCapture = async () => {
    if (!imageData) {
      toast.error('Please upload a photo first');
      return;
    }

    if (!faceDetected) {
      toast.error('No face detected. Please use a clear photo with your face visible.');
      return;
    }

    if (!faceDescriptor) {
      toast.error('Face descriptor not extracted. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await faceVerificationAPI.captureFaceImage({
        imageData,
        faceDescriptor,
        livenessScore: livenessDetected ? 85 : 50
      });
      toast.success(response.message || 'Face verified successfully');
      setStatus({
        faceVerified: true,
        livenessScore: response.livenessScore,
        identityConfidence: response.identityConfidence,
        biometricAnomaly: response.biometricAnomaly,
        lastAttempt: new Date().toISOString()
      });
      
      // Navigate back to voting page after successful verification
      if (eventId) {
        setTimeout(() => {
          navigate(`/voting/${eventId}?verified=true`);
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Face verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const response = await faceVerificationAPI.disableFaceVerification();
      toast.success(response.message || 'Face verification disabled');
      setStatus({ faceVerified: false });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={28} className="text-primary-400" />
            <div>
              <h1 className="text-3xl font-bold">Face Verification</h1>
              <p className="text-dark-400">Secure your account and verify your identity before voting.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-3">Verification Status</h2>
                {status?.faceVerified ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle size={20} />
                      <span>You are verified for face-based voting.</span>
                    </div>
                    <div className="grid gap-2 text-sm text-dark-300">
                      <p>Liveness score: <span className="text-white">{status.livenessScore ?? 'N/A'}%</span></p>
                      <p>Identity confidence: <span className="text-white">{status.identityConfidence ?? 'N/A'}%</span></p>
                      <p>Last check: <span className="text-white">{status.lastAttempt ? new Date(status.lastAttempt).toLocaleString() : 'N/A'}</span></p>
                    </div>
                    {status.biometricAnomaly && (
                      <div className="p-3 rounded-xl bg-red-500/10 text-red-300">
                        Biometric anomaly detected. Re-verify your identity with a live selfie.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-dark-300">Face verification is not set up yet.</p>
                )}
              </div>

              <div className="glass p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-3">Upload Your Photo</h2>
                <p className="text-dark-400 mb-4">Use a clear, well-lit selfie for best results.</p>
                
                {!modelsLoaded && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-yellow-300">
                      <Loader size={18} className="animate-spin" />
                      <span className="text-sm">Loading face detection models...</span>
                    </div>
                  </div>
                )}

                <input type="file" accept="image/*" onChange={handleFileChange} className="input-field" disabled={!modelsLoaded} />
                {imageData && (
                  <div className="mt-4">
                    <img src={imageData} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                    <div className="mt-3 space-y-2">
                      {faceDetected && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle size={16} />
                          <span>Face detected successfully</span>
                        </div>
                      )}
                      {!faceDetected && imageData && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertTriangle size={16} />
                          <span>No face detected - please use a clear photo</span>
                        </div>
                      )}
                      {livenessDetected && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle size={16} />
                          <span>Liveness detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleCapture}
                  disabled={loading || !faceDetected || !modelsLoaded}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Camera size={18} />}
                  {status?.faceVerified ? 'Re-capture Face' : 'Capture Face'}
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-3">Why Face Verification?</h2>
              <ul className="space-y-3 text-dark-300">
                <li>• Ensures account ownership during voting.</li>
                <li>• Prevents fraudulent or shared logins.</li>
                <li>• Strengthens trust for high-stakes elections.</li>
                <li>• Works with our secure voting workflow.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
