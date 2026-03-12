'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Zap, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">Taskora</div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/profile/settings">
                  <Button variant="outline">{user.name}</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Get Tasks Done Locally, Earn Money Today
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Connect with your community. Post tasks or complete nearby tasks and get paid instantly. No commute. No hassle.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2">
                    Start Earning <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/5 border-y border-border/40">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Find Local Tasks',
                description: 'Browse tasks from people near you. See exactly what needs to be done and how much you can earn.'
              },
              {
                icon: CheckCircle2,
                title: 'Complete & Earn',
                description: 'Accept a task, complete the work, and get paid directly. Money goes into your secure wallet.'
              },
              {
                icon: Zap,
                title: 'Instant Payments',
                description: 'Withdraw your earnings anytime. Fast, secure transactions with 24/7 support.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-border bg-background">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Active Users', value: '5,000+' },
              { label: 'Tasks Completed', value: '25,000+' },
              { label: 'Total Earnings', value: '$500K+' },
              { label: 'Average Rating', value: '4.8★' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-secondary/5 border-y border-border/40">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Popular Tasks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Shopping & Delivery', icon: '🛍️' },
              { title: 'Moving & Hauling', icon: '📦' },
              { title: 'Cleaning & Laundry', icon: '🧹' },
              { title: 'Repair & Assembly', icon: '🔧' },
              { title: 'Photography', icon: '📸' },
              { title: 'Tutoring', icon: '📚' },
              { title: 'Pet Care', icon: '🐾' },
              { title: 'Gardening', icon: '🌱' }
            ].map((cat, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-border bg-background text-center hover:shadow-md transition">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-foreground">{cat.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Safe & Secure</h2>
            <p className="text-muted-foreground mb-6">
              Your payments are held in secure escrow until work is confirmed. Verified users. Transparent ratings. Your data is protected with bank-level security.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Verified profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/5 border-t border-border/40">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people earning money on their own schedule.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg">Open Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/5 py-8 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Follow</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Taskora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
