import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className="border-border/80 bg-card/90 backdrop-blur shadow-2xl overflow-hidden p-6 sm:p-8">
        <CardContent className="p-0">
          <AuthHeader
            title="Reset Password"
            description="Enter your email to receive a password reset link"
          />
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
