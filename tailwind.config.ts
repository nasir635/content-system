import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ig: {
          bg:       '#FAFAFA',
          white:    '#FFFFFF',
          border:   '#DBDBDB',
          text:     '#262626',
          muted:    '#8E8E8E',
          faint:    '#C7C7C7',
          blue:     '#0095F6',
          'blue-dk':'#00376B',
          red:      '#ED4956',
          hover:    '#F2F2F2',
          card:     '#FFFFFF',
          surface:  '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      },
      borderRadius: { ig: '8px' },
      maxWidth: { 'ig-feed': '614px', 'ig-layout': '935px' },
    },
  },
  plugins: [],
}
export default config
