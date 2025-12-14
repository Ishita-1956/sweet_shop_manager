"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Login successful!",
        description: "Welcome back to Sweet Shop Manager.",
      })

      window.location.href = "/dashboard"
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-yellow-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Blurred Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s', animationDuration: '9s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-44 h-44 bg-orange-200 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s', animationDuration: '11s' }}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s', animationDuration: '7s' }}></div>

        {/* Candy Icons with Text Shadow for Better Visibility */}
        <div className="absolute top-10 left-20 text-6xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '0s', animationDuration: '12s' }}>🍭</div>
        <div className="absolute top-1/4 right-32 text-5xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '1s', animationDuration: '10s' }}>🍬</div>
        <div className="absolute bottom-1/4 left-16 text-7xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '2s', animationDuration: '11s' }}>🍫</div>
        <div className="absolute top-1/2 right-20 text-6xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '3s', animationDuration: '9s' }}>🧁</div>
        <div className="absolute bottom-32 right-1/4 text-5xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '4s', animationDuration: '13s' }}>🍰</div>
        <div className="absolute top-32 left-1/3 text-6xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '1.5s', animationDuration: '10s' }}>🍩</div>
        <div className="absolute bottom-20 left-1/2 text-5xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '2.5s', animationDuration: '11s' }}>🍪</div>
        <div className="absolute top-3/4 left-10 text-6xl opacity-30 animate-float candy-shadow" style={{ animationDelay: '3.5s', animationDuration: '12s' }}>🍮</div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-5xl mb-2">🍭</div>
            <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Sweet Shop Manager</h1>
            <p className="text-muted-foreground text-balance">Manage your sweet shop inventory with ease</p>
          </div>
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="manager@sweetshop.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4 text-yellow-600 hover:text-yellow-700 font-semibold"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) translateX(20px) rotate(5deg);
          }
          66% {
            transform: translateY(20px) translateX(-20px) rotate(-5deg);
          }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .candy-shadow {
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }
      `}</style>
    </div>
  )
}