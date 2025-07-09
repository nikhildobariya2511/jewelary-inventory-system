"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, Save, RefreshCw, TrendingUp, Settings, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface ShopSettings {
  name: string
  address: string
  phone: string
  gst: string
  logo?: string
}

interface TaxSettings {
  igst: number
  cgst: number
  sgst: number
}

interface RateSettings {
  goldRate: number
  silverRate: number
  lastUpdated: string
  autoUpdate: boolean
  updateInterval: number // in minutes
}

export default function SettingsForm() {
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    name: "",
    address: "",
    phone: "",
    gst: "",
  })
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    igst: 3.0,
    cgst: 1.5,
    sgst: 1.5,
  })
  const [rateSettings, setRateSettings] = useState<RateSettings>({
    goldRate: 0,
    silverRate: 0,
    lastUpdated: "",
    autoUpdate: false,
    updateInterval: 30,
  })
  const [loading, setLoading] = useState(false)
  const [fetchingRates, setFetchingRates] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setShopSettings(data.settings.shop || shopSettings)
          setTaxSettings(data.settings.tax || taxSettings)
          setRateSettings(data.settings.rates || rateSettings)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const fetchLiveRates = async () => {
    setFetchingRates(true)
    try {
      const response = await fetch("/api/metal-rates")
      if (response.ok) {
        const data = await response.json()
        if (data.rates) {
          setRateSettings((prev) => ({
            ...prev,
            goldRate: data.rates.goldRate,
            silverRate: data.rates.silverRate,
            lastUpdated: new Date().toISOString(),
          }))
          toast({
            title: "Success",
            description: "Live metal rates fetched successfully",
          })
        }
      } else {
        throw new Error("Failed to fetch live rates")
      }
    } catch (error) {
      console.error("Error fetching live rates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch live rates. Using manual rates.",
        variant: "destructive",
      })
    } finally {
      setFetchingRates(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setShopSettings({ ...shopSettings, logo: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop: shopSettings,
          tax: taxSettings,
          rates: {
            ...rateSettings,
            lastUpdated: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 luxury-nav">
          <TabsTrigger value="shop" className="luxury-nav-item">
            Shop Details
          </TabsTrigger>
          <TabsTrigger value="tax" className="luxury-nav-item">
            Tax Settings
          </TabsTrigger>
          <TabsTrigger value="rates" className="luxury-nav-item">
            Metal Rates
          </TabsTrigger>
          <TabsTrigger value="categories" className="luxury-nav-item">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <Card className="luxury-card">
            <CardHeader className="luxury-card-header">
              <CardTitle className="text-secondary-800">Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName" className="text-secondary-700 font-medium">
                    Shop Name *
                  </Label>
                  <Input
                    id="shopName"
                    value={shopSettings.name}
                    onChange={(e) => setShopSettings({ ...shopSettings, name: e.target.value })}
                    placeholder="Enter shop name"
                    className="luxury-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst" className="text-secondary-700 font-medium">
                    GST Number *
                  </Label>
                  <Input
                    id="gst"
                    value={shopSettings.gst}
                    onChange={(e) => setShopSettings({ ...shopSettings, gst: e.target.value })}
                    placeholder="Enter GST number"
                    className="luxury-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-secondary-700 font-medium">
                  Phone Numbers *
                </Label>
                <Input
                  id="phone"
                  value={shopSettings.phone}
                  onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                  placeholder="Enter phone numbers (e.g., 9099315455 | 7359631655)"
                  className="luxury-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-secondary-700 font-medium">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={shopSettings.address}
                  onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                  placeholder="Enter complete address"
                  rows={3}
                  className="luxury-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-secondary-700 font-medium">
                  Shop Logo
                </Label>
                <div className="flex items-center space-x-4">
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="luxury-button-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  {shopSettings.logo && (
                    <div className="w-16 h-16 border rounded-lg overflow-hidden shadow-md">
                      <img
                        src={shopSettings.logo || "/placeholder.svg"}
                        alt="Shop Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="luxury-card">
            <CardHeader className="luxury-card-header">
              <CardTitle className="text-secondary-800">Tax Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="igst" className="text-secondary-700 font-medium">
                    IGST Rate (%)
                  </Label>
                  <Input
                    id="igst"
                    type="number"
                    step="0.1"
                    value={taxSettings.igst}
                    onChange={(e) => setTaxSettings({ ...taxSettings, igst: Number.parseFloat(e.target.value) || 0 })}
                    className="luxury-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgst" className="text-secondary-700 font-medium">
                    CGST Rate (%)
                  </Label>
                  <Input
                    id="cgst"
                    type="number"
                    step="0.1"
                    value={taxSettings.cgst}
                    onChange={(e) => setTaxSettings({ ...taxSettings, cgst: Number.parseFloat(e.target.value) || 0 })}
                    className="luxury-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sgst" className="text-secondary-700 font-medium">
                    SGST Rate (%)
                  </Label>
                  <Input
                    id="sgst"
                    type="number"
                    step="0.1"
                    value={taxSettings.sgst}
                    onChange={(e) => setTaxSettings({ ...taxSettings, sgst: Number.parseFloat(e.target.value) || 0 })}
                    className="luxury-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <div className="space-y-6">
            {/* Live Rate Fetching */}
      

            {/* Manual Rate Setting */}
            <Card className="luxury-card">
              <CardHeader className="luxury-card-header">
                <CardTitle className="text-secondary-800">Manual Rate Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🥇</span>
                        <div>
                          <h3 className="font-semibold text-primary-800">Gold Rate</h3>
                          <p className="text-sm text-primary-600">24K Pure Gold per gram</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goldRate" className="text-primary-700 font-medium">
                          Rate (₹ per gram)
                        </Label>
                        <Input
                          id="goldRate"
                          type="number"
                          step="0.01"
                          value={rateSettings.goldRate}
                          onChange={(e) =>
                            setRateSettings({ ...rateSettings, goldRate: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="luxury-input text-lg font-semibold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-lg border border-secondary-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🥈</span>
                        <div>
                          <h3 className="font-semibold text-secondary-800">Silver Rate</h3>
                          <p className="text-sm text-secondary-600">999 Pure Silver per gram</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="silverRate" className="text-secondary-700 font-medium">
                          Rate (₹ per gram)
                        </Label>
                        <Input
                          id="silverRate"
                          type="number"
                          step="0.01"
                          value={rateSettings.silverRate}
                          onChange={(e) =>
                            setRateSettings({ ...rateSettings, silverRate: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="luxury-input text-lg font-semibold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {rateSettings.lastUpdated && (
                  <div className="p-3 bg-cream-50 rounded-lg border border-cream-200">
                    <p className="text-sm text-secondary-600 text-center">
                      <strong>Last updated:</strong> {new Date(rateSettings.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="luxury-card">
            <CardHeader className="luxury-card-header">
              <CardTitle className="text-secondary-800">Category Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-secondary-600 mb-4">Manage jewelry categories and types</p>
                <Link href="/settings/categories">
                  <Button className="luxury-button-primary">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Categories & Types
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={saveSettings} disabled={loading} className="luxury-button-primary shadow-lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
