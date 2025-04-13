import Link from "next/link"
import { cookies } from "next/headers"
import DashboardTabs from "@/components/dashboard-tabs"

export default async function DashboardPage() {
  // Verificamos la sesión del lado del servidor
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  // Nota: localStorage solo está disponible en el cliente, así que no podemos verificarlo aquí
  const isAuthenticated = !!sessionCookie?.value

  // En un entorno de producción, deberíamos verificar la sesión con Firebase Admin SDK
  // Pero para simplificar, solo verificamos si existe la cookie

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-white">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Acceso no autorizado</h1>
          <p className="mb-6">Debes iniciar sesión para acceder al dashboard.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Team Builder Dashboard</h1>
        <DashboardTabs />
      </div>
    </div>
  )
}
