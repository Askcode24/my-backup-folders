import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ArrowDown,
	ArrowUp,
	BadgeCheck,
	Clock3,
	RefreshCw,
	Truck,
	Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import DashboardLayout from '@swiftroute/design-system/DashboardLayout';
import { logoutUser, supabase } from '@swiftroute/core';

type Vehicle = 'motorcycle' | 'car_van';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type DeliveryStatus =
	| 'requested'
	| 'accepted'
	| 'picked_up'
	| 'in_transit'
	| 'delivered'
	| 'cancelled';

interface DriverApplication {
	user_id: string;
	vehicle: Vehicle;
	approval_status: ApprovalStatus;
	created_at: string;
}

interface Delivery {
	id: string;
	customer_id: string;
	driver_id: string | null;
	vehicle: Vehicle;
	pickup_address: string;
	destination_address: string;
	recipient_name: string;
	recipient_phone: string;
	package_description: string;
	status: DeliveryStatus;
	created_at: string;
}

function formatStatus(status: string) {
	return status.replaceAll('_', ' ');
}

function formatDate(date: string) {
	return new Date(date).toLocaleString();
}

export default function AdminDashboard() {
	const [applications, setApplications] = useState<DriverApplication[]>([]);
	const [deliveries, setDeliveries] = useState<Delivery[]>([]);
	const [loading, setLoading] = useState(true);
	const [busyId, setBusyId] = useState('');
	const [message, setMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [deliveryFilter, setDeliveryFilter] = useState('all');
	const [assignments, setAssignments] = useState<Record<string, string>>({});

	const loadDashboard = useCallback(async () => {
		setLoading(true);
		setErrorMessage('');

		try {
			const [driverResult, deliveryResult] = await Promise.all([
				supabase
					.from('driver_applications')
					.select('user_id, vehicle, approval_status, created_at')
					.order('created_at', { ascending: false }),

				supabase
					.from('deliveries')
					.select(
						'id, customer_id, driver_id, vehicle, pickup_address, destination_address, recipient_name, recipient_phone, package_description, status, created_at'
					)
					.order('created_at', { ascending: false }),
			]);

			const errors: string[] = [];

			if (driverResult.error) {
				errors.push(`Driver applications: ${driverResult.error.message}`);
			} else {
				setApplications((driverResult.data ?? []) as DriverApplication[]);
			}
			if (deliveryResult.error) {
				errors.push(`Deliveries: ${deliveryResult.error.message}`);
			} else {
				setDeliveries((deliveryResult.data ?? []) as Delivery[]);
			}

			if (errors.length) {
				setErrorMessage(errors.join(' | '));
			}
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not load dashboard.'
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadDashboard();
	}, [loadDashboard]);

	const approvedDrivers = useMemo(
		() =>
			applications.filter((driver) => driver.approval_status === 'approved'),
		[applications]
	);

	const pendingCount = applications.filter(
		(driver) => driver.approval_status === 'pending'
	).length;

	const activeCount = deliveries.filter((delivery) =>
		['accepted', 'picked_up', 'in_transit'].includes(delivery.status)
	).length;

	const deliveredCount = deliveries.filter(
		(delivery) => delivery.status === 'delivered'
	).length;
	const inTransitCount = deliveries.filter((delivery) =>
		['picked_up', 'in_transit'].includes(delivery.status)
	).length;
	const awaitingAssignmentCount = deliveries.filter(
		(delivery) => delivery.status === 'requested' && !delivery.driver_id
	).length;
	const deliveredShare = deliveries.length ? (deliveredCount / deliveries.length) * 100 : 0;
	const inTransitShare = deliveries.length ? (inTransitCount / deliveries.length) * 100 : 0;

	const visibleDeliveries = deliveries.filter((delivery) =>
		deliveryFilter === 'all' ? true : delivery.status === deliveryFilter
	);

	async function reviewDriver(userId: string, approved: boolean) {
		setBusyId(userId);
		setMessage('');
		setErrorMessage('');

		try {
			const { error } = await supabase.rpc('review_driver', {
				p_driver_id: userId,
				p_approved: approved,
			});

			if (error) throw error;

			setMessage(
				approved
					? 'Driver approved successfully.'
					: 'Driver application rejected.'
			);

			await loadDashboard();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Could not review application.'
			);
		} finally {
			setBusyId('');
		}
	}

	async function assignDriver(delivery: Delivery) {
		const driverId = assignments[delivery.id];

		if (!driverId) {
			setErrorMessage('Select a driver before assigning this delivery.');
			return;
		}

		setBusyId(delivery.id);
		setMessage('');
		setErrorMessage('');

		try {
			const { error } = await supabase.rpc('admin_assign_delivery', {
				p_delivery_id: delivery.id,
				p_driver_id: driverId,
			});

			if (error) throw error;

			setMessage('Delivery assigned successfully.');
			setAssignments((current) => {
				const next = { ...current };
				delete next[delivery.id];
				return next;
			});

			await loadDashboard();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Could not assign this delivery.'
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
		<DashboardLayout role='Admin' onLogout={() => void handleLogout()}>
			<section id='overview' className='dashboard-heading dashboard-heading-row'>
				<div>
					<p className='dashboard-kicker'>OPERATIONS OVERVIEW</p>
					<h1>Keep deliveries moving.</h1>
					<p>Approve drivers, monitor deliveries, and assign jobs.</p>
				</div>
				<button
					onClick={() => void loadDashboard()}
					disabled={loading}
					className='refresh-button'>
					<RefreshCw size={15} className={loading ? 'spin' : ''} />
					{loading ? 'Refreshing...' : 'Refresh'}
				</button>
			</section>

				{message && (
					<div
						role='status'
						className='mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'>
						{message}
					</div>
				)}

				{errorMessage && (
					<div
						role='alert'
						className='mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
						<p className='font-semibold'>Something needs attention</p>
						<p className='mt-1 wrap-break-word'>{errorMessage}</p>
					</div>
				)}

				<section
					aria-label='Dashboard summary'
					className='dashboard-stat-grid admin-stat-grid'>
					<SummaryCard
						icon={<Truck size={17} />}
						label='Active deliveries'
						value={activeCount}
						tone='lime'
					/>
					<SummaryCard
						icon={<Clock3 size={17} />}
						label='Awaiting assignment'
						value={awaitingAssignmentCount}
						tone='green'
					/>
					<SummaryCard
						icon={<Users size={17} />}
						label='Available drivers'
						value={approvedDrivers.length}
						tone='green'
					/>
					<SummaryCard
						icon={<BadgeCheck size={17} />}
						label='Pending approvals'
						value={pendingCount}
						tone='sand'
					/>
				</section>

				<div className='admin-insights-grid'>
				<section id='driver-applications' className='dashboard-panel admin-panel'>
					<div className='panel-heading'>
						<div><p className='form-eyebrow'>GROW THE DRIVER NETWORK</p><h2>Driver approvals</h2><p>Review applications before drivers can accept delivery jobs.</p></div>
						<span className='panel-heading-icon'><BadgeCheck size={18} /></span>
					</div>

					{loading && applications.length === 0 ? (
						<p className='mt-5 text-sm text-slate-500'>
							Loading driver applications...
						</p>
					) : applications.length === 0 ? (
						<p className='mt-5 text-sm text-slate-500'>
							No driver applications found.
						</p>
					) : (
						<div className='mt-5 space-y-3'>
							{applications.map((application) => (
								<article
									key={application.user_id}
									className='dashboard-list-card application-card'>
									<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
										<div className='min-w-0'>
											<div className='application-person'>
												<span className='person-avatar'>{application.vehicle === 'motorcycle' ? 'M' : 'V'}</span>
												<p className='font-semibold'>
												{application.vehicle === 'motorcycle'
													? 'Motorcycle driver'
													: 'Car / Van driver'}
												<small>{application.vehicle === 'motorcycle' ? 'Motorcycle' : 'Car / Van'} · Applicant</small>
												</p>
											</div>
											<p className='applicant-id'>
												Applicant ID · {application.user_id}
											</p>
											<p className='mt-2 application-date'>
												<Clock3 size={13} />
												Applied: {formatDate(application.created_at)}
											</p>
										</div>

										<div className='flex flex-wrap items-center gap-2'>
											<span
												className={`status-pill status-${application.approval_status}`}>
												{formatStatus(application.approval_status)}
											</span>

											{application.approval_status === 'pending' && (
												<>
													<button
														disabled={busyId === application.user_id}
														onClick={() =>
															void reviewDriver(application.user_id, true)
														}
														className='rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60'>
														{busyId === application.user_id
															? 'Please wait...'
															: 'Approve'}
													</button>
													<button
														disabled={busyId === application.user_id}
														onClick={() =>
															void reviewDriver(application.user_id, false)
														}
														className='rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'>
														Reject
													</button>
												</>
											)}
										</div>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
				<section className='dashboard-panel admin-panel admin-activity-panel' aria-label='Delivery activity'>
					<div className='panel-heading'>
						<div><h2>Delivery activity</h2><p>Current progress across all requests</p></div>
						<span className='activity-live'><i /> Live</span>
					</div>
					<div className='activity-chart-row'>
						<div
							className='activity-donut'
							style={{
								background: `conic-gradient(#194d3c 0 ${deliveredShare}%, #d7f36a ${deliveredShare}% ${deliveredShare + inTransitShare}%, #e9efe8 ${deliveredShare + inTransitShare}% 100%)`,
							}}>
							<span><strong>{deliveries.length}</strong><small>total</small></span>
						</div>
						<div className='activity-legend'>
							<span><i className='legend-delivered' />Delivered<strong>{deliveredCount}</strong></span>
							<span><i className='legend-transit' />In progress<strong>{inTransitCount}</strong></span>
							<span><i className='legend-awaiting' />Awaiting<strong>{awaitingAssignmentCount}</strong></span>
						</div>
					</div>
				</section>
				</div>

				<section id='delivery-management' className='dashboard-panel admin-panel'>
				<div className='panel-heading panel-heading-responsive'>
					<div><p className='form-eyebrow'>LIVE DELIVERY QUEUE</p><h2>Delivery management</h2><p>View requests and assign eligible drivers to unassigned jobs.</p></div>
					<label className='delivery-filter'>
							<span className='font-medium text-slate-600'>Filter:</span>
							<select
								value={deliveryFilter}
								onChange={(event) => setDeliveryFilter(event.target.value)}
								className='rounded-lg border border-slate-300 bg-white px-3 py-2'>
								<option value='all'>All deliveries</option>
								<option value='requested'>Requested</option>
								<option value='accepted'>Accepted</option>
								<option value='picked_up'>Picked up</option>
								<option value='in_transit'>In transit</option>
								<option value='delivered'>Delivered</option>
								<option value='cancelled'>Cancelled</option>
							</select>
						</label>
					</div>

					{loading && deliveries.length === 0 ? (
						<p className='mt-5 text-sm text-slate-500'>Loading deliveries...</p>
					) : visibleDeliveries.length === 0 ? (
						<p className='mt-5 rounded-lg bg-slate-50 p-5 text-sm text-slate-500'>
							No deliveries found for this filter. If you expected requests
							here, check the error message above and your Supabase read policy.
						</p>
					) : (
						<div className='delivery-management-list'>
							{visibleDeliveries.map((delivery) => {
								const compatibleDrivers = applications.filter(
									(driver) =>
										driver.approval_status === 'approved' &&
										driver.vehicle === delivery.vehicle
								);

								return (
									<article
										key={delivery.id}
										className='dashboard-list-card admin-delivery-card'>
										<div className='flex flex-wrap items-start justify-between gap-3'>
											<div>
												<p className='admin-delivery-ref'>SR-{delivery.id.slice(0, 6).toUpperCase()} <span>· {delivery.vehicle === 'motorcycle' ? 'Motorcycle' : 'Car / Van'}</span></p>
												<h3 className='mt-2 font-semibold'>
													{delivery.pickup_address}
												</h3>
												<div className='admin-delivery-route'>
													<span><ArrowUp size={13} /> {delivery.pickup_address}</span>
													<span><ArrowDown size={13} /> {delivery.destination_address}</span>
												</div>
											</div>

											<span
												className={`status-pill status-${delivery.status} capitalize`}>
												{formatStatus(delivery.status)}
											</span>
										</div>

										<div className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
											<div className='rounded-lg bg-slate-50 p-3'>
												<p className='text-xs text-slate-500'>Vehicle needed</p>
												<p className='mt-1 font-medium'>
													{delivery.vehicle === 'motorcycle'
														? 'Motorcycle'
														: 'Car / Van'}
												</p>
											</div>
											<div className='rounded-lg bg-slate-50 p-3'>
												<p className='text-xs text-slate-500'>Recipient</p>
												<p className='mt-1 font-medium'>
													{delivery.recipient_name}
												</p>
												<p className='text-slate-600'>
													{delivery.recipient_phone}
												</p>
											</div>
											<div className='rounded-lg bg-slate-50 p-3 sm:col-span-2'>
												<p className='text-xs text-slate-500'>Package</p>
												<p className='mt-1'>{delivery.package_description}</p>
											</div>
											<div className='rounded-lg bg-slate-50 p-3 sm:col-span-2'>
												<p className='text-xs text-slate-500'>Customer ID</p>
												<p className='mt-1 break-all text-xs'>
													{delivery.customer_id}
												</p>
												<p className='mt-2 text-xs text-slate-500'>
													Created: {formatDate(delivery.created_at)}
												</p>
											</div>
										</div>

										{delivery.driver_id ? (
											<div className='mt-4 rounded-lg bg-blue-50 p-3'>
												<p className='text-xs font-semibold text-blue-800'>
													Assigned driver
												</p>
												<p className='mt-1 break-all text-sm text-blue-900'>
													{delivery.driver_id}
												</p>
											</div>
										) : delivery.status === 'requested' ? (
											<div className='mt-4 rounded-lg border border-dashed border-slate-300 p-4'>
												<label
													htmlFor={`driver-${delivery.id}`}
													className='block text-sm font-semibold'>
													Assign an approved driver
												</label>

												<div className='mt-2 flex flex-col gap-2 sm:flex-row'>
													<select
														id={`driver-${delivery.id}`}
														value={assignments[delivery.id] ?? ''}
														onChange={(event) =>
															setAssignments((current) => ({
																...current,
																[delivery.id]: event.target.value,
															}))
														}
														className='min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'>
														<option value=''>Select compatible driver</option>
														{compatibleDrivers.map((driver) => (
															<option
																key={driver.user_id}
																value={driver.user_id}>
																{driver.vehicle === 'motorcycle'
																	? 'Motorcycle'
																	: 'Car / Van'}{' '}
																— {driver.user_id}
															</option>
														))}
													</select>

													<button
														disabled={
															!assignments[delivery.id] ||
															busyId === delivery.id
														}
														onClick={() => void assignDriver(delivery)}
														className='rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'>
														{busyId === delivery.id
															? 'Assigning...'
															: 'Assign delivery'}
													</button>
												</div>

												{compatibleDrivers.length === 0 && (
													<p className='mt-2 text-xs text-amber-700'>
														No approved driver with the required vehicle is
														available. Approve a compatible driver first.
													</p>
												)}
											</div>
										) : null}
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
	value: number;
	tone: string;
}) {
	return (
		<div className='dashboard-stat-card'>
			<span className={`stat-icon stat-icon-${tone}`}>{icon}</span>
			<div><span>{label}</span><strong>{value}</strong></div>
			<span className='stat-trend'><Clock3 size={12} /> Live</span>
		</div>
	);
}
