
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZkLogin } from '@/hooks/useZkLogin';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useZkLogin();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract ID token from URL fragment (Google OAuth 2.0 implicit flow)
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const idToken = urlParams.get('id_token');
        
        if (idToken) {
          await handleOAuthCallback(idToken);
          // Redirect to dashboard on success
          navigate('/dashboard');
        } else {
          // No token found, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">💩 🦛</div>
        <p className="text-white">Processing ZK Login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
