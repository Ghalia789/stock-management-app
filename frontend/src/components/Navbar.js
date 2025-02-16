// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Box, Badge, Typography } from '@mui/material';
import { AccountCircle, Notifications as NotificationsIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ handleDrawerToggle, open }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { logout } = useContext(AuthContext);

  const notifications = [
    { id: 1, message: 'New order received', time: '10 minutes ago' },
    { id: 2, message: 'Stock level low for Product A', time: '1 hour ago' },
    { id: 3, message: 'System update scheduled', time: '2 hours ago' },
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
        <img src="easystock-high-resolution-logo.png" alt="Logo" style={{ height: '40px' }} />
        <Box sx={{ flexGrow: 1 }} />
        <div>
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
            onClick={handleNotificationsClick}
          >
            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
          >
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationsClose}>
                <Box sx={{ width: '200px' }}>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
