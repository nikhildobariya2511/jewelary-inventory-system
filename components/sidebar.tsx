"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Receipt, BarChart3, Settings, Gem, Sparkles } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-primary-600" },
  { name: "Inventory", href: "/inventory", icon: Package, color: "text-emerald-600" },
  { name: "Billing", href: "/billing", icon: Receipt, color: "text-diamond-600" },
  { name: "Reports", href: "/reports", icon: BarChart3, color: "text-secondary-600" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-secondary-600" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="luxury-sidebar w-64 h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-cream-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Gem className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-primary-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Jewelry System
            </h1>
            <p className="text-sm text-secondary-500 font-medium">Inventory & Billing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 luxury-scrollbar overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn("luxury-nav-item group", isActive ? "luxury-nav-item-active" : "luxury-nav-item-inactive")}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive ? "bg-white shadow-sm" : "group-hover:bg-white/50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? item.color : "text-secondary-500 group-hover:text-secondary-700",
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium transition-colors duration-200",
                  isActive ? "text-primary-800" : "text-secondary-600 group-hover:text-secondary-800",
                )}
              >
                {item.name}
              </span>
              {isActive && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cream-200">
        <div className="bg-gradient-to-r from-cream-100 to-primary-50 p-3 rounded-lg">
          <p className="text-xs text-secondary-600 text-center font-medium">Powered by Hsquare Solution</p>
        </div>
      </div>
    </div>
  )
}
