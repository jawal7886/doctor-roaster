/**
 * File: pages/Index.tsx
 * Purpose: Redirect to Dashboard — kept for compatibility.
 */

import { Navigate } from 'react-router-dom';

const Index = () => <Navigate to="/" replace />;

export default Index;
