import { supabase } from './supabase';

export type AccountType = 'customer' | 'driver';
export type VehicleType = 'motorcycle' | 'car_van';

interface RegisterInput {
	fullName: string;
	email: string;
	password: string;
	accountType: AccountType;
	vehicle?: VehicleType;
}

export async function registerUser(input: RegisterInput) {
	if (input.accountType === 'driver' && !input.vehicle) {
		throw new Error('Please select a vehicle type.');
	}

	const { data, error } = await supabase.auth.signUp({
		email: input.email.trim(),
		password: input.password,
		options: {
			data: {
				full_name: input.fullName.trim(),
				account_type: input.accountType,
				...(input.accountType === 'driver' ? { vehicle: input.vehicle } : {}),
			},
		},
	});

	if (error) throw error;
	return data;
}

export async function loginUser(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: email.trim(),
		password,
	});

	if (error) throw error;
	return data;
}

export async function logoutUser() {
	const { error } = await supabase.auth.signOut();

	if (error) throw error;
}
