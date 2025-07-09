import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import BillHistory from "@/components/billing/bill-history"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage customer bills and invoices</p>
        </div>
        <Link href="/billing/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        </Link>
      </div>

      <BillHistory />
    </div>
  )
}
