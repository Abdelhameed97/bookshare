import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
    const { user } = useAuth();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return children;
} 