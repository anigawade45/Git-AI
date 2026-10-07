import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Mail,
} from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';

import { authService } from '@/services/authService';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------
  // Handle Email Change
  // --------------------------------
  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    // Clear validation error while typing
    if (error) {
      setError('');
    }
  };

  // --------------------------------
  // Validate Email
  // --------------------------------
  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email address is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // --------------------------------
  // Submit
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(
        email.trim()
      );

      setSuccessMessage(
        res?.message ||
          'Password reset link sent to your email.'
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* --------------------------------
          Error Alert
      -------------------------------- */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />

          <div>
            <AlertTitle>Error</AlertTitle>

            <AlertDescription>
              {error}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* --------------------------------
          Success Alert
      -------------------------------- */}
      {successMessage && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />

          <div>
            <AlertTitle>Email Sent</AlertTitle>

            <AlertDescription>
              {successMessage}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* --------------------------------
          Forgot Password Form
      -------------------------------- */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="reset-email">
            Email Address
          </Label>

          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={
              error ? 'reset-email-error' : undefined
            }
          />

          {error && (
            <p
              id="reset-email-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-11 w-full gap-2 text-sm font-semibold shadow-md transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Send Reset Link</span>
            </>
          )}
        </Button>
      </form>

      {/* --------------------------------
          Back to Login
      -------------------------------- */}
      <div className="pt-2 text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}