import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = React.useState<User | null>(null);
  const [userLoading, setUserLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      }
      setUserLoading(false);
    };

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have administrative privileges to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
