/**
 * Facebook SDK Integration
 * 
 * NOTE: This is OPTIONAL for Supabase OAuth. Supabase handles OAuth flows
 * without requiring the Facebook SDK. Only add this if:
 * 1. Facebook requires it for app approval
 * 2. You want to use Facebook-specific features (Graph API, social plugins, etc.)
 * 
 * To use: Set VITE_FACEBOOK_APP_ID in your .env file
 */

export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

export interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

type FacebookStatusCallback = (response: FacebookLoginStatusResponse) => void;

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      AppEvents: {
        logPageView: () => void;
      };
      getLoginStatus: (callback: FacebookStatusCallback, fetchUserInfo?: boolean) => void;
      login: (callback: FacebookStatusCallback, options?: { scope?: string }) => void;
      logout: (callback: (response: { status: string }) => void) => void;
      XFBML?: {
        parse: (element?: HTMLElement | null) => void;
      };
      [key: string]: any;
    };
  }
}

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const FACEBOOK_API_VERSION = import.meta.env.VITE_FACEBOOK_API_VERSION || 'v18.0';

/**
 * Initialize Facebook SDK
 * This loads the Facebook JavaScript SDK asynchronously
 */
export function initFacebookSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If no App ID is configured, skip initialization
    if (!FACEBOOK_APP_ID) {
      console.warn('Facebook SDK: VITE_FACEBOOK_APP_ID not set. Skipping Facebook SDK initialization.');
      resolve();
      return;
    }

    // If SDK is already loaded, resolve immediately
    if (window.FB) {
      resolve();
      return;
    }

    // Set up the async initialization callback
    window.fbAsyncInit = function() {
      if (!window.FB) {
        reject(new Error('Facebook SDK failed to load'));
        return;
      }

      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_API_VERSION,
      });

      // Log page view (optional, for analytics)
      if (window.FB.AppEvents) {
        window.FB.AppEvents.logPageView();
      }

      resolve();
    };

    // Load the Facebook SDK script
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      reject(new Error('Failed to load Facebook SDK script'));
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
}

/**
 * Check if Facebook SDK is loaded
 */
export function isFacebookSDKLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.FB;
}

/**
 * Get Facebook SDK instance (if loaded)
 */
export function getFacebookSDK(): typeof window.FB | null {
  return window.FB || null;
}

/**
 * Check Facebook login status
 * 
 * NOTE: This is for Facebook SDK native login, NOT Supabase OAuth.
 * Supabase OAuth handles authentication separately.
 * 
 * Use this only if you need Facebook SDK-specific features.
 * 
 * @param callback - Function to call with the login status
 * @param fetchUserInfo - Whether to fetch additional user info (default: false)
 */
export function getFacebookLoginStatus(
  callback: FacebookStatusCallback,
  fetchUserInfo: boolean = false
): void {
  if (!isFacebookSDKLoaded()) {
    console.warn('Facebook SDK not loaded. Call initFacebookSDK() first.');
    callback({
      status: 'unknown',
    });
    return;
  }

  if (window.FB && window.FB.getLoginStatus) {
    window.FB.getLoginStatus(callback, fetchUserInfo);
  } else {
    callback({
      status: 'unknown',
    });
  }
}

/**
 * Login with Facebook SDK (native Facebook login)
 * 
 * NOTE: This is for Facebook SDK native login, NOT Supabase OAuth.
 * For Supabase OAuth, use supabase.auth.signInWithOAuth({ provider: 'facebook' })
 * 
 * @param callback - Function to call with the login result
 * @param options - Login options (e.g., scope)
 */
export function loginWithFacebookSDK(
  callback: FacebookStatusCallback,
  options?: { scope?: string }
): void {
  if (!isFacebookSDKLoaded()) {
    console.warn('Facebook SDK not loaded. Call initFacebookSDK() first.');
    callback({
      status: 'unknown',
    });
    return;
  }

  if (window.FB && window.FB.login) {
    window.FB.login(callback, options);
  } else {
    callback({
      status: 'unknown',
    });
  }
}

/**
 * Logout from Facebook SDK
 * 
 * NOTE: This only logs out from Facebook SDK, not from Supabase.
 * To logout from Supabase, use supabase.auth.signOut()
 * 
 * @param callback - Optional function to call after logout
 */
export function logoutFromFacebookSDK(
  callback?: (response: { status: string }) => void
): void {
  if (!isFacebookSDKLoaded()) {
    console.warn('Facebook SDK not loaded.');
    if (callback) {
      callback({ status: 'unknown' });
    }
    return;
  }

  if (window.FB && window.FB.logout) {
    window.FB.logout(callback || (() => {}));
  } else if (callback) {
    callback({ status: 'unknown' });
  }
}

