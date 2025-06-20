
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZkLogin } from '@/hooks/useZkLogin';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useZkLogin();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Fix: Extract ID token from URL fragment (Google OAuth 2.0 implicit flow)
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const idToken = urlParams.get('id_token');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }
        
        if (idToken) {
          console.log('Found ID token, processing...');
          await handleOAuthCallback(idToken);
          // Redirect to dashboard on success
          navigate('/dashboard');
        } else {
          console.log('No token found, redirecting to auth page');
          navigate('/auth');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth?error=' + encodeURIComponent('callback_failed'));
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">💩 🦛</div>
        <p className="text-white">Processing ZK Login...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
