import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, LogIn, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create default staff user if it's the first time
        // Note: In a real app, you'd have an approval process
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'staff', // Default role
        });
      }
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Building2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-10">Sign in to access the Avelty Group admin dashboard.</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
          )}
          Continue with Google
        </button>

        <div className="mt-8 pt-8 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
