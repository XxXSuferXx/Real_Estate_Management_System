import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AdminPanel } from '../pages/AdminPanel';
import { Dashboard } from '../pages/Dashboard';
import { Unauthorized } from '../pages/Unauthorized';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/admin', element: <AdminPanel />},
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/unauthorized', element: <Unauthorized />},
  { path: '*', element: <HomePage /> }, //FallBack Route
]);