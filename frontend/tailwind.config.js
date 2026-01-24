/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#e8edef',
					100: '#d1dbde',
					200: '#a3b7bd',
					300: '#75939c',
					400: '#476f7b',
					500: '#304b50',
					600: '#263c40',
					700: '#1d2d30',
					800: '#131e20',
					900: '#0a0f10'
				},
				secondary: {
					50: '#e6fef3',
					100: '#ccfde7',
					200: '#99fbcf',
					300: '#66f9b7',
					400: '#33f79f',
					500: '#06E481',
					600: '#05b667',
					700: '#04894d',
					800: '#025b33',
					900: '#012e1a'
				}
			}
		}
	},
	plugins: []
};
