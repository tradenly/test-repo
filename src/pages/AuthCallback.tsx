
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnokiAuth } from '@/hooks/useEnokiAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useEnokiAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing Enoki OAuth callback...');
        console.log('Current URL:', window.location.href);
        
        // Check for OAuth error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const code = urlParams.get('code');
        
        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }
        
        if (code) {
          console.log('Found authorization code, processing with Enoki...');
          await handleOAuthCallback();
          // Redirect to dashboard on success
          navigate('/dashboard');
        } else {
          console.log('No authorization code found, redirecting to auth page');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Enoki OAuth callback error:', error);
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
