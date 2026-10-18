import { supabase } from './supabase';
import type { VehicleType } from './auth.service';

export interface DeliveryInput {
	vehicle: VehicleType;
	pickupAddress: string;
	destinationAddress: string;
	recipientName: string;
	recipientPhone: string;
	packageDescription?: string;
}

export async function createDelivery(input: DeliveryInput) {
	const { data: userData, error: userError } = await supabase.auth.getUser();

	if (userError) throw userError;
	if (!userData.user) throw new Error('Please log in first.');

	const { data, error } = await supabase
		.from('deliveries')
		.insert({
			customer_id: userData.user.id,
			vehicle: input.vehicle,
			pickup_address: input.pickupAddress,
			destination_address: input.destinationAddress,
			recipient_name: input.recipientName,
			recipient_phone: input.recipientPhone,
			package_description: input.packageDescription || null,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function getCustomerDeliveries() {
	const { data: userData, error: userError } = await supabase.auth.getUser();

	if (userError) throw userError;
	if (!userData.user) throw new Error('Please log in first.');

	const { data, error } = await supabase
		.from('deliveries')
		.select('*')
		.eq('customer_id', userData.user.id)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export async function getAvailableDeliveries() {
	const { data, error } = await supabase
		.from('deliveries')
		.select('*')
		.is('driver_id', null)
		.eq('status', 'requested')
		.order('created_at', { ascending: true });

	if (error) throw error;
	return data;
}

export async function acceptDelivery(deliveryId: string) {
	const { data, error } = await supabase.rpc('accept_delivery', {
		p_delivery_id: deliveryId,
	});

	if (error) throw error;
	return data;
}

export async function updateDeliveryStatus(
	deliveryId: string,
	newStatus: 'picked_up' | 'in_transit' | 'delivered'
) {
	const { error } = await supabase.rpc('update_delivery_status', {
		p_delivery_id: deliveryId,
		p_new_status: newStatus,
	});

	if (error) throw error;
}
