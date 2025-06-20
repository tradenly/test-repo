
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZkLogin } from '@/hooks/useZkLogin';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useZkLogin();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing OAuth callback with Enoki...');
        console.log('Current URL:', window.location.href);
        
        // Extract authorization code from URL params (OAuth 2.0 authorization code flow)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }
        
        if (authCode) {
          console.log('Found authorization code, processing with Enoki...');
          const result = await handleOAuthCallback(authCode);
          
          console.log('Authentication result:', result);
          
          // Navigate to dashboard after successful authentication
          navigate('/dashboard');
        } else {
          console.log('No authorization code found, redirecting to auth page');
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
        <p className="text-white">Processing ZK Login with Enoki...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
