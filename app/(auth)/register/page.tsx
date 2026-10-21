import { redirect } from 'next/navigation'

// Los registros nuevos van todos a Calificar Fidelización.
// Los clientes que ya tienen cuenta siguen entrando por /login.
export default function RegisterPage() {
  redirect('/fidelizacion/onboarding')
}
