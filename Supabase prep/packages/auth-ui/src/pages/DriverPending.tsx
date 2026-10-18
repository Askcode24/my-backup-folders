import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPortalUrl, logoutUser, supabase, type AppRole } from '@swiftroute/core';

export default function DriverPending({ appRole }: { appRole: AppRole }) {
	const [status, setStatus] = useState('pending');
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let active = true;

		async function loadStatus() {
			try {
				const { data: userData, error: userError } = await supabase.auth.getUser();
				if (userError) throw userError;

				if (!userData.user) {
					throw new Error('Your session could not be verified. Please log in again.');
				}

				const { data, error } = await supabase
					.from('driver_applications')
					.select('approval_status')
					.eq('user_id', userData.user.id)
					.maybeSingle();

				if (error) throw error;
				if (!data) throw new Error('We could not find a driver application for this account.');

				if (active) setStatus(data.approval_status);
			} catch (error) {
				if (active) {
					setErrorMessage(
						error instanceof Error ? error.message : 'Could not load your application status.'
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		}

		void loadStatus();

		return () => {
			active = false;
		};
	}, []);

	async function handleLogout() {
		try {
			await logoutUser();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not log out.'
			);
		}
	}

	return (
		<main className='application-page'>
			<header className='application-header'>
				<Link to='/' className='dashboard-brand'>
					<span className='dashboard-brand-mark'><Truck size={18} /></span>
					<span>swift<span>route</span></span>
				</Link>
				<button onClick={handleLogout} className='application-signout'>Sign out</button>
			</header>
			<section className='pending-card'>
				<div className='pending-card-mark'><ShieldCheck size={25} /></div>
				<p className='dashboard-kicker'>DRIVER APPLICATION</p>
				<h1>
					{loading
						? 'Checking your application.'
						: errorMessage
							? 'We couldn’t load your application status.'
						: status === 'approved'
							? 'You’re approved. Welcome aboard.'
							: status === 'rejected'
								? 'We couldn’t approve your application.'
								: 'Thanks for applying to drive.'}
				</h1>
				<p className='pending-copy'>
					{errorMessage
						? 'Please try again shortly or contact SwiftRoute support if the problem continues.'
						: status === 'approved'
						? 'Your application is approved. You can now open your driver workspace and view delivery requests.'
						: status === 'rejected'
							? 'Your application was not approved. Please contact our team if you have questions about the review.'
							: 'We’re reviewing your details. We’ll let you know when there’s an update, and you can return here to check your status.'}
				</p>
				{errorMessage && <p className='dashboard-alert dashboard-alert-error' role='alert'>{errorMessage}</p>}

				{!errorMessage && status !== 'rejected' && (
					<div className='application-timeline'>
						<div className={`timeline-step is-complete`}>
							<span><CheckCircle2 size={17} /></span>
							<div><strong>Application received</strong><small>We have your driver details</small></div>
						</div>
						<div className={`timeline-step ${status === 'pending' || loading ? 'is-current' : 'is-complete'}`}>
							<span>{status === 'pending' || loading ? <Clock3 size={17} /> : <CheckCircle2 size={17} />}</span>
							<div><strong>Administrator review</strong><small>{status === 'approved' ? 'Review complete' : 'Your application is being reviewed'}</small></div>
						</div>
						<div className={`timeline-step ${status === 'approved' ? 'is-complete' : ''}`}>
							<span>{status === 'approved' ? <CheckCircle2 size={17} /> : <span className='timeline-number'>3</span>}</span>
							<div><strong>Ready to drive</strong><small>Access available delivery requests</small></div>
						</div>
					</div>
				)}

				{!errorMessage && status === 'approved' && (
					appRole === 'driver' ? (
						<Link to='/driver' className='action-primary pending-action'>Open driver workspace <ArrowRight size={16} /></Link>
					) : getPortalUrl('driver', '/login') ? (
						<a href={getPortalUrl('driver', '/login')} className='action-primary pending-action'>Open driver workspace <ArrowRight size={16} /></a>
					) : (
						<p className='pending-note' role='status'>Your application is approved. Sign in through the Driver app to manage deliveries.</p>
					)
				)}
				{!errorMessage && status === 'pending' && (
					<div className='pending-note'><ShieldCheck size={16} /><span><strong>Nothing else needed right now</strong><small>We’ll reach out if we need more information.</small></span></div>
				)}
				<button onClick={handleLogout} className='pending-secondary-action'>Sign out</button>
			</section>
			<footer className='application-footer'>Questions about your application? Contact SwiftRoute support.</footer>
		</main>
	);
}
