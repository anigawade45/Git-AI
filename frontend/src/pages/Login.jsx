import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import { useMeta } from '@/hooks/useMeta';
import { useAuth } from '@/context/AuthContext';
import PageLoader from '@/components/common/PageLoader';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useMeta({
    title: 'Sign In | GitHub Knowledge Assistant',
    description: 'Sign in to your GitHub Knowledge Assistant account.',
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      <Card className="border-border/80 bg-card/90 backdrop-blur shadow-2xl overflow-hidden p-6 sm:p-8">
        <CardContent className="p-0">
          <AuthHeader
            title="Welcome Back"
            description="Sign in to your GitHub Knowledge Assistant account"
          />
          <LoginForm />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

