import { useState } from 'react';
import { useAuth } from '../src/context/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Loader2, Info } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        // Navigation will be handled by App.tsx based on user role
        // No need to reload - context will update automatically
        setLoading(false);
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'thabo@techsolutions.co.za', role: 'Business Owner', name: 'Thabo Mokoena' },
    { email: 'nomsa@craftcorner.co.za', role: 'Business Owner', name: 'Nomsa Dlamini' },
    { email: 'lerato@freelance.co.za', role: 'Freelancer', name: 'Lerato Khumalo' },
    { email: 'mandla.dev@gmail.com', role: 'Freelancer', name: 'Mandla Mthembu' },
    { email: 'david@tshwane.gov.za', role: 'Municipal', name: 'David van der Merwe' },
  ];

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setShowDemoLogins(false);
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
          <CardTitle className="text-2xl text-gray-800">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Login to access your Kasi Konnect account
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-400"
              />
              <Label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
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
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-blue-500 hover:text-blue-600"
              >
                Register here
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600"
              >
                <Info className="w-4 h-4" />
                {showDemoLogins ? 'Hide' : 'Show'} Demo Login Credentials
              </button>
            </div>
          </form>

          {showDemoLogins && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm text-gray-800 mb-3">Quick Demo Logins</h4>
              <p className="text-xs text-gray-600 mb-3">Click any account to auto-fill (password: "password")</p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoLogin(account.email)}
                    className="w-full text-left p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-800">{account.name}</div>
                        <div className="text-xs text-gray-500">{account.email}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {account.role}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                💡 Any password works for demo accounts
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
