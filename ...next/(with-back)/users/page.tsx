import React from 'react';
import ProductCard from '../../components/ProductCard';

interface User {
	id: number;
	name: string;
}

const UserPage = async () => {
	const res = await fetch('https://jsonplaceholder.typicode.com/users');
	const users: User[] = await res.json();
	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<div className='w-full max-w-2xl'>
				<h1 className='text-4xl font-bold text-center text-gray-50 mb-8'>
					Users
				</h1>
				<div className='bg-white rounded-lg shadow-lg overflow-hidden'>
					<ul className='divide-y divide-gray-200'>
						{users.map((user) => (
							<li
								key={user.id}
								className='px-6 py-4 hover:bg-indigo-50 transition-colors'>
								<span className='text-gray-700 font-medium'>{user.name}</span>
							</li>
						))}
					</ul>
				</div>
				<ProductCard />
			</div>
		</div>
	);
};

export default UserPage;
