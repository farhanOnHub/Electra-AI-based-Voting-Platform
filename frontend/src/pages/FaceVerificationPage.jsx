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
  const [lastDistance, setLastDistance] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const [videoReadyState, setVideoReadyState] = useState(null);
  const [videoTracksInfo, setVideoTracksInfo] = useState(null);
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
      let img;
      if (imageSrc instanceof HTMLVideoElement) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = imageSrc.videoWidth || 640;
          canvas.height = imageSrc.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imageSrc, 0, 0, canvas.width, canvas.height);
          setImageData(canvas.toDataURL('image/jpeg'));
          img = canvas;
        } else {
          img = imageSrc;
        }
      } else if (typeof imageSrc === 'string') {
        img = await faceapi.fetchImage(imageSrc);
      } else {
        img = imageSrc;
      }

      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor()
        .withFaceExpressions();

      if (detections) {
        let localImageData = null;
        if (typeof imageSrc === 'string') {
          localImageData = imageSrc;
          setImageData(imageSrc);
        }

        setFaceDetected(true);
        const descriptorArray = Array.from(detections.descriptor);
        setFaceDescriptor(descriptorArray);

        const expressions = detections.expressions;
        const hasExpression = Object.values(expressions).some(e => e > 0.3);
        setLivenessDetected(hasExpression);

        toast.success('Face detected successfully');

        // If detection came from a live canvas/video element, auto-submit the capture
        if (imageSrc instanceof HTMLCanvasElement || imageSrc instanceof HTMLVideoElement) {
          try {
            // prefer canvas dataURL if available
            if (imageSrc instanceof HTMLCanvasElement) {
              localImageData = imageSrc.toDataURL('image/jpeg');
            } else if (canvasRef.current) {
              localImageData = canvasRef.current.toDataURL('image/jpeg');
            }

            // submit after a short delay to allow state updates
            setTimeout(() => {
              submitCapturedFace({ imageData: localImageData, faceDescriptor: descriptorArray, livenessScore: hasExpression ? 85 : 50 });
            }, 250);
          } catch (autoErr) {
            console.error('Auto-submit error:', autoErr);
          }
        }
      } else {
        setFaceDetected(false);
        setFaceDescriptor(null);
        toast.error('No face detected. Please use a clear photo or a live camera frame with your face visible.');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      toast.error('Failed to detect face');
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera not supported in this browser.');
      return;
    }

    try {
      console.debug('Requesting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try { await videoRef.current.play(); } catch (playErr) { console.debug('video play error', playErr); }
      }
      setStream(mediaStream);

      // Mount the video element immediately so its readyState can update
      setCameraActive(true);

      // update quick diagnostics
      setTimeout(() => {
        setVideoReadyState(videoRef.current?.readyState ?? null);
        try {
          const tracks = mediaStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id }));
          setVideoTracksInfo(tracks);
        } catch (e) {
          setVideoTracksInfo(null);
        }
      }, 50);

      // Wait for the video element to have data. Try a single retry on timeout but keep the video mounted.
      try {
        await waitForVideoReady(videoRef.current, 5000);
        setCameraError('');
      } catch (err) {
        console.warn('Video not ready after stream (first try):', err);
        // attempt one quick restart of the stream
        try {
          if (mediaStream && mediaStream.getTracks) mediaStream.getTracks().forEach(t => t.stop());
        } catch (stopErr) { console.debug('stop tracks error', stopErr); }

        try {
          const retryStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = retryStream;
            try { await videoRef.current.play(); } catch (playErr) { console.debug('video play error (retry)', playErr); }
          }
          setStream(retryStream);
          // update diagnostics
          setTimeout(() => {
            setVideoReadyState(videoRef.current?.readyState ?? null);
            try {
              const tracks = retryStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id }));
              setVideoTracksInfo(tracks);
            } catch (e) { setVideoTracksInfo(null); }
          }, 50);

          await waitForVideoReady(videoRef.current, 7000);
          setCameraError('');
        } catch (retryErr) {
          console.warn('Video not ready after retry:', retryErr);
          setCameraError('Camera initialized but stream is not ready yet. Try clicking Use Live Camera again or check browser camera settings.');
        }
      }
      setFaceDetected(false);
      setFaceDescriptor(null);
      setImageData('');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please grant permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) {
      toast.error('Camera is not ready yet.');
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      // Wait for the video stream to have enough data (with timeout)
      toast.loading('Waiting for camera to initialize...');
      try {
        await waitForVideoReady(video, 5000);
      } catch (err) {
        toast.dismiss();
        console.error('Video ready timeout or error:', err);
        toast.error('Camera failed to initialize in time. Please try again.');
        return;
      }
      toast.dismiss();
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error('Buffer canvas not available.');
      return;
    }

    // Draw the current video frame to canvas before detection
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    console.debug('Captured frame to canvas, running detection...');
    // show immediate feedback
    const loadingToastId = toast.loading('Detecting face...');
    try {
      await detectFace(canvas);
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  const waitForVideoReady = (videoEl, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (!videoEl) return reject(new Error('No video element'));
      if (videoEl.readyState >= 2) return resolve();

      const onLoaded = () => {
        cleanup();
        resolve();
      };

      const onError = (e) => {
        cleanup();
        reject(e || new Error('Video error'));
      };

      const cleanup = () => {
        videoEl.removeEventListener('loadeddata', onLoaded);
        videoEl.removeEventListener('error', onError);
        clearTimeout(timer);
      };

      videoEl.addEventListener('loadeddata', onLoaded);
      videoEl.addEventListener('error', onError);

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('timeout'));
      }, timeout);
    });
  };

  const handleCapture = async () => {
    // Wrap existing capture to use the shared submit function
    if (!imageData || !faceDetected || !faceDescriptor) {
      toast.error('No valid capture available. Please upload a photo or capture a live frame first.');
      return;
    }

    await submitCapturedFace({ imageData, faceDescriptor, livenessScore: livenessDetected ? 85 : 50 });
  };

  const submitCapturedFace = async ({ imageData: imgData, faceDescriptor: descriptor, livenessScore: lScore }) => {
    setLoading(true);
    try {
      console.debug('Submitting face payload', { imgDataSize: imgData?.length, descriptorLen: descriptor?.length, lScore });
      const response = await faceVerificationAPI.captureFaceImage({
        imageData: imgData,
        faceDescriptor: descriptor,
        livenessScore: lScore
      });
      // backend now returns distance for debugging
      if (response.distance !== undefined && response.distance !== null) {
        setLastDistance(response.distance);
        console.debug('Server reported distance:', response.distance);
        toast(`Match distance: ${response.distance.toFixed(4)}`, { icon: '🔎' });
      }
      toast.success(response.message || 'Face verified successfully');
      setStatus({
        faceVerified: true,
        livenessScore: response.livenessScore,
        identityConfidence: response.identityConfidence,
        biometricAnomaly: response.biometricAnomaly,
        lastAttempt: new Date().toISOString()
      });
      // Only navigate if server marked the user as face-verified
      if (response.faceVerified) {
        setStatus(prev => ({ ...prev, faceVerified: true }));
        if (eventId) {
          setTimeout(() => {
            navigate(`/voting/${eventId}?verified=true`);
          }, 1200);
        }
      } else {
        // Enrollment stored but not verified yet
        setStatus(prev => ({ ...prev, faceVerified: false }));
        toast('Enrollment saved. Please complete a live selfie to finish verification.');
      }
    } catch (error) {
      console.error('submitCapturedFace error:', error);
      const serverMsg = error?.response?.data || error?.message || String(error);
      if (serverMsg?.distance !== undefined) {
        setLastDistance(serverMsg.distance);
        toast(`Match distance: ${serverMsg.distance.toFixed(4)}`, { icon: '🔎' });
      }
      toast.error(serverMsg.message || serverMsg || 'Face verification failed');
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
                      {lastDistance !== null && (
                        <p>Last match distance: <span className="text-white">{lastDistance.toFixed(4)}</span></p>
                      )}
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

                <div className="flex flex-col gap-4 mb-4">
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="btn-secondary w-full"
                  >
                    {cameraActive ? 'Stop Live Camera' : 'Use Live Camera'}
                  </button>
                  {cameraError && (
                    <p className="text-red-400 text-sm">{cameraError}</p>
                  )}
                  {(videoReadyState !== null || videoTracksInfo) && (
                    <div className="text-xs text-dark-300 mt-2 bg-black/20 p-2 rounded">
                      <div>Diagnostics:</div>
                      <div>video.readyState: <span className="font-mono">{String(videoReadyState)}</span></div>
                      <div>tracks: <span className="font-mono">{videoTracksInfo ? videoTracksInfo.length : 0}</span></div>
                      {videoTracksInfo && videoTracksInfo.length > 0 && (
                        <div className="mt-1">
                          {videoTracksInfo.map((t) => (
                            <div key={t.id}>- {t.kind} (enabled: {String(t.enabled)})</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {cameraActive && (
                  <div className="space-y-4">
                    <video ref={videoRef} className="w-full h-64 rounded-xl bg-black" autoPlay muted playsInline />
                    <button
                      type="button"
                      onClick={captureFromCamera}
                      disabled={!modelsLoaded || !cameraActive}
                      className="btn-primary w-full"
                    >
                      {modelsLoaded && cameraActive ? 'Capture Live Frame' : 'Preparing...'}
                    </button>
                  </div>
                )}

                {!cameraActive && (
                  <>
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
                              <span>No face detected - please use a clear photo or live camera frame</span>
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
                  </>
                )}

                <canvas ref={canvasRef} className="hidden" />
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
