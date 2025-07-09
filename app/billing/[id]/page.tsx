import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import BillDetails from "@/components/billing/bill-details"

export default async function BillDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bill Details</h1>
        <p className="text-muted-foreground">View and manage bill information</p>
      </div>

      <BillDetails billId={params.id} />
    </div>
  )
}
