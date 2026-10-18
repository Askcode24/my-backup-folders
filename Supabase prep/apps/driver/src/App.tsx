import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@swiftroute/auth-ui/Login';
import Register from '@swiftroute/auth-ui/Register';
import DriverPending from '@swiftroute/auth-ui/DriverPending';
import ProtectedRoute from '@swiftroute/design-system/ProtectedRoute';
import DriverDashboard from './pages/DriverDashboard';

export default function App() {
	return (
		<Routes>
			<Route path='/login' element={<Login appRole='driver' />} />
			<Route path='/register' element={<Register appRole='driver' />} />
			<Route element={<ProtectedRoute requiredRole='driver' />}>
				<Route path='/driver' element={<DriverDashboard />} />
			</Route>
			<Route element={<ProtectedRoute requiredRole='driver-pending' />}>
				<Route path='/driver-pending' element={<DriverPending appRole='driver' />} />
			</Route>
			<Route path='*' element={<Navigate to='/login' replace />} />
		</Routes>
	);
}
