'use client';

import Logo from '@/app/(DashboardLayout)/layout/shared/logo/Logo';
import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/app/context/AuthContext';
import { supabaseForPasswordReset } from '@/lib/supabaseClient';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const { resetPasswordWithToken } = useAuth();
  const router = useRouter();

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate the reset token on mount (only on client)
  useEffect(() => {
    if (!mounted) return;

    const validateToken = async () => {
      try {
        // Only access window after component is mounted (client-side only)
        if (typeof window === 'undefined') {
          console.log('Window not available, skipping validation');
          return;
        }
        
        // Log full URL for debugging
        const fullUrl = window.location.href;
        const hash = window.location.hash;
        const search = window.location.search;
        const pathname = window.location.pathname;
        
        console.log('=== Password Reset Token Validation ===');
        console.log('Full URL:', fullUrl);
        console.log('Pathname:', pathname);
        console.log('Hash:', hash || '(empty)');
        console.log('Search params:', search || '(empty)');
        
        // With detectSessionInUrl: true, Supabase will automatically process the token from URL hash
        // when we call getSession(). Let's check for the token manually first for better logging
        let hasTokenInUrl = false;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          if (accessToken && type === 'recovery') {
            hasTokenInUrl = true;
            console.log('✅ Found recovery token in URL hash');
          }
        }
        // 
        
        if (!hasTokenInUrl && search) {
          const searchParams = new URLSearchParams(search);
          const token = searchParams.get('token');
          if (token) {
            console.log('Found token parameter in query string (not hash)');
            console.log('⚠️ This might indicate Supabase redirect format issue');
          }
        }
        
        if (!hasTokenInUrl) {
          console.log('⚠️ No token found in URL hash');
          console.log('⚠️ Supabase should redirect with token in hash like: #access_token=...&type=recovery');
          console.log('⚠️ If hash is empty, check Supabase redirect URL configuration');
        }
        
        // Check if we have a valid session
        // With detectSessionInUrl: true, this will automatically process token from URL hash
        const { data: { session }, error: sessionError } = await supabaseForPasswordReset.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          console.error('Session error details:', JSON.stringify(sessionError, null, 2));
          setError(sessionError.message || 'Invalid or expired reset link. Please request a new password reset.');
          setValidating(false);
          return;
        }
        
        if (!session) {
          console.error('No session found after validation');
          console.log('');
          console.log('🔍 DIAGNOSIS:');
          console.log('The reset link was clicked, but no session was created.');
          console.log('');
          console.log('Most likely causes:');
          console.log('1. ❌ Redirect URL mismatch - Check Supabase Dashboard → Authentication → URL Configuration');
          console.log('   Required: "http://localhost:3000/auth/reset-password" (must match exactly)');
          console.log('2. ❌ Token expired - Request a new password reset');
          console.log('3. ❌ Token already used - Each reset link can only be used once');
          console.log('4. ❌ Supabase configuration issue - Check Site URL matches your domain');
          console.log('');
          console.log('📋 ACTION REQUIRED:');
          console.log('1. Go to Supabase Dashboard → Authentication → URL Configuration');
          console.log('2. Add to Redirect URLs: http://localhost:3000/auth/reset-password');
          console.log('3. Make sure Site URL is: http://localhost:3000');
          console.log('4. Save and request a NEW password reset');
          setError('Invalid or expired reset link. Please check Supabase configuration and request a new password reset.');
          setValidating(false);
          return;
        }

        // Verify this is actually a recovery session (user should be able to update password)
        console.log('✅ Token validated successfully! User can reset password');
        console.log('Session user:', session.user?.email);
        console.log('Session expires at:', new Date(session.expires_at! * 1000).toLocaleString());
        
        // Token is valid, user can reset password
        setValidating(false);
      } catch (err: any) {
        console.error('Error validating token:', err);
        console.error('Error stack:', err.stack);
        setError(err.message || 'Invalid or expired reset link. Please request a new password reset.');
        setValidating(false);
      }
    };

    validateToken();
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken(password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state until component is mounted (prevents hydration mismatch)
  if (!mounted || validating) {
    return (
      <PageContainer title="Reset Password" description="Reset your password">
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{
              xs: 12,
              sm: 12,
              lg: 5,
              xl: 4
            }}>
            <Box p={4} textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {!mounted ? 'Loading...' : 'Validating reset link...'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Reset Password" description="Reset your password">
      <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}>
          <Box position="relative">
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 75px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <Image
                src="/images/backgrounds/login-bg.svg"
                alt="bg" width={500} height={500}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '500px',
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size={{
            xs: 12,
            sm: 12,
            lg: 5,
            xl: 4
          }}>
          <Box p={4}>
            <Typography variant="h3" fontWeight="700" mb={1}>
              Reset Password
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mb={3}>
              Enter your new password below.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset successfully! Redirecting to login...
              </Alert>
            )}

            {!success ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size="large"
                  component={Link}
                  href="/auth/login"
                  sx={{ py: 1.5 }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                component={Link}
                href="/auth/login"
                sx={{ py: 1.5 }}
              >
                Go to Login
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

