import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { faceVerificationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, Shield, ArrowLeft, Loader } from 'lucide-react';

export const FaceVerificationPage = () => {
  const [imageData, setImageData] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await faceVerificationAPI.checkFaceVerification();
        setStatus(response);
      } catch (error) {
        console.error(error);
      }
    };
    loadStatus();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    if (!imageData) {
      toast.error('Please upload a photo first');
      return;
    }

    setLoading(true);
    try {
      const response = await faceVerificationAPI.captureFaceImage({ imageData });
      toast.success(response.message || 'Face verified successfully');
      setStatus({
        faceVerified: true,
        livenessScore: response.livenessScore,
        identityConfidence: response.identityConfidence,
        biometricAnomaly: response.biometricAnomaly,
        lastAttempt: new Date().toISOString()
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Face capture failed');
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
                <input type="file" accept="image/*" onChange={handleFileChange} className="input-field" />
                {imageData && (
                  <img src={imageData} alt="Preview" className="w-full h-64 object-cover rounded-xl mt-4" />
                )}
                <button
                  onClick={handleCapture}
                  disabled={loading}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
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

              <button
                onClick={handleDisable}
                disabled={loading}
                className="btn-secondary w-full mt-8"
              >
                Disable Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
