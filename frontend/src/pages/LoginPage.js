import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, TextField, Container, Typography, Grid, Paper, Box, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/auth/login',
                { username, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            login(data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Box
            sx={{
                backgroundImage: 'url(checkerboard-cross.png)', // Replace with your image path
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} textAlign="center">
                            <img src="easystock-high-resolution-logo.png" alt="Logo" style={{ width: '150px' }} />
                            <Typography variant="h4" gutterBottom>
                                Admin Login
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Username"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <TextField
                                    label="Password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleTogglePassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                                    Login
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginPage;
