/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sena: {
          header: '#014011', // Encabezado / Header (verde oscuro)
          bg: '#9FBFAA', // Fondo general (gris neutro verdoso)
          card: '#F5F0E1', // Tarjetas / contenedores (beige claro)
          'card-border': '#E4DCC5', // Borde sutil para tarjetas beige
          primary: '#025918', // Botones primarios (verde medio)
          'primary-hover': '#014011', // Hover de botón primario
          secondary: '#9CA3AF', // Botón "Cancelar" (gris)
          'secondary-hover': '#6B7280',
        },
        // Semáforo de trazabilidad (días en uso)
        semaforo: {
          verde: '#16A34A',
          amarillo: '#EAB308',
          rojo: '#DC2626',
        },
      },
      fontFamily: {
        title: ['Montserrat', 'sans-serif'], // Títulos (usar con font-bold)
        data: ['"Josefin Sans"', 'sans-serif'], // Datos / cuerpo
      },
      borderRadius: {
        card: '1rem',
        input: '0.75rem',
      },
      boxShadow: {
        card: '0 4px 12px rgba(1, 64, 17, 0.12)',
      },
    },
  },
  plugins: [],
};
