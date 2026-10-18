import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	Bike,
	CarFront,
	CheckCircle2,
	Clock3,
	MapPin,
	Package,
	RefreshCw,
	Truck,
} from 'lucide-react';
import DashboardLayout from '@swiftroute/design-system/DashboardLayout';
import {
	acceptDelivery,
	getAvailableDeliveries,
	logoutUser,
	supabase,
	updateDeliveryStatus,
} from '@swiftroute/core';

interface Delivery {
	id: string;
	pickup_address: string;
	destination_address: string;
	vehicle: 'motorcycle' | 'car_van';
	status: string;
	created_at: string;
}

export default function DriverDashboard() {
	const [available, setAvailable] = useState<Delivery[]>([]);
	const [assigned, setAssigned] = useState<Delivery[]>([]);
	const [loading, setLoading] = useState(true);
	const [busyId, setBusyId] = useState('');
	const [message, setMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const loadJobs = useCallback(async () => {
		setLoading(true);
		setErrorMessage('');

		try {
			const [availableRows, userResult] = await Promise.all([
				getAvailableDeliveries(),
				supabase.auth.getUser(),
			]);

			if (userResult.error) throw userResult.error;
			if (!userResult.data.user) throw new Error('Please log in again.');

			const { data, error } = await supabase
				.from('deliveries')
				.select('*')
				.eq('driver_id', userResult.data.user.id)
				.in('status', ['accepted', 'picked_up', 'in_transit'])
				.order('created_at', { ascending: false });

			if (error) throw error;

			setAvailable(availableRows as Delivery[]);
			setAssigned((data ?? []) as Delivery[]);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not load jobs.'
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadJobs();
	}, [loadJobs]);

	async function handleAccept(id: string) {
		setBusyId(id);
		setMessage('');
		setErrorMessage('');

		try {
			await acceptDelivery(id);
			setMessage('Delivery accepted successfully.');
			await loadJobs();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Could not accept this delivery.'
			);
		} finally {
			setBusyId('');
		}
	}

	async function handleStatus(
		id: string,
		status: 'picked_up' | 'in_transit' | 'delivered'
	) {
		setBusyId(id);
		setMessage('');
		setErrorMessage('');

		try {
			await updateDeliveryStatus(id, status);
			setMessage('Delivery status updated.');
			await loadJobs();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Could not update delivery status.'
			);
		} finally {
			setBusyId('');
		}
	}

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
		<DashboardLayout role='Driver' onLogout={() => void handleLogout()}>
			<section id='overview' className='dashboard-heading dashboard-heading-row'>
				<div>
					<p className='dashboard-kicker'>DRIVER DASHBOARD</p>
					<h1>Your next stop, at a glance.</h1>
					<p>Manage active deliveries and pick up a nearby request.</p>
				</div>
				<button className='refresh-button' onClick={() => void loadJobs()} disabled={loading}>
					<RefreshCw size={15} className={loading ? 'spin' : ''} />
					{loading ? 'Refreshing...' : 'Refresh'}
				</button>
			</section>

			{message && <p role='status' className='dashboard-alert dashboard-alert-success'>{message}</p>}
			{errorMessage && <p role='alert' className='dashboard-alert dashboard-alert-error'>{errorMessage}</p>}

			<section className='dashboard-stat-grid' aria-label='Driver summary'>
				<SummaryCard icon={<Truck size={17} />} label='Active deliveries' value={assigned.length} tone='green' />
				<SummaryCard icon={<Package size={17} />} label='Available requests' value={available.length} tone='lime' />
				<SummaryCard icon={<CheckCircle2 size={17} />} label='Driver status' value={loading ? '…' : 'Ready'} tone='sand' />
			</section>

			<section id='active-deliveries' className='dashboard-panel driver-active-panel'>
				<div className='panel-heading'>
					<div><p className='form-eyebrow'>YOUR CURRENT ROUTE</p><h2>Active deliveries</h2><p>The next steps for packages in your care.</p></div>
					<span className='panel-heading-icon'><Truck size={18} /></span>
				</div>
				{assigned.length === 0 && !loading ? (
					<div className='empty-state compact-empty'>
						<span className='empty-state-icon'><Package size={22} /></span>
						<h3>No active deliveries</h3>
						<p>Accept a request below and it will show up here.</p>
						<a href='#available-deliveries' className='text-action'>Browse available deliveries <ArrowRight size={15} /></a>
					</div>
				) : (
					<div className='driver-job-grid'>
						{assigned.map((job, index) => (
							<article key={job.id} className={`driver-job-card${index === 0 ? ' featured-driver-card' : ''}`}>
								<div className='delivery-card-heading'>
									<div className='delivery-reference'><span className='delivery-icon'><Package size={16} /></span><span><strong>{index === 0 ? 'ACTIVE DELIVERY · ' : ''}SR-{job.id.slice(0, 6).toUpperCase()}</strong><small>{job.vehicle === 'motorcycle' ? 'Motorcycle' : 'Car / Van'}</small></span></div>
									<span className={`status-pill status-${job.status}`}>{job.status.replaceAll('_', ' ')}</span>
								</div>
								{index === 0 && <h3 className='featured-route-title'>Next stop: {job.destination_address}</h3>}
								<div className='delivery-route'>
									<div className='route-marker route-pickup'><ArrowUp size={13} /></div>
									<div className='route-stop'><span>PICKUP</span><strong>{job.pickup_address}</strong></div>
									<div className='route-marker route-dropoff'><ArrowDown size={13} /></div>
									<div className='route-stop'><span>DROP-OFF</span><strong>{job.destination_address}</strong></div>
								</div>
								<div className='driver-job-action'>
									{job.status === 'accepted' && <button disabled={busyId === job.id} onClick={() => handleStatus(job.id, 'picked_up')} className='action-primary'>Mark package picked up <ArrowRight size={16} /></button>}
									{job.status === 'picked_up' && <button disabled={busyId === job.id} onClick={() => handleStatus(job.id, 'in_transit')} className='action-primary'>Start delivery <ArrowRight size={16} /></button>}
									{job.status === 'in_transit' && <button disabled={busyId === job.id} onClick={() => handleStatus(job.id, 'delivered')} className='action-primary'>Mark as delivered <CheckCircle2 size={16} /></button>}
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			<section id='available-deliveries' className='dashboard-panel available-panel'>
				<div className='panel-heading'>
					<div><p className='form-eyebrow'>PICK YOUR NEXT ROUTE</p><h2>Available nearby</h2><p>Delivery requests ready for a driver.</p></div>
					<span className='panel-count'>{available.length} available</span>
				</div>
				{loading ? (
					<div className='dashboard-loading'><span className='loading-spinner' />Loading delivery requests…</div>
				) : available.length === 0 ? (
					<div className='empty-state compact-empty'>
						<span className='empty-state-icon'><MapPin size={22} /></span>
						<h3>No requests available right now</h3>
						<p>Check back soon. New delivery opportunities will appear here.</p>
					</div>
				) : (
					<div className='available-job-grid'>
						{available.map((job) => {
							const VehicleIcon = job.vehicle === 'motorcycle' ? Bike : CarFront;
							return (
								<article key={job.id} className='available-job-card'>
									<div className='delivery-card-heading'>
										<div className='delivery-reference'><span className='delivery-icon'><VehicleIcon size={16} /></span><span><strong>SR-{job.id.slice(0, 6).toUpperCase()}</strong><small>{job.vehicle === 'motorcycle' ? 'Motorcycle' : 'Car / Van'}</small></span></div>
										<span className='status-pill status-requested'>New request</span>
									</div>
									<div className='delivery-route'>
										<div className='route-marker route-pickup'><ArrowUp size={13} /></div>
										<div className='route-stop'><span>PICKUP</span><strong>{job.pickup_address}</strong></div>
										<div className='route-marker route-dropoff'><ArrowDown size={13} /></div>
										<div className='route-stop'><span>DROP-OFF</span><strong>{job.destination_address}</strong></div>
									</div>
									<p className='available-created'><Clock3 size={14} /> Requested {new Date(job.created_at).toLocaleDateString()}</p>
									<button disabled={busyId === job.id} onClick={() => void handleAccept(job.id)} className='action-primary'>
										{busyId === job.id ? 'Accepting...' : <>Accept delivery <ArrowRight size={16} /></>}
									</button>
								</article>
							);
						})}
					</div>
				)}
			</section>
		</DashboardLayout>
	);
}

function SummaryCard({
	icon,
	label,
	value,
	tone,
}: {
	icon: ReactNode;
	label: string;
	value: number | string;
	tone: string;
}) {
	return (
		<div className='dashboard-stat-card'>
			<span className={`stat-icon stat-icon-${tone}`}>{icon}</span>
			<div><span>{label}</span><strong>{value}</strong></div>
		</div>
	);
}
