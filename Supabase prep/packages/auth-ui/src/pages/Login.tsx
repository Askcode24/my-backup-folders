import { useState, type FormEvent } from 'react';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
	getPortalUrl,
	getUserWorkspace,
	loginUser,
	logoutUser,
	type AppRole,
} from '@swiftroute/core';

export default function Login({ appRole }: { appRole: AppRole }) {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setErrorMessage('');

		try {
			const result = await loginUser(email, password);
			const workspace = await getUserWorkspace(result.user.id);
			const destinationRole: AppRole =
				workspace === 'driver-pending' ? 'driver' : workspace;
			const destination =
				workspace === 'driver-pending' ? '/driver-pending' : `/${workspace}`;

			if (destinationRole === appRole) {
				navigate(destination, { replace: true });
				return;
			}

			const target = getPortalUrl(destinationRole, '/login');
			if (target) {
				window.location.assign(target);
				return;
			}

			await logoutUser();
			setErrorMessage(
				`This account belongs to the ${destinationRole} workspace. Configure its app URL or sign in from that app.`
			);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Unable to log in. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className='auth-page'>
			<section className='auth-story'>
				<Link to='/' className='brand-link'>
					<span className='brand-mark'><Truck size={18} /></span>
					<span>swift<span className='brand-accent'>route</span></span>
				</Link>
				<div className='auth-story-copy'>
					<p className='eyebrow'><span className='eyebrow-dot' /> YOUR DELIVERY, IN GOOD HANDS</p>
					<h2>All your deliveries.<br /><span>One clear view.</span></h2>
					<p>Sign in to book your next delivery or pick up right where you left off.</p>
					<div className='auth-assurance'><ShieldCheck size={18} /> Thoughtful service, every step of the way.</div>
				</div>
				<p className='auth-story-foot'>SwiftRoute Logistics · Right there with you.</p>
			</section>
			<section className='auth-form-wrap'>
				<div className='auth-form'>
					<h1>Welcome back</h1>
					<p className='auth-subtitle'>Log in to manage your deliveries.</p>

					<form onSubmit={handleSubmit} className='auth-form-fields grid gap-4'>
					<div>
						<label htmlFor='email'>Email address</label>
						<input
							id='email'
							required
							type='email'
							autoComplete='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='auth-input'
							placeholder='you@example.com'
						/>
					</div>

					<div>
						<label htmlFor='password'>Password</label>
						<input
							id='password'
							required
							type='password'
							autoComplete='current-password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='auth-input'
							placeholder='Your password'
						/>
					</div>

					{errorMessage && (
						<p
							role='alert'
							className='rounded-lg bg-red-50 p-3 text-sm text-red-700'>
							{errorMessage}
						</p>
					)}

					<button
						disabled={loading}
						className='auth-submit'>
						{loading ? 'Logging in...' : <>Log in <ArrowRight size={16} /></>}
					</button>
				</form>

				{appRole !== 'admin' && (
					<p className='auth-form-footer'>
						Don't have an account?{' '}
						<Link to={appRole === 'driver' ? '/register?type=driver' : '/register'}>
							{appRole === 'driver' ? 'Apply to drive' : 'Create an account'}
						</Link>
					</p>
				)}
				</div>
			</section>
		</main>
	);
}
