import {
	ArrowUpRight,
	ClipboardList,
	LayoutDashboard,
	LogOut,
	PackageCheck,
	Route,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@swiftroute/core';

type DashboardRole = 'Customer' | 'Driver' | 'Admin';

const sectionLinks: Record<DashboardRole, { label: string; href: string }[]> = {
	Customer: [
		{ label: 'Overview', href: '#overview' },
		{ label: 'Deliveries', href: '#deliveries' },
		{ label: 'New delivery', href: '#new-delivery' },
	],
	Driver: [
		{ label: 'Overview', href: '#overview' },
		{ label: 'Deliveries', href: '#active-deliveries' },
		{ label: 'Available nearby', href: '#available-deliveries' },
	],
	Admin: [
		{ label: 'Overview', href: '#overview' },
		{ label: 'Drivers', href: '#driver-applications' },
		{ label: 'Delivery management', href: '#delivery-management' },
	],
};

export default function DashboardLayout({
	role,
	onLogout,
	children,
}: {
	role: DashboardRole;
	onLogout: () => void;
	children: ReactNode;
}) {
	const location = useLocation();
	const [accountName, setAccountName] = useState(`${role} account`);
	const [accountInitial, setAccountInitial] = useState(role.slice(0, 1));
	const [accountError, setAccountError] = useState('');

	useEffect(() => {
		let active = true;

		async function loadAccount() {
			try {
				const { data, error } = await supabase.auth.getSession();
				if (error) throw error;

				const user = data.session?.user;
				const metadataName = user?.user_metadata?.full_name;
				const name =
					typeof metadataName === 'string' && metadataName.trim()
						? metadataName.trim()
						: user?.email?.split('@')[0];

				if (active && name) {
					const initials = name
						.split(/\s+/)
						.map((part: string) => part[0])
						.join('')
						.slice(0, 2)
						.toUpperCase();
					setAccountName(name);
					setAccountInitial(initials || role.slice(0, 1));
				}
			} catch (error) {
				if (active) {
					setAccountError(
						error instanceof Error
							? error.message
							: 'Could not load account details.'
					);
				}
			}
		}

		void loadAccount();

		return () => {
			active = false;
		};
	}, [role]);

	return (
		<div className='dashboard-shell'>
			<aside className='dashboard-sidebar'>
				<Link to='/' className='dashboard-brand' aria-label='SwiftRoute home'>
					<span className='dashboard-brand-mark'>
						<Route size={18} strokeWidth={2.2} />
					</span>
					<span>swift<span>route</span></span>
					<ArrowUpRight className='dashboard-brand-arrow' size={14} />
				</Link>

				<p className='sidebar-label'>{role.toUpperCase()} WORKSPACE</p>
				<nav className='dashboard-nav' aria-label={`${role} dashboard`}>
					{sectionLinks[role].map((item, index) => {
						const Icon = index === 0 ? LayoutDashboard : index === 1 ? PackageCheck : ClipboardList;
						return (
							<a
								key={item.href}
								href={item.href}
								className={`dashboard-nav-link${(location.hash || '#overview') === item.href ? ' is-active' : ''}`}>
								<Icon size={17} strokeWidth={1.8} />
								<span>{item.label}</span>
							</a>
						);
					})}
				</nav>

				<div className='dashboard-sidebar-bottom'>
					<button type='button' onClick={onLogout} className='dashboard-signout'>
						<LogOut size={16} />
						<span>Sign out</span>
					</button>
				</div>
			</aside>

			<div className='dashboard-main'>
				<header className='dashboard-topbar'>
					<div className='topbar-crumb'>
						<span>SwiftRoute</span>
						<span className='crumb-divider'>/</span>
						<strong>{role} workspace</strong>
					</div>
					<div className='topbar-user'>
						<span className='topbar-user-copy'><strong>{accountName}</strong><small>{role}</small></span>
						<span className='topbar-avatar' aria-hidden='true'>{accountInitial}</span>
						<button type='button' onClick={onLogout} className='topbar-logout' aria-label='Sign out'>
							<LogOut size={15} />
						</button>
					</div>
				</header>
				<main className='dashboard-content'>
					{accountError && <p className='dashboard-alert dashboard-alert-error' role='alert'>{accountError}</p>}
					{children}
				</main>
			</div>
		</div>
	);
}
