import { useState } from 'react';
import { useAuth } from '../src/context/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../lib/types';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export function Register({ onNavigate }: RegisterProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('business');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const success = await register(name, email, password, role);
      
      if (success) {
        // Navigation will be handled by App.tsx based on user role
        // No need to reload - context will update automatically
        setLoading(false);
      } else {
        setError('Email already exists. Please use a different email.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/images/kasi-logo.png.jpeg"
              alt="Kasi Konnect"
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-gray-800">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join Kasi Konnect and start connecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">I am a...</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="business" className="text-gray-800">
                    Business Owner
                  </SelectItem>
                  <SelectItem value="freelancer" className="text-gray-800">
                    Freelancer
                  </SelectItem>
                  <SelectItem value="municipal" className="text-gray-800">
                    Municipal Worker
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-400 mt-1"
              />
              <Label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I accept the terms and conditions
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-blue-500 hover:text-blue-600"
              >
                Login here
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
