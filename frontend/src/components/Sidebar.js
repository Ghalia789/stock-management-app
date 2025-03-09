import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, Inventory, ShoppingCart, BarChart, Settings } from '@mui/icons-material';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ open }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get current route to highlight active item

    const menuItems = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Suppliers', icon: <GroupsIcon />, path: '/suppliers' },
        { text: 'Products', icon: <Inventory />, path: '/products' },
        { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
        { text: 'Reports', icon: <BarChart />, path: '/reports' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? 240 : 80,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? 240 : 80,
                    transition: 'width 0.3s',
                    overflowX: 'hidden',
                },
            }}
        >
            <Toolbar>
                {open ? (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mx: 'auto' }}>
                        Admin Panel
                    </Typography>
                ) : (
                    <Typography variant="h6" sx={{ mx: 'auto' }}>A</Typography>
                )}
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path} // Highlight active item
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                            },
                            '&:hover': {
                                backgroundColor: 'primary.light',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                            {item.icon}
                        </ListItemIcon>
                        {open && <ListItemText primary={item.text} sx={{ ml: 2 }} />}
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
