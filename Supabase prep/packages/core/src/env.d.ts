/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
	readonly VITE_CUSTOMER_APP_URL?: string;
	readonly VITE_DRIVER_APP_URL?: string;
	readonly VITE_ADMIN_APP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
