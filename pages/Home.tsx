import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, Users, Briefcase, TrendingUp, Shield, Zap } from 'lucide-react';


interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1646502407568-5a58572c5b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQcmV0b3JpYSUyMFVuaW9uJTIwQnVpbGRpbmdzfGVufDF8fHx8MTc2MDYwNDg1NHww&ixlib=rb-4.1.0&q=80&w=1080)',
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <img
              src="/images/kasi-logo.png.jpeg"
              alt="Kasi Konnect"
              className="h-32 w-auto drop-shadow-2xl"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl text-gray-800 mb-6">
            Connect. Collaborate. Grow.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Empowering Tshwane's business ecosystem
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate('register')}
              size="lg"
              className="bg-blue-400 hover:bg-blue-500 text-white text-lg px-8 py-6"
            >
              Get Started
            </Button>
            <Button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              variant="outline"
              className="border-blue-300 text-blue-500 hover:bg-blue-50 text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-4">
              Platform Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to grow your business, find talent, or discover opportunities in Tshwane
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Business Funding */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-gray-800">Business Funding</CardTitle>
                <CardDescription className="text-gray-600">
                  Access municipal funding opportunities to grow your business. Submit requests, track approvals, and receive funding support.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Find Talent */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-gray-800">Find Talent</CardTitle>
                <CardDescription className="text-gray-600">
                  Connect with skilled freelancers in your area. Post jobs, review applications, and hire the best talent for your projects.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Work Opportunities */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-gray-800">Work Opportunities</CardTitle>
                <CardDescription className="text-gray-600">
                  Discover freelance jobs and build your portfolio. Apply for projects, showcase your skills, and earn income.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1653505914751-93e8ac1123be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUc2h3YW5lJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2MDYwNDg1NHww&ixlib=rb-4.1.0&q=80&w=1080)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-6">
              About Kasi Konnect
            </h2>
            <p className="text-gray-600 text-lg">
              Kasi Konnect is a comprehensive business platform for the City of Tshwane that connects 
              business owners, freelancers, and municipal workers in a unified ecosystem. We facilitate 
              business funding, freelance work opportunities, job postings, payments, and community collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">500+</h3>
              <p className="text-gray-600">Businesses Funded</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">1,000+</h3>
              <p className="text-gray-600">Active Freelancers</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">2,500+</h3>
              <p className="text-gray-600">Jobs Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-4">
              Why Choose Kasi Konnect?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-500 mb-4" />
                <CardTitle className="text-gray-800">Secure & Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All users are verified, ensuring trust and credibility across the platform. 
                  Secure payment processing protects your transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-10 h-10 text-blue-500 mb-4" />
                <CardTitle className="text-gray-800">Fast & Efficient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Streamlined processes for funding approvals, job postings, and payments. 
                  Get connected with opportunities quickly and efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-400 to-indigo-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-blue-50 text-lg mb-8">
            Join hundreds of businesses and freelancers already thriving on Kasi Konnect
          </p>
          <Button
            onClick={() => onNavigate('register')}
            size="lg"
            className="bg-white text-blue-500 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
}
