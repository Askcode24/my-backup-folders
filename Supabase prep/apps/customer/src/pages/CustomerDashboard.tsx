import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
	ArrowDown,
	ArrowUp,
	Bike,
	CarFront,
	CheckCircle2,
	Clock3,
	MapPin,
	Package,
	Plus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '@swiftroute/design-system/Button';
import DashboardLayout from '@swiftroute/design-system/DashboardLayout';
import {
	createDelivery,
	getCustomerDeliveries,
	logoutUser,
	type VehicleType,
} from '@swiftroute/core';

interface Delivery {
	id: string;
	pickup_address: string;
	destination_address: string;
	vehicle: VehicleType;
	status: string;
	created_at: string;
}

export default function CustomerDashboard() {
	const [deliveries, setDeliveries] = useState<Delivery[]>([]);
	const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'active' | 'completed'>('all');
	const [vehicle, setVehicle] = useState<VehicleType>('motorcycle');
	const [pickup, setPickup] = useState('');
	const [destination, setDestination] = useState('');
	const [recipient, setRecipient] = useState('');
	const [phone, setPhone] = useState('');
	const [description, setDescription] = useState('');
	const [loading, setLoading] = useState(false);
	const [loadingDeliveries, setLoadingDeliveries] = useState(true);
	const [message, setMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const activeCount = deliveries.filter(
		(delivery) => !['delivered', 'cancelled'].includes(delivery.status)
	).length;
	const deliveredCount = deliveries.filter(
		(delivery) => delivery.status === 'delivered'
	).length;
	const awaitingPickupCount = deliveries.filter((delivery) =>
		['requested', 'accepted'].includes(delivery.status)
	).length;
	const visibleDeliveries = deliveries.filter((delivery) => {
		if (deliveryFilter === 'active') {
			return !['delivered', 'cancelled'].includes(delivery.status);
		}
		if (deliveryFilter === 'completed') return delivery.status === 'delivered';
		return true;
	});

	const loadDeliveries = useCallback(async () => {
		try {
			const rows = await getCustomerDeliveries();
			setDeliveries(rows as Delivery[]);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not load deliveries.'
			);
		} finally {
			setLoadingDeliveries(false);
		}
	}, []);

	useEffect(() => {
		void loadDeliveries();
	}, [loadDeliveries]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setMessage('');
		setErrorMessage('');

		try {
			await createDelivery({
				vehicle,
				pickupAddress: pickup,
				destinationAddress: destination,
				recipientName: recipient,
				recipientPhone: phone,
				packageDescription: description,
			});

			setPickup('');
			setDestination('');
			setRecipient('');
			setPhone('');
			setDescription('');
			setMessage('Your delivery request has been created.');
			await loadDeliveries();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not create delivery.'
			);
		} finally {
			setLoading(false);
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
		<DashboardLayout role='Customer' onLogout={() => void handleLogout()}>
			<div id='overview' className='dashboard-heading dashboard-heading-row customer-heading'>
				<div>
					<p className='dashboard-kicker'>CUSTOMER WORKSPACE</p>
					<h1>Your deliveries, all in one place.</h1>
					<p>Arrange a delivery and keep an eye on every step.</p>
				</div>
				<a href='#new-delivery' className='action-primary customer-new-delivery'><Plus size={16} /> New delivery</a>
			</div>

			<div className='dashboard-stat-grid' aria-label='Delivery summary'>
				<SummaryCard icon={<Package size={17} />} label='Active deliveries' value={activeCount} tone='green' />
				<SummaryCard icon={<CheckCircle2 size={17} />} label='Completed' value={deliveredCount} tone='lime' />
				<SummaryCard icon={<Clock3 size={17} />} label='Awaiting pickup' value={awaitingPickupCount} tone='sand' />
			</div>

			{message && <p role='status' className='dashboard-alert dashboard-alert-success'>{message}</p>}
			{errorMessage && <p role='alert' className='dashboard-alert dashboard-alert-error'>{errorMessage}</p>}

			<div className='customer-dashboard-grid'>
				<section id='deliveries' className='dashboard-panel delivery-list-panel'>
					<div className='panel-heading'>
						<div><h2>Your deliveries</h2><p>Recent and active requests</p></div>
						<div className='delivery-filter-tabs' role='group' aria-label='Filter deliveries'>
							{(['all', 'active', 'completed'] as const).map((filter) => (
								<button
									key={filter}
									type='button'
									aria-pressed={deliveryFilter === filter}
									onClick={() => setDeliveryFilter(filter)}>
									{filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Completed'}
								</button>
							))}
						</div>
					</div>
					{loadingDeliveries ? (
						<div className='dashboard-loading'><span className='loading-spinner' />Loading your deliveries…</div>
					) : visibleDeliveries.length === 0 ? (
						<div className='empty-state'>
							<span className='empty-state-icon'><Package size={22} /></span>
							<h3>{deliveries.length === 0 ? 'No deliveries yet' : 'No deliveries in this view'}</h3>
							<p>{deliveries.length === 0 ? 'Your delivery requests will appear here once you create one.' : 'Choose another filter to see your other deliveries.'}</p>
							{deliveries.length === 0 && <a href='#new-delivery' className='button button-lime'>Create your first delivery <Plus size={16} /></a>}
						</div>
					) : (
						<div className='delivery-list'>
							{visibleDeliveries.map((delivery) => (
								<article key={delivery.id} className='delivery-card'>
									<div className='delivery-card-heading'>
										<div className='delivery-reference'><span className='delivery-icon'><Package size={16} /></span><span><strong>SR-{delivery.id.slice(0, 6).toUpperCase()}</strong><small>{new Date(delivery.created_at).toLocaleString()}</small></span></div>
										<span className={`status-pill status-${delivery.status}`}>{delivery.status.replaceAll('_', ' ')}</span>
									</div>
									<div className='delivery-route'>
										<div className='route-marker route-pickup'><ArrowUp size={13} /></div>
										<div className='route-stop'><span>PICKUP</span><strong>{delivery.pickup_address}</strong></div>
										<div className='route-marker route-dropoff'><ArrowDown size={13} /></div>
										<div className='route-stop'><span>DROP-OFF</span><strong>{delivery.destination_address}</strong></div>
									</div>
									<div className='delivery-card-footer'>
										<span>{delivery.vehicle === 'motorcycle' ? <Bike size={15} /> : <CarFront size={15} />}{delivery.vehicle === 'motorcycle' ? 'Motorcycle' : 'Car / Van'}</span>
										<span><MapPin size={14} /> Delivery route</span>
									</div>
								</article>
							))}
						</div>
					)}
				</section>

				<section id='new-delivery' className='dashboard-panel delivery-form-card'>
					<div className='panel-heading'>
						<div>
							<p className='form-eyebrow'>READY WHEN YOU ARE</p>
							<h2>Book a delivery</h2>
							<p>Share the route and who should receive it.</p>
						</div>
						<span className='panel-heading-icon'><MapPin size={18} /></span>
					</div>
					<form onSubmit={handleSubmit} className='delivery-form'>
						<div>
							<label htmlFor='vehicle-type'>Vehicle type</label>
							<select
								id='vehicle-type'
								value={vehicle}
								onChange={(e) => setVehicle(e.target.value as VehicleType)}
								className='field-control'>
								<option value='motorcycle'>Motorcycle</option>
								<option value='car_van'>Car / Van</option>
							</select>
						</div>

						<div>
							<label htmlFor='pickup-address'>Pickup address</label>
							<input
								id='pickup-address'
								required
								autoComplete='street-address'
								value={pickup}
								onChange={(e) => setPickup(e.target.value)}
								className='field-control'
								placeholder='Where should we collect it?'
							/>
						</div>

						<div>
							<label htmlFor='destination-address'>Destination address</label>
							<input
								id='destination-address'
								required
								autoComplete='street-address'
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
								className='field-control'
								placeholder='Where should we deliver it?'
							/>
						</div>

						<div>
							<label htmlFor='recipient-name'>Recipient's name</label>
							<input
								id='recipient-name'
								required
								autoComplete='name'
								value={recipient}
								onChange={(e) => setRecipient(e.target.value)}
								className='field-control'
								placeholder='Who will receive it?'
							/>
						</div>

						<div>
							<label htmlFor='recipient-phone'>Recipient's phone</label>
							<input
								id='recipient-phone'
								required
								type='tel'
								autoComplete='tel'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className='field-control'
								placeholder='Phone number'
							/>
						</div>

						<div>
							<label htmlFor='package-description'>
								Package description <span className='field-optional'>Optional</span>
							</label>
							<textarea
								id='package-description'
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className='field-control'
								placeholder='A short description (optional)'
							/>
						</div>

						<Button disabled={loading} className='action-primary delivery-submit'>
							{loading ? 'Submitting...' : <>Request delivery <ArrowUp size={16} /></>}
						</Button>
					</form>
				</section>
			</div>
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
	value: number;
	tone: string;
}) {
	return (
		<div className='dashboard-stat-card'>
			<span className={`stat-icon stat-icon-${tone}`}>{icon}</span>
			<div><span>{label}</span><strong>{value}</strong></div>
			<span className='stat-trend'>{value === 1 ? '1 item' : `${value} items`}</span>
		</div>
	);
}
