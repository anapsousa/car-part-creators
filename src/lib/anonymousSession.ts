// Define the localStorage key for the anonymous session ID
const SESSION_KEY = 'anonymous_session_id';

// Get or create a new anonymous session ID
export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    // Generate UUID v4 for cryptographically secure session ID
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Clear the anonymous session ID from localStorage
export const clearAnonymousSession = (): void => {
  // Called after user login to clean up anonymous data
  localStorage.removeItem(SESSION_KEY);
};

// Check if an anonymous session exists
export const isAnonymousSession = (): boolean => {
  return !!localStorage.getItem(SESSION_KEY);
};