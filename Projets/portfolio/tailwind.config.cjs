/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				heading: ['Space Grotesk', 'sans-serif'],
				body: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: [
			{
				night: {
					...require("daisyui/src/theming/themes").night,
					primary: "#00f0ff",
					"primary-content": "#001a1e",
					secondary: "#ff00e5",
					"secondary-content": "#1a0017",
					accent: "#8b5cf6",
					"accent-content": "#0f0524",
				},
			},
		],
		darkTheme: "night",
		logs: false,
	},
}
