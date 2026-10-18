import { supabase } from './supabase';

export type AppRole = 'customer' | 'driver' | 'admin';
export type UserWorkspace = AppRole | 'driver-pending';

const portalUrls: Record<AppRole, string | undefined> = {
	customer: import.meta.env.VITE_CUSTOMER_APP_URL,
	driver: import.meta.env.VITE_DRIVER_APP_URL,
	admin: import.meta.env.VITE_ADMIN_APP_URL,
};

export function getPortalUrl(role: AppRole, path: string) {
	const baseUrl = portalUrls[role];
	return baseUrl ? new URL(path, baseUrl).toString() : undefined;
}

export async function getUserWorkspace(userId: string): Promise<UserWorkspace> {
	const { data: application, error: applicationError } = await supabase
		.from('driver_applications')
		.select('approval_status')
		.eq('user_id', userId)
		.maybeSingle();

	if (applicationError) throw applicationError;

	if (
		application?.approval_status === 'pending' ||
		application?.approval_status === 'rejected'
	) {
		return 'driver-pending';
	}

	const { data: roles, error: rolesError } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', userId);

	if (rolesError) throw rolesError;

	if (roles?.some((item) => item.role === 'admin')) return 'admin';
	if (roles?.some((item) => item.role === 'driver')) return 'driver';
	return 'customer';
}
