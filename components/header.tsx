"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Crown, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-cream-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Welcome back, {session?.user?.name || "User"}
              </h2>
            </div>
            <p className="text-sm text-secondary-500 font-medium mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative luxury-button-secondary h-10 w-10 p-0">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full luxury-button-secondary p-0">
                <Avatar className="h-10 w-10 ring-2 ring-primary-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-800 font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 luxury-card" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-primary-600" />
                    <p className="text-sm font-semibold text-secondary-800">{session?.user?.name || "User"}</p>
                  </div>
                  <p className="text-xs text-secondary-500 font-medium">{session?.user?.email || "user@example.com"}</p>
                  <Badge className="luxury-badge-gold w-fit">Premium User</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cream-200" />
              <DropdownMenuItem className="hover:bg-cream-50 focus:bg-cream-50 cursor-pointer">
                <User className="mr-3 h-4 w-4 text-secondary-600" />
                <span className="text-secondary-700">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cream-200" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
