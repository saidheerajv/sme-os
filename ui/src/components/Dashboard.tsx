import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { LogoutOutlined, PersonOutlined, DashboardOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <DashboardOutlined sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CMS Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutlined />
              <Typography variant="body2">
                {user?.name}
              </Typography>
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Card */}
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            color: 'white',
            mb: 3,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to Your CMS Dashboard
          </Typography>
          <Typography variant="h6" align="center">
            Hello, {user?.name}! You are successfully logged in.
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 1, opacity: 0.9 }}>
            Email: {user?.email}
          </Typography>
        </Paper>

        {/* Feature Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Entity Definitions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage your content entity definitions
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth onClick={() => navigate('/entity-definitions')}>
                  Manage Entities
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit, and organize your content
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                  Manage Content
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure your account and preferences
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                  View Settings
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* User Info Card */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1">
                {user?.id}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;