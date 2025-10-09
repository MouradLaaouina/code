/*
  Configuration Tailwind CSS pour le site A2S
  - Déclare les chemins de contenu HTML/JS à scanner
  - Étend la palette avec les couleurs de marque
  - Définit une police par défaut (Inter)
*/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'a2s-green-dark': '#2f6b2f',
        'a2s-green': '#3e8a3e',
        'a2s-green-light': '#58a358',
      },
      backgroundImage: {
        'a2s-gradient': 'linear-gradient(90deg, #2f6b2f 0%, #3e8a3e 50%, #58a358 100%)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
