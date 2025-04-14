"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  const handleEnter = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Team Builder</h1>
          <p className="mt-2 text-slate-300">Rate players and build the perfect team</p>
        </div>
        <div className="text-center">
          <Button 
            onClick={handleEnter}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            Enter Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
