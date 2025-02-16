import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1B263B', // Dark blue
        },
        secondary: {
            main: '#D4A373', // Light brown
        },
        error: {
            main: '#B71C1C', // Red
        },
        warning: {
            main: '#E89B00', // Orange
        },
        info: {
            main: '#2C2C2C', // Dark gray
        },
        success: {
            main: '#218838', // Green
        },
        background: {
            default: '#F5F5F5', // Light gray
        },
        text: {
            primary: '#6A0572', // Purple
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Lora", sans-serif',
        h1: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h2: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h3: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h6: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        subtitle1: {
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
        },
        subtitle2: {
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
        },
        body1: {
            fontFamily: 'Lora, serif',
        },
        body2: {
            fontFamily: 'Lora, serif',
        },
        button: {
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
        },
        caption: {
            fontFamily: 'Lora, serif',
        },
        overline: {
            fontFamily: 'Lora, serif',
        },
    },
});

export default theme;
