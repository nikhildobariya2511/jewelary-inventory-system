import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import EditBillForm from "@/components/billing/edit-bill-form"

export default async function EditBillPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Bill</h1>
        <p className="text-muted-foreground">Modify bill details and items</p>
      </div>

      <EditBillForm billId={params.id} />
    </div>
  )
}
