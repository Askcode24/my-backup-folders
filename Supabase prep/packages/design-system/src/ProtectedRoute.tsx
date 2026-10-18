import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import {
	getPortalUrl,
	getUserWorkspace,
	logoutUser,
	supabase,
	type AppRole,
	type UserWorkspace,
} from '@swiftroute/core';

type RequiredWorkspace = AppRole | 'driver-pending';
type AccessState = 'checking' | 'allowed' | 'signed-out' | 'denied' | 'error';

export default function ProtectedRoute({
	requiredRole,
}: {
	requiredRole: RequiredWorkspace;
}) {
	const [access, setAccess] = useState<AccessState>('checking');
	const [actualWorkspace, setActualWorkspace] = useState<UserWorkspace>();
	const [errorMessage, setErrorMessage] = useState('');

	const checkAccess = useCallback(async (userId: string) => {
		try {
			const workspace = await getUserWorkspace(userId);
			const allowed =
				requiredRole === 'driver-pending'
					? workspace === 'driver-pending' || workspace === 'driver'
					: workspace === requiredRole;

			if (!allowed) {
				setActualWorkspace(workspace);
				await logoutUser();
				setAccess('denied');
				return;
			}

			setAccess('allowed');
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Unable to verify your workspace access.'
			);
			setAccess('error');
		}
	}, [requiredRole]);

	useEffect(() => {
		let active = true;

		async function checkSession() {
			try {
				const { data, error } = await supabase.auth.getSession();
				if (error) throw error;
				if (!active) return;
				if (!data.session) {
					setAccess('signed-out');
					return;
				}
				await checkAccess(data.session.user.id);
			} catch (error) {
				if (!active) return;
				setErrorMessage(
					error instanceof Error ? error.message : 'Unable to verify your session.'
				);
				setAccess('error');
			}
		}

		void checkSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				setAccess('signed-out');
				return;
			}
			window.setTimeout(() => {
				if (active) void checkAccess(session.user.id);
			}, 0);
		});

		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, [checkAccess]);

	if (access === 'checking') {
		return (
			<div className='flex min-h-screen items-center justify-center bg-slate-50'>
				<p className='text-sm text-slate-600'>Checking your session...</p>
			</div>
		);
	}

	if (access === 'signed-out') return <Navigate to='/login' replace />;
	if (access === 'allowed') return <Outlet />;

	const targetRole: AppRole | undefined =
		actualWorkspace === 'driver-pending' ? 'driver' : actualWorkspace;
	const targetUrl = targetRole
		? getPortalUrl(targetRole, '/login')
		: undefined;

	return (
		<main className='application-page'>
			<section className='pending-card' role='alert'>
				<p className='dashboard-kicker'>SWIFTROUTE WORKSPACE</p>
				<h1>{access === 'error' ? 'We could not verify access.' : 'This is a different workspace.'}</h1>
				<p className='pending-copy'>
					{access === 'error'
						? errorMessage
						: `Your account does not have access to the ${requiredRole} workspace.`}
				</p>
				{targetUrl && (
					<a className='action-primary pending-action' href={targetUrl}>
						Open your workspace sign-in
					</a>
				)}
				<Link to='/login' className='pending-secondary-action'>
					Return to sign in
				</Link>
			</section>
		</main>
	);
}
