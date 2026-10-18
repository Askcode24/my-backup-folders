import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@swiftroute/auth-ui/Login';
import ProtectedRoute from '@swiftroute/design-system/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
	return (
		<Routes>
			<Route path='/login' element={<Login appRole='admin' />} />
			<Route element={<ProtectedRoute requiredRole='admin' />}>
				<Route path='/admin' element={<AdminDashboard />} />
			</Route>
			<Route path='*' element={<Navigate to='/login' replace />} />
		</Routes>
	);
}
