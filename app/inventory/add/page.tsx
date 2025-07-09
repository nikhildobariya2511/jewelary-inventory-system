import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import AddInventoryForm from "@/components/inventory/add-inventory-form"

export default async function AddInventoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Item</h1>
        <p className="text-muted-foreground">Add a new jewelry item to your inventory</p>
      </div>

      <AddInventoryForm />
    </div>
  )
}
