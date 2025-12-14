"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, TrendingUp, Users, Package, Menu, X, Mail, Phone, MapPin, Send } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    setFormStatus('loading')
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('subject', formData.subject)
    data.append('message', formData.message)
    
    try {
      const response = await fetch('https://formspree.io/f/mzznwzlk', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setFormStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setFormStatus('idle'), 5000)
      } else {
        setFormStatus('error')
      }
    } catch (error) {
      setFormStatus('error')
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Sweets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '9s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-44 h-44 bg-orange-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s', animationDuration: '11s' }}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s', animationDuration: '7s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b bg-white/80 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                🍭 Sweet Shop
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium hover:text-yellow-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium hover:text-yellow-600 transition-colors">Benefits</button>
              <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-yellow-600 transition-colors">Contact</button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth/login'}>Sign In</Button>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" onClick={() => window.location.href = '/auth/sign-up'}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-sm font-medium hover:text-yellow-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-sm font-medium hover:text-yellow-600 transition-colors">Benefits</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-sm font-medium hover:text-yellow-600 transition-colors">Contact</button>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/auth/login'}>Sign In</Button>
                <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" onClick={() => window.location.href = '/auth/sign-up'}>
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-yellow-100 rounded-full text-sm font-medium text-yellow-800">
            ✨ Modern Inventory Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent animate-fade-in">
            Sweet Shop Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
            Manage your sweet shop inventory, track sales, and delight your customers with our modern management system.
            Built for bakeries, candy stores, and confectioneries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all" onClick={() => window.location.href = '/auth/sign-up'}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="hover:border-yellow-500 hover:text-yellow-600 transition-all" onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 scroll-mt-20">
          <Card className="border-2 hover:border-yellow-400 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track stock levels, manage products, and get low stock alerts in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-yellow-400 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Order Processing</CardTitle>
              <CardDescription>
                Process customer orders quickly and efficiently with automated stock updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-yellow-400 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Monitor your daily sales, revenue trends, and top-selling products.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-yellow-400 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage team roles with admin and user access levels for security.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div id="benefits" className="mt-24 max-w-4xl mx-auto scroll-mt-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-balance">
            Everything you need to run your sweet shop
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools you need to streamline operations and grow your business.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                <span className="text-black font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Real-time Stock Updates</h3>
                <p className="text-muted-foreground text-sm">
                  Know exactly what's in stock with automatic updates after every purchase.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                <span className="text-black font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Category Organization</h3>
                <p className="text-muted-foreground text-sm">
                  Organize sweets by Chocolates, Pastries, Candies, and Vegan options.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                <span className="text-black font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Low Stock Alerts</h3>
                <p className="text-muted-foreground text-sm">
                  Get notified when products are running low so you never miss a sale.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                <span className="text-black font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure Access Control</h3>
                <p className="text-muted-foreground text-sm">
                  Role-based permissions ensure only authorized staff can manage inventory.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="mt-24 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-2 hover:border-yellow-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Email Us</CardTitle>
                        <CardDescription>ishita072004@gmail.com</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-yellow-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Call Us</CardTitle>
                        <CardDescription>+91 7015610516</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-yellow-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Visit Us</CardTitle>
                        <CardDescription>Chandigarh University , Gharuan</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Input 
                        type="text" 
                        name="name" 
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input 
                        type="email" 
                        name="email" 
                        placeholder="Your Email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input 
                        type="text" 
                        name="subject" 
                        placeholder="Subject" 
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Textarea 
                        name="message" 
                        placeholder="Your Message" 
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full resize-none"
                      />
                    </div>
                    {formStatus === 'success' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                        Message sent successfully! We'll get back to you soon.
                      </div>
                    )}
                    {formStatus === 'error' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                        Failed to send message. Please try again.
                      </div>
                    )}
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      disabled={formStatus === 'loading'}
                    >
                      {formStatus === 'loading' ? 'Sending...' : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to sweeten your business?</CardTitle>
              <CardDescription className="text-base">
                Join hundreds of sweet shop owners who trust our platform to manage their inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all" onClick={() => window.location.href = '/auth/sign-up'}>
                Start Managing Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Sweet Shop Manager. Built with Love.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-20px);
          }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  )
}