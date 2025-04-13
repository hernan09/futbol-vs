import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"
import { getSession } from "@/lib/auth"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Team Builder</h1>
          <p className="mt-2 text-slate-300">Rate players and build the perfect team</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
