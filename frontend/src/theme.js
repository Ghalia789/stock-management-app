import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#1B263B' },
        secondary: { main: '#D4A373' },
        error: { main: '#B71C1C' },
        warning: { main: '#E89B00' },
        info: { main: '#2C2C2C' },
        success: { main: '#218838' },
        background: { default: '#F5F5F5' },
        text: { primary: '#6A0572' },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Lora", sans-serif',
        h1: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        h2: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        h3: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        h4: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        h5: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        h6: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
        subtitle1: { fontFamily: 'Roboto, sans-serif', fontWeight: 500 },
        subtitle2: { fontFamily: 'Roboto, sans-serif', fontWeight: 500 },
        body1: { fontFamily: 'Lora, serif' },
        body2: { fontFamily: 'Lora, serif' },
        button: { fontFamily: 'Roboto, sans-serif', fontWeight: 500 },
        caption: { fontFamily: 'Lora, serif' },
        overline: { fontFamily: 'Lora, serif' },

        // ✅ Using Great Vibes for special elements like headings or accents
        customCalligraphy: { fontFamily: '"Allura", cursive', fontSize: '2rem' },
    },
});

export default theme;
