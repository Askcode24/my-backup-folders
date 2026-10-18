import type { ReactNode } from 'react';
import BackToHome from '../components/BackToHome';

export default function WithBackLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<BackToHome />
		</>
	);
}
