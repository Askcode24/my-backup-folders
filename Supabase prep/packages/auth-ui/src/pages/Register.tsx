import { useState, type FormEvent } from 'react';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
	logoutUser,
	registerUser,
	type AppRole,
	type AccountType,
	type VehicleType,
} from '@swiftroute/core';

export default function Register({ appRole }: { appRole: AppRole }) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [accountType, setAccountType] = useState<AccountType>(() =>
		searchParams.get('type') === 'driver' || appRole === 'driver'
			? 'driver'
			: 'customer'
	);
	const [vehicle, setVehicle] = useState<VehicleType>('motorcycle');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setMessage('');
		setErrorMessage('');

		try {
			const result = await registerUser({
				fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
				email,
				password,
				accountType,
				...(accountType === 'driver' ? { vehicle } : {}),
			});

			const destinationRole: AppRole = accountType;
			const destination = accountType === 'driver' ? '/driver-pending' : '/customer';

			if (
				result.session &&
				(destinationRole === appRole || (appRole === 'customer' && destinationRole === 'driver'))
			) {
				navigate(destination, { replace: true });
			} else if (result.session) {
				await logoutUser();
				setMessage(
					`Your ${accountType} account is ready. Sign in from the ${accountType} workspace to continue.`
				);
			} else {
				setMessage(
					'Registration received. Check your email to confirm your account before logging in.'
				);
			}
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Registration failed. Please try again.'
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
					<p className='eyebrow'><span className='eyebrow-dot' /> YOUR NEXT DELIVERY STARTS HERE</p>
					<h2>Make room for<br /><span>what matters.</span></h2>
					<p>Create an account to send a package, track every update, or join our driver community.</p>
					<div className='auth-assurance'><ShieldCheck size={18} /> Your information stays protected.</div>
				</div>
				<p className='auth-story-foot'>SwiftRoute Logistics · Right there with you.</p>
			</section>
			<section className='auth-form-wrap'>
				<div className='auth-form'>
					<h1>Create your account</h1>
					<p className='auth-subtitle'>Register to send packages or apply as a delivery driver.</p>

				<form onSubmit={handleSubmit} className='auth-form-fields grid gap-4'>
					<div className='auth-name-grid'>
						<div>
							<label htmlFor='first-name'>First name</label>
							<input
								id='first-name'
								required
								autoComplete='given-name'
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className='auth-input'
								placeholder='First name'
							/>
						</div>
						<div>
							<label htmlFor='last-name'>Last name</label>
							<input
								id='last-name'
								required
								autoComplete='family-name'
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className='auth-input'
								placeholder='Last name'
							/>
						</div>
					</div>

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
							minLength={6}
							type='password'
							autoComplete='new-password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='auth-input'
							placeholder='At least 6 characters'
						/>
					</div>

					<div>
						<span className='field-label'>I’m joining as</span>
						<div className='auth-account-switch' role='group' aria-label='Account type'>
							<button type='button' aria-pressed={accountType === 'customer'} onClick={() => setAccountType('customer')}>A customer</button>
							<button type='button' aria-pressed={accountType === 'driver'} onClick={() => setAccountType('driver')}>A driver</button>
						</div>
					</div>

					{accountType === 'driver' && (
						<div>
							<label htmlFor='vehicle'>Vehicle type</label>
							<select
								id='vehicle'
								value={vehicle}
								onChange={(e) => setVehicle(e.target.value as VehicleType)}
								className='auth-input'>
								<option value='motorcycle'>Motorcycle</option>
								<option value='car_van'>Car / Van</option>
							</select>
							<p className='driver-approval-note'>
								Driver applications are reviewed by an administrator before access is granted.
							</p>
						</div>
					)}

					{message && (
						<p
							role='status'
							className='rounded-lg bg-green-50 p-3 text-sm text-green-800'>
							{message}
						</p>
					)}

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
						{loading ? 'Creating account...' : <>Create account <ArrowRight size={16} /></>}
					</button>
				</form>

				<p className='auth-form-footer'>
					Already registered?{' '}
					<Link to='/login'>Log in</Link>
				</p>
				</div>
			</section>
		</main>
	);
}
