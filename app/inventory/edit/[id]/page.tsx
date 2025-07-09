import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import EditInventoryForm from "@/components/inventory/edit-inventory-form"

export default async function EditInventoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Inventory Item</h1>
        <p className="text-muted-foreground">Update inventory item details</p>
      </div>

      <EditInventoryForm itemId={params.id} />
    </div>
  )
}
