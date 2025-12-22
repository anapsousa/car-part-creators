/**
 * Facebook Login Button Component
 * 
 * ⚠️ IMPORTANT: This is for Facebook SDK native login, NOT Supabase OAuth.
 * 
 * For Supabase OAuth (which your app uses), you DON'T need this component.
 * Just use the existing button in Auth.tsx that calls:
 *   supabase.auth.signInWithOAuth({ provider: 'facebook' })
 * 
 * This component is only if you want to use Facebook's native login button
 * for Facebook SDK-specific features.
 */

import { useEffect, useRef, useState } from 'react';
import { initFacebookSDK, getFacebookLoginStatus, type FacebookLoginStatusResponse } from '@/utils/facebook-sdk';

interface FacebookLoginButtonProps {
  scope?: string;
  onLogin?: (response: FacebookLoginStatusResponse) => void;
  onStatusChange?: (response: FacebookLoginStatusResponse) => void;
  size?: 'small' | 'medium' | 'large';
  buttonText?: string;
  className?: string;
}

/**
 * React component wrapper for Facebook Login Button
 * 
 * This renders Facebook's XFBML login button which requires:
 * 1. Facebook SDK to be loaded (with xfbml: true)
 * 2. XFBML parsing after SDK loads
 */
export function FacebookLoginButton({
  scope = 'public_profile,email',
  onLogin,
  onStatusChange,
  size = 'large',
  buttonText,
  className = '',
}: FacebookLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [buttonId] = useState(`fb-login-button-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Initialize Facebook SDK
    initFacebookSDK()
      .then(() => {
        setSdkLoaded(true);
        
        // Check initial login status
        if (onStatusChange) {
          getFacebookLoginStatus((response) => {
            onStatusChange(response);
          });
        }
      })
      .catch((error) => {
        console.error('Failed to load Facebook SDK:', error);
      });
  }, [onStatusChange]);

  useEffect(() => {
    if (!sdkLoaded || !containerRef.current || !window.FB) {
      return;
    }

    // Render the Facebook Login Button using XFBML
    const xfbml = `
      <div 
        class="fb-login-button" 
        data-scope="${scope}"
        data-size="${size}"
        data-button-type="continue_with"
        data-layout="default"
        data-auto-logout-link="false"
        data-use-continue-as="false"
        onlogin="window.__fbLoginCallback__ && window.__fbLoginCallback__()"
      ></div>
    `;

    containerRef.current.innerHTML = xfbml;

    // Set up global callback for onlogin
    (window as any).__fbLoginCallback__ = () => {
      // Check login status after login
      getFacebookLoginStatus((response) => {
        if (onLogin) {
          onLogin(response);
        }
        if (onStatusChange) {
          onStatusChange(response);
        }
      });
    };

    // Parse XFBML to render the button
    if (window.FB && window.FB.XFBML && window.FB.XFBML.parse) {
      window.FB.XFBML.parse(containerRef.current);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      delete (window as any).__fbLoginCallback__;
    };
  }, [sdkLoaded, scope, size, onLogin, onStatusChange]);

  if (!sdkLoaded) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">Loading Facebook login...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      id={buttonId}
    />
  );
}

/**
 * Alternative: Custom styled button that uses Facebook SDK login
 * This gives you full control over styling
 */
interface FacebookLoginButtonCustomProps {
  scope?: string;
  onLogin?: (response: FacebookLoginStatusResponse) => void;
  className?: string;
  children?: React.ReactNode;
}

export function FacebookLoginButtonCustom({
  scope = 'public_profile,email',
  onLogin,
  className = '',
  children,
}: FacebookLoginButtonCustomProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    initFacebookSDK()
      .then(() => setSdkLoaded(true))
      .catch((error) => {
        console.error('Failed to load Facebook SDK:', error);
      });
  }, []);

  const handleClick = () => {
    if (!sdkLoaded || !window.FB) {
      console.warn('Facebook SDK not loaded');
      return;
    }

    if (window.FB.login) {
      window.FB.login((response) => {
        if (onLogin) {
          onLogin(response);
        }
      }, { scope });
    }
  };

  // If children are provided, render them; otherwise render default button
  if (children) {
    return (
      <div onClick={handleClick} className={className} style={{ cursor: sdkLoaded ? 'pointer' : 'not-allowed', opacity: sdkLoaded ? 1 : 0.5 }}>
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={!sdkLoaded}
    >
      Login with Facebook
    </button>
  );
}

