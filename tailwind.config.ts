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
        cs: {
          navy:       '#2F4156',
          teal:       '#567C8D',
          sky:        '#C8D9E6',
          beige:      '#F5EFEB',
          white:      '#FFFFFF',
          'sky-light':'#E8F0F5',
          'navy-dk':  '#1a2e3d',
          'teal-lt':  '#7A9BAD',
          border:     '#D0DDE6',
          muted:      '#8EA7B5',
          card:       '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '9999px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(47,65,86,0.10)',
        float: '0 8px 40px rgba(47,65,86,0.16)',
      },
      backgroundImage: {
        'cs-gradient':      'linear-gradient(135deg, #C8D9E6 0%, #F5EFEB 100%)',
        'cs-card-gradient': 'linear-gradient(160deg, #EEF4F8 0%, #F5EFEB 100%)',
      },
    },
  },
  plugins: [],
}
export default config
