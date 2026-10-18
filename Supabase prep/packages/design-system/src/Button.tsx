import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'quiet';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
}

export default function Button({
	variant = 'primary',
	className = '',
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			className={`sr-button sr-button-${variant}${className ? ` ${className}` : ''}`}
		/>
	);
}
