import { ArrowRight, ArrowUpRight, Check, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@swiftroute/design-system/ProtectedRoute';
import Login from '@swiftroute/auth-ui/Login';
import Register from '@swiftroute/auth-ui/Register';
import DriverPending from '@swiftroute/auth-ui/DriverPending';
import CustomerDashboard from './pages/CustomerDashboard';

function Home() {
	return (
		<main className='home-page min-h-screen'>
			<header className='home-header'>
				<Link to='/' className='brand-link' aria-label='SwiftRoute home'>
					<span className='brand-mark'><Truck size={18} strokeWidth={2.4} /></span>
					<span>swift<span className='brand-accent'>route</span></span>
				</Link>
				<nav className='home-nav' aria-label='Main navigation'>
					<a href='#how-it-works'>How it works</a>
					<a href='#why-swiftroute'>Why SwiftRoute</a>
					<Link to='/login'>Log in</Link>
					<Link to='/register' className='button button-dark button-small'>
						Get started <ArrowUpRight size={16} />
					</Link>
				</nav>
			</header>

			<section className='home-hero'>
				<div className='hero-copy'>
					<p className='eyebrow'><span className='eyebrow-dot' /> DELIVERY, WITHOUT THE DETOUR</p>
					<h1>Good things are<br />already <span>on the way.</span></h1>
					<p className='hero-description'>
						Send what matters with a local delivery partner you can count on.
						Book in minutes, follow every mile, and get on with your day.
					</p>
					<div className='hero-actions'>
						<Link to='/register' className='button button-lime'>
							Send a package <ArrowUpRight size={18} />
						</Link>
						<Link to='/login' className='button button-outline'>
							Sign in
						</Link>
					</div>
					<div className='trust-row'>
						<div className='avatar-stack' aria-hidden='true'>
							<span>J</span><span>M</span><span>A</span>
						</div>
						<p><strong>On your side, all the way.</strong><br />A better way to get it there.</p>
					</div>
				</div>

				<div className='hero-art' aria-label='A delivery tracking preview'>
					<div className='art-orbit orbit-one' />
					<div className='art-orbit orbit-two' />
					<div className='route-line route-line-one' />
					<div className='route-line route-line-two' />
					<div className='map-pin pin-start'><MapPin size={19} fill='currentColor' /></div>
					<div className='map-pin pin-end'><MapPin size={19} fill='currentColor' /></div>
					<div className='floating-tag tag-one'><span className='tag-icon'><PackageCheck size={16} /></span><span><strong>Package collected</strong><small>Just now · Route started</small></span></div>
					<div className='floating-tag tag-two'><span className='online-dot' /><span><strong>Driver nearby</strong><small>ETA · 12 minutes</small></span><ArrowUpRight size={16} /></div>
					<div className='hero-package'><div className='package-top' /><div className='package-tape' /><PackageCheck size={42} strokeWidth={1.35} /></div>
					<div className='art-caption'><span className='caption-line' />Every delivery has a story. We make it a good one.</div>
				</div>
			</section>

			<section className='home-proof-row' aria-label='SwiftRoute service features'>
				<span><Check size={15} /> Simple delivery requests</span>
				<span><Check size={15} /> Status at a glance</span>
				<span><Check size={15} /> Driver applications reviewed</span>
			</section>

			<section className='home-how' id='how-it-works'>
				<div className='home-section-heading'>
					<p className='eyebrow'><span className='eyebrow-dot' /> HOW IT WORKS</p>
					<h2>From your door to theirs,<br /><span>without the guesswork.</span></h2>
					<p>Everything you need to get a package moving, all in one place.</p>
				</div>
				<div className='home-steps'>
					<article className='home-step-card'>
						<span className='home-step-number'>01</span>
						<span className='home-step-icon'><PackageCheck size={21} /></span>
						<h3>Tell us what’s going</h3>
						<p>Add the pickup, destination, recipient, and a few details about your package.</p>
					</article>
					<article className='home-step-card'>
						<span className='home-step-number'>02</span>
						<span className='home-step-icon'><Truck size={21} /></span>
						<h3>A driver takes it from here</h3>
						<p>See your delivery’s current status as it moves from acceptance through drop-off.</p>
					</article>
					<article className='home-step-card'>
						<span className='home-step-number'>03</span>
						<span className='home-step-icon'><MapPin size={21} /></span>
						<h3>Know when it arrives</h3>
						<p>See delivery progress in your account, right through to drop-off.</p>
					</article>
				</div>
			</section>

			<section className='home-why' id='why-swiftroute'>
				<div className='home-why-copy'>
					<p className='eyebrow'><span className='eyebrow-dot' /> A CLEARER WAY TO SEND</p>
					<h2>More care for the<br /><span>things that matter.</span></h2>
					<p>From the moment you request a pickup to the final handoff, SwiftRoute keeps the important details easy to find.</p>
					<ul>
						<li><Check size={16} /> Keep pickup and drop-off details together</li>
						<li><Check size={16} /> See your delivery status in your account</li>
						<li><Check size={16} /> Driver applications reviewed before access</li>
					</ul>
					<Link to='/register' className='button button-dark'>Plan a delivery <ArrowRight size={16} /></Link>
				</div>
				<div className='home-tracking-card' aria-label='Illustration of delivery status updates'>
					<div className='tracking-card-heading'>
						<span><PackageCheck size={18} /></span>
						<div><strong>A little more peace of mind</strong><small>Your delivery, step by step</small></div>
						<span className='tracking-live'>STATUS</span>
					</div>
					<div className='tracking-route'>
						<div className='tracking-route-step is-done'><span><Check size={13} /></span><div><strong>Request received</strong><small>Your delivery details are in</small></div><small>Done</small></div>
						<div className='tracking-route-step is-current'><span><Truck size={13} /></span><div><strong>On the way</strong><small>Follow the latest status</small></div><small><Clock3 size={13} /> In progress</small></div>
						<div className='tracking-route-step'><span><MapPin size={13} /></span><div><strong>Delivered</strong><small>Ready for the final handoff</small></div></div>
					</div>
					<p className='tracking-card-note'>A clearer view of every important step.</p>
				</div>
			</section>

			<section className='home-driver-cta' id='drivers'>
				<div>
					<p className='eyebrow'><span className='eyebrow-dot' /> FOR LOCAL DRIVERS</p>
					<h2>Good routes start<br />with good people.</h2>
					<p>Join the SwiftRoute driver community. Apply in a few steps and check your application status from your account.</p>
				</div>
				<Link to='/register?type=driver' className='button button-lime'>Apply to drive <ArrowUpRight size={17} /></Link>
			</section>

			<footer className='home-footer'>
				<Link to='/' className='brand-link'><span className='brand-mark'><Truck size={16} /></span><span>swift<span className='brand-accent'>route</span></span></Link>
				<nav aria-label='Footer navigation'>
					<a href='#how-it-works'>How it works</a>
					<a href='#why-swiftroute'>Why SwiftRoute</a>
					<Link to='/login'>Log in</Link>
				</nav>
				<Link to='/register'>Ready when you are <ArrowUpRight size={15} /></Link>
			</footer>
		</main>
	);
}

export default function App() {
	return (
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/login' element={<Login appRole='customer' />} />
			<Route path='/register' element={<Register appRole='customer' />} />

			<Route element={<ProtectedRoute requiredRole='customer' />}>
				<Route path='/customer' element={<CustomerDashboard />} />
			</Route>
			<Route element={<ProtectedRoute requiredRole='driver-pending' />}>
				<Route path='/driver-pending' element={<DriverPending appRole='customer' />} />
			</Route>

			<Route path='*' element={<Navigate to='/' replace />} />
		</Routes>
	);
}
