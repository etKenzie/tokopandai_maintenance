"use client";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import PageContainer from "@/app/components/container/PageContainer";
import { useAuth } from '@/app/context/AuthContext';
import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { getPageRoles } from '@/config/roles';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import {
  IconArrowRight,
  IconCalendarCheck,
  IconClipboardList,
  IconMail,
  IconSearch,
  IconShield,
  IconTool,
  IconUser
} from "@tabler/icons-react";
import { useMemo, useState } from 'react';

export default function Dashboard() {
  const { user, roles } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check access for allowed roles
  const accessCheck = useCheckRoles(getPageRoles('AUTHENTICATED_ONLY'));

  // Create pages with correct URLs based on environment
  const allPages = useMemo(() => [
    {
      title: "Requests",
      description: "View and manage maintenance requests",
      icon: IconClipboardList,
      href: "/maintenance",
      color: "primary",
      chip: "Core"
    },
    {
      title: "Clients",
      description: "Manage client list for maintenance requests",
      icon: IconCalendarCheck,
      href: "/maintenance/client",
      color: "secondary",
      chip: "Master Data"
    },
    {
      title: "Tukang",
      description: "Manage tukang profiles and assignment details",
      icon: IconTool,
      href: "/maintenance/tukang",
      color: "warning",
      chip: "Master Data"
    }
  ], []);

  // Filter pages based on search query
  const availablePages = useMemo(() => {
    if (!searchQuery.trim()) return allPages;
    
    const query = searchQuery.toLowerCase();
    return allPages.filter(page => 
      page.title.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.chip.toLowerCase().includes(query)
    );
  }, [allPages, searchQuery]);

  return (
    <ProtectedRoute requiredRoles={getPageRoles('AUTHENTICATED_ONLY')}>
      <PageContainer title="SERVICE DASHBOARD" description="Welcome to SERVICE DASHBOARD">
        <Box mt={3}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
              SERVICE DASHBOARD
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Welcome back! Manage requests, clients, and tukang from one place.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* User Profile Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box ml={2}>
                      <Typography variant="h5" fontWeight="bold">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* User Details */}
                  <List dense sx={{ flexGrow: 1 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconMail size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={user?.email}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconShield size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Roles" 
                        secondary={
                          <Box display="flex" gap={1} mt={0.5}>
                            {roles.map((role, index) => (
                              <Chip 
                                key={index} 
                                label={role} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>

                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconUser size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="User ID" 
                        secondary={user?.id}
                        secondaryTypographyProps={{ 
                          variant: 'body2',
                          sx: { fontFamily: 'monospace', fontSize: '0.75rem' }
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Available Pages */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                      Quick Access
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ width: 250 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconSearch size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    {availablePages.map((page, index) => {
                      const IconComponent = page.icon;
                      return (
                        <Grid size={{ xs: 12, sm: 4 }} key={index}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                elevation: 4,
                                transform: 'translateY(-2px)',
                                boxShadow: 3
                              }
                            }}
                            onClick={() => window.location.href = page.href}
                          >
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Box 
                                sx={{ 
                                  p: 1, 
                                  borderRadius: 1, 
                                  bgcolor: `${page.color}.light`,
                                  color: `${page.color}.main`,
                                }}
                              >
                                <IconComponent size={24} />
                              </Box>
                              <IconArrowRight size={20} color="textSecondary" />
                            </Box>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" fontWeight="bold" mb={1}>
                                {page.title}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" mb={2}>
                                {page.description}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Chip 
                                label={page.chip} 
                                size="small" 
                                color={page.color as any}
                                variant="outlined"
                              />
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {availablePages.length === 0 && (
                    <Box 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        minHeight: 200
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        No pages found matching "{searchQuery}"
                      </Typography>
                    </Box>
                  )}

                  {/* Coming Soon Section */}
                  <Box mt={4}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Coming Soon
                    </Typography>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50',
                        border: '1px dashed',
                        borderColor: 'grey.300'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" textAlign="center">
                        This workspace is focused on maintenance operations.
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </ProtectedRoute>
  );
}
