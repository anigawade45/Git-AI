import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth redirect errors & state message
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');

    if (oauthError) {
      setServerError(oauthError);
      toast.error(oauthError);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  // -----------------------------
  // Handle input changes
  // -----------------------------
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

    if (serverError) {
      setServerError('');
    }
  };

  // -----------------------------
  // Validation
  // -----------------------------
  const validate = () => {
    const newErrors = {};

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(
        formData.email.trim(),
        formData.password,
        formData.rememberMe
      );

      const msg = 'Login successful! Redirecting...';
      setSuccessMessage(msg);
      toast.success(msg);

      const from = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      const errMsg = err.message || 'Invalid email or password. Please try again.';
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
            <AlertTitle>Authentication Error</AlertTitle>

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
            <AlertTitle>Welcome Back</AlertTitle>

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password
            </Label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
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

        {/* Remember Me */}
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="rememberMe"
            checked={formData.rememberMe}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                rememberMe: checked === true,
              }))
            }
            disabled={isLoading}
          />

          <Label
            htmlFor="rememberMe"
            className="text-xs font-normal text-muted-foreground cursor-pointer"
          >
            Remember me on this device
          </Label>
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
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <SocialLogin />

      <AuthFooter
        promptText="Don't have an account?"
        linkText="Create an account"
        linkTo="/register"
      />
    </div>
  );
}