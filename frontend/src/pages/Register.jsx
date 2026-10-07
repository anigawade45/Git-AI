import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import RegisterForm from '@/components/auth/RegisterForm';
import { useMeta } from '@/hooks/useMeta';
import { useAuth } from '@/context/AuthContext';
import PageLoader from '@/components/common/PageLoader';

export default function Register() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useMeta({
    title: 'Create Account | GitHub Knowledge Assistant',
    description: 'Create a new GitHub Knowledge Assistant account.',
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
            title="Create an Account"
            description="Start analyzing and chatting with your repositories"
          />
          <RegisterForm />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

