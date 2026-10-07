import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';

import PasswordInput from './PasswordInput';
import SocialLogin from './SocialLogin';
import AuthFooter from './AuthFooter';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------
  // Handle input changes
  // --------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error while typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear server error when user edits form
    if (serverError) {
      setServerError('');
    }
  };

  // --------------------------------
  // Validation
  // --------------------------------
  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();

    // Full Name
    if (!name) {
      newErrors.name = 'Full name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password =
        'Password must be at least 8 characters';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        'Please confirm your password';
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match';
    }

    // Terms
    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------
  // Submit
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      const msg = 'Account created successfully! Redirecting to login...';
      setSuccessMessage(msg);
      toast.success(msg);

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Account created successfully. Please sign in to continue.' },
        });
      }, 1000);
    } catch (err) {
      const errMsg = err.message || 'Could not create account. Please try again.';
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />

          <div>
            <AlertTitle>Registration Failed</AlertTitle>

            <AlertDescription>
              {serverError}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />

          <div>
            <AlertTitle>Account Created</AlertTitle>

            <AlertDescription>
              {successMessage}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name
          </Label>

          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? 'name-error' : undefined
            }
            className={
              errors.name
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />

          {errors.name && (
            <p
              id="name-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? 'email-error' : undefined
            }
            className={
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />

          {errors.email && (
            <p
              id="email-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password
          </Label>

          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'password-error' : undefined
            }
            className={
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />

          {errors.password && (
            <p
              id="password-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? 'confirm-password-error'
                : undefined
            }
            className={
              errors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }
          />

          {errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Agree Terms */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start space-x-2">

            <Checkbox
              id="agreeTerms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  agreeTerms: checked === true,
                }));

                if (errors.agreeTerms) {
                  setErrors((prev) => ({
                    ...prev,
                    agreeTerms: '',
                  }));
                }
              }}
              disabled={isLoading}
              className="mt-0.5"
              aria-invalid={!!errors.agreeTerms}
              aria-describedby={
                errors.agreeTerms
                  ? 'agree-terms-error'
                  : undefined
              }
            />

            <Label
              htmlFor="agreeTerms"
              className="cursor-pointer text-xs font-normal leading-snug text-muted-foreground"
            >
              I agree to the{' '}

              <Link
                to="/terms"
                className="font-medium text-primary hover:underline"
              >
                Terms of Service
              </Link>

              {' '}and{' '}

              <Link
                to="/privacy"
                className="font-medium text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          {errors.agreeTerms && (
            <p
              id="agree-terms-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.agreeTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-11 w-full gap-2 text-sm font-semibold shadow-md transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <SocialLogin />

      <AuthFooter
        promptText="Already have an account?"
        linkText="Sign in"
        linkTo="/login"
      />
    </div>
  );
}