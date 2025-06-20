
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZkLogin } from '@/hooks/useZkLogin';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useZkLogin();
  const [status, setStatus] = useState<string>('Processing ZK Login...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        setStatus('Extracting authentication data...');
        
        // Extract ID token from URL fragment (Google OAuth 2.0 implicit flow)
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const idToken = urlParams.get('id_token');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          setStatus('Authentication failed');
          setTimeout(() => {
            navigate('/auth?error=' + encodeURIComponent(error));
          }, 2000);
          return;
        }
        
        if (idToken) {
          console.log('Found ID token, processing...');
          setStatus('Creating secure session...');
          
          await handleOAuthCallback(idToken);
          
          setStatus('Success! Redirecting to dashboard...');
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          console.log('No token found, redirecting to auth page');
          setStatus('No authentication token found');
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Authentication failed - redirecting...');
        setTimeout(() => {
          navigate('/auth?error=' + encodeURIComponent('callback_failed'));
        }, 2000);
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">💩 🦛</div>
        <p className="text-white text-lg mb-4">{status}</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
