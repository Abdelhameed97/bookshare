import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function OwnerRoute({ children }) {
    const { user } = useAuth();

    if (!user || user.role !== 'owner') {
        return <Navigate to="/login" replace />;
    }

    return children;
} 