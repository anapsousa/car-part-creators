/**
 * Example: How to use Facebook Login Button
 * 
 * ⚠️ IMPORTANT: This is for Facebook SDK native login, NOT Supabase OAuth.
 * 
 * Your app already has Facebook login working via Supabase OAuth.
 * You DON'T need to use this component unless you want Facebook SDK-specific features.
 */

import { useState } from 'react';
import { FacebookLoginButton, FacebookLoginButtonCustom } from './FacebookLoginButton';
import { getFacebookLoginStatus, type FacebookLoginStatusResponse } from '@/utils/facebook-sdk';
import { Button } from '@/components/ui/button';

export function FacebookLoginButtonExample() {
  const [loginStatus, setLoginStatus] = useState<FacebookLoginStatusResponse | null>(null);

  // Callback function (equivalent to checkLoginState in Facebook's docs)
  const checkLoginState = () => {
    getFacebookLoginStatus((response) => {
      setLoginStatus(response);
      statusChangeCallback(response);
    });
  };

  // Process the response (equivalent to statusChangeCallback in Facebook's docs)
  const statusChangeCallback = (response: FacebookLoginStatusResponse) => {
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
  };

  const handleLogin = (response: FacebookLoginStatusResponse) => {
    checkLoginState(); // Check status after login
  };

  const handleStatusChange = (response: FacebookLoginStatusResponse) => {
    setLoginStatus(response);
    statusChangeCallback(response);
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Facebook Login Button Examples</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Option 1: Facebook's Native Button (XFBML)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This renders Facebook's official login button using XFBML
          </p>
          <FacebookLoginButton
            scope="public_profile,email"
            onLogin={handleLogin}
            onStatusChange={handleStatusChange}
            size="large"
            className="mb-4"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Option 2: Custom Styled Button</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This gives you full control over button styling
          </p>
          <FacebookLoginButtonCustom
            scope="public_profile,email"
            onLogin={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue with Facebook
          </FacebookLoginButtonCustom>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Option 3: Using Shadcn Button (Recommended for your app)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This matches your existing button style in Auth.tsx
          </p>
          <FacebookLoginButtonCustom
            scope="public_profile,email"
            onLogin={handleLogin}
          >
            <Button variant="outline" className="w-full">
              Continue with Facebook
            </Button>
          </FacebookLoginButtonCustom>
        </div>
      </div>

      {loginStatus && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Login Status:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(loginStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/**
 * ⚠️ REMINDER:
 * 
 * For Supabase OAuth (which your app uses), you DON'T need any of this.
 * Your existing implementation in Auth.tsx is correct:
 * 
 *   await supabase.auth.signInWithOAuth({ provider: 'facebook' })
 * 
 * This example is only for if you want Facebook SDK native features.
 */

