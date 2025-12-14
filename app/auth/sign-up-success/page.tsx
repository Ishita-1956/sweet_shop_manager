"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function SignUpSuccessPage() {
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

      <div className="w-full max-w-md relative z-10">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation email. Please check your inbox and click the link to verify your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-muted-foreground text-center">
                After confirming your email, you can log in to access the dashboard.
              </p>
            </div>
            <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
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