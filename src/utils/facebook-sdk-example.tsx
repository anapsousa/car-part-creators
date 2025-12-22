/**
 * Example: How to use Facebook SDK login status checking
 * 
 * NOTE: This is for Facebook SDK native login, NOT Supabase OAuth.
 * For Supabase OAuth, you don't need any of this - just use:
 * 
 *   await supabase.auth.signInWithOAuth({ provider: 'facebook' })
 * 
 * This example is only if you want to use Facebook SDK features
 * alongside or instead of Supabase OAuth.
 */

import { useEffect, useState } from 'react';
import { 
  initFacebookSDK, 
  getFacebookLoginStatus, 
  loginWithFacebookSDK,
  logoutFromFacebookSDK,
  type FacebookLoginStatusResponse 
} from './facebook-sdk';

export function FacebookSDKExample() {
  const [loginStatus, setLoginStatus] = useState<FacebookLoginStatusResponse | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Initialize Facebook SDK
    initFacebookSDK()
      .then(() => {
        setSdkLoaded(true);
        // Check login status on load
        checkLoginStatus();
      })
      .catch((error) => {
        console.error('Failed to load Facebook SDK:', error);
      });
  }, []);

  const checkLoginStatus = () => {
    getFacebookLoginStatus((response) => {
      setLoginStatus(response);
      
      // Handle different statuses
      if (response.status === 'connected') {
        console.log('User is logged into Facebook and your app');
        console.log('Access Token:', response.authResponse?.accessToken);
        console.log('User ID:', response.authResponse?.userID);
        // Redirect to logged-in experience
      } else if (response.status === 'not_authorized') {
        console.log('User is logged into Facebook but not your app');
        // Show login button
      } else {
        console.log('User is not logged into Facebook');
        // Show login button
      }
    });
  };

  const handleLogin = () => {
    loginWithFacebookSDK((response) => {
      if (response.status === 'connected') {
        console.log('Login successful!');
        setLoginStatus(response);
        // Handle successful login
      } else {
        console.log('Login failed or cancelled');
      }
    }, {
      scope: 'email,public_profile' // Request permissions
    });
  };

  const handleLogout = () => {
    logoutFromFacebookSDK((response) => {
      console.log('Logged out:', response.status);
      setLoginStatus({ status: 'unknown' });
    });
  };

  if (!sdkLoaded) {
    return <div>Loading Facebook SDK...</div>;
  }

  return (
    <div>
      <h2>Facebook SDK Login Status</h2>
      {loginStatus && (
        <div>
          <p>Status: {loginStatus.status}</p>
          {loginStatus.authResponse && (
            <div>
              <p>User ID: {loginStatus.authResponse.userID}</p>
              <p>Token expires in: {loginStatus.authResponse.expiresIn} seconds</p>
            </div>
          )}
        </div>
      )}
      
      <div>
        <button onClick={checkLoginStatus}>Check Status</button>
        {loginStatus?.status !== 'connected' && (
          <button onClick={handleLogin}>Login with Facebook</button>
        )}
        {loginStatus?.status === 'connected' && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
}

/**
 * IMPORTANT REMINDER:
 * 
 * For Supabase OAuth (which is what your app uses), you DON'T need this.
 * Just use:
 * 
 *   await supabase.auth.signInWithOAuth({ provider: 'facebook' })
 * 
 * This example is only for if you want Facebook SDK native features.
 */

