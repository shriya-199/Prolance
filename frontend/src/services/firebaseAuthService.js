import { auth } from '../config/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';

/**
 * Firebase Authentication Service
 * Provides methods for user authentication using Firebase
 */
class FirebaseAuthService {
    constructor() {
        this.auth = auth;
        this.googleProvider = new GoogleAuthProvider();
        this.githubProvider = new GithubAuthProvider();
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - User display name
     * @returns {Promise} User credential
     */
    async signUpWithEmail(email, password, displayName = null) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

            // Update profile with display name if provided
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }

            return {
                success: true,
                user: userCredential.user,
                message: 'Account created successfully'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} User credential
     */
    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return {
                success: true,
                user: userCredential.user,
                message: 'Logged in successfully'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Sign in with Google
     * @returns {Promise} User credential
     */
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(this.auth, this.googleProvider);
            return {
                success: true,
                user: result.user,
                message: 'Logged in with Google successfully'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Sign in with GitHub
     * @returns {Promise} User credential
     */
    async signInWithGithub() {
        try {
            const result = await signInWithPopup(this.auth, this.githubProvider);
            return {
                success: true,
                user: result.user,
                message: 'Logged in with GitHub successfully'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Sign out the current user
     * @returns {Promise}
     */
    async signOut() {
        try {
            await signOut(this.auth);
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise}
     */
    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return {
                success: true,
                message: 'Password reset email sent'
            };
        } catch (error) {
            return this.handleAuthError(error);
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.auth.currentUser;
    }

    /**
     * Get ID token for the current user
     * @returns {Promise<string>} ID token
     */
    async getIdToken() {
        const user = this.getCurrentUser();
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }

    /**
     * Listen to authentication state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    /**
     * Handle Firebase authentication errors
     * @param {Error} error - Firebase error object
     * @returns {Object} Formatted error response
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid credentials',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Login cancelled',
        };

        const message = errorMessages[error.code] || error.message || 'Authentication failed';

        return {
            success: false,
            error: {
                code: error.code,
                message: message
            }
        };
    }
}

// Export singleton instance
const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
