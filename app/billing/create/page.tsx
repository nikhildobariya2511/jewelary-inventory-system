import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import CreateBillForm from "@/components/billing/create-bill-form"

export default async function CreateBillPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Bill</h1>
        <p className="text-muted-foreground">Generate a new invoice for customer purchase</p>
      </div>

      <CreateBillForm />
    </div>
  )
}
