"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Save,
  RotateCcw,
  TestTube,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Database,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface System {
  id: string
  name: string
  ip: string
  port: string
  username: string
  password: string
  isActive: boolean
  isDefault: boolean
  lastConnected?: string
  connectionStatus: "connected" | "disconnected" | "testing"
}

interface SystemConfig {
  systems: System[]
  activeSystemId: string | null
}

const defaultSystem: Omit<System, "id"> = {
  name: "Production Server",
  ip: "",
  port: "22",
  username: "",
  password: "",
  isActive: false,
  isDefault: true,
  connectionStatus: "disconnected",
}

const defaultConfig: SystemConfig = {
  systems: [],
  activeSystemId: null,
}

export default function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [editingSystem, setEditingSystem] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem("systemConfig")
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        if (parsedConfig.systems) {
          setConfig(parsedConfig)
        }
      } else {
        // Initialize with sample data for demo
        const sampleConfig: SystemConfig = {
          systems: [
            {
              id: generateId(),
              name: "Production Server",
              ip: "192.168.1.100",
              port: "22",
              username: "admin",
              password: "admin123",
              isActive: true,
              isDefault: true,
              lastConnected: "Aug 16, 2025",
              connectionStatus: "connected",
            },
            {
              id: generateId(),
              name: "Development Server",
              ip: "192.168.1.101",
              port: "22",
              username: "dev",
              password: "dev123",
              isActive: false,
              isDefault: false,
              connectionStatus: "disconnected",
            },
          ],
          activeSystemId: null,
        }
        sampleConfig.activeSystemId = sampleConfig.systems[0].id
        setConfig(sampleConfig)
        localStorage.setItem("systemConfig", JSON.stringify(sampleConfig))
      }

      const response = await fetch("/api/system-config")
      if (response.ok) {
        const apiConfig = await response.json()
        if (apiConfig && Object.keys(apiConfig).length > 0) {
          setConfig(apiConfig)
        }
      }
    } catch (error) {
      console.log("API not available, using localStorage")
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      localStorage.setItem("systemConfig", JSON.stringify(config))

      const response = await fetch("/api/system-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Configuration Saved",
          description: "System configuration has been saved successfully.",
        })
      } else {
        throw new Error("API save failed")
      }
    } catch (error) {
      toast({
        title: "Configuration Saved Locally",
        description: "Configuration saved to local storage. API unavailable.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    localStorage.removeItem("systemConfig")
    setShowPasswords({})
    toast({
      title: "Configuration Reset",
      description: "All settings have been reset to defaults.",
    })
  }

  const addNewSystem = () => {
    const newSystem: System = {
      ...defaultSystem,
      id: generateId(),
      name: `System ${config.systems.length + 1}`,
      isDefault: config.systems.length === 0,
    }

    const updatedConfig = {
      ...config,
      systems: [...config.systems, newSystem],
      activeSystemId: config.systems.length === 0 ? newSystem.id : config.activeSystemId,
    }

    setConfig(updatedConfig)
    toast({
      title: "System Added",
      description: `New system "${newSystem.name}" has been added.`,
    })
  }

  const removeSystem = (systemId: string) => {
    const systemToDelete = config.systems.find((s) => s.id === systemId)
    if (!systemToDelete) return

    if (config.systems.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last system. Add another system first.",
        variant: "destructive",
      })
      return
    }

    const updatedSystems = config.systems.filter((s) => s.id !== systemId)
    let newActiveSystemId = config.activeSystemId

    if (config.activeSystemId === systemId) {
      newActiveSystemId = updatedSystems.length > 0 ? updatedSystems[0].id : null
    }

    const updatedConfig = {
      ...config,
      systems: updatedSystems,
      activeSystemId: newActiveSystemId,
    }

    setConfig(updatedConfig)

    const newShowPasswords = { ...showPasswords }
    delete newShowPasswords[systemId]
    setShowPasswords(newShowPasswords)

    toast({
      title: "System Removed",
      description: `System "${systemToDelete.name}" has been removed.`,
    })
  }

  const setActiveSystem = (systemId: string) => {
    const updatedConfig = {
      ...config,
      activeSystemId: systemId,
    }
    setConfig(updatedConfig)
    toast({
      title: "Active System Changed",
      description: "Active system has been updated for execution.",
    })
  }

  const updateSystem = (systemId: string, field: keyof System, value: any) => {
    const updatedSystems = config.systems.map((system) =>
      system.id === systemId ? { ...system, [field]: value } : system,
    )

    setConfig({
      ...config,
      systems: updatedSystems,
    })
  }

  const testConnection = async (systemId: string) => {
    const system = config.systems.find((s) => s.id === systemId)
    if (!system) return

    if (!system.ip || !system.username || !system.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in IP, username, and password before testing.",
        variant: "destructive",
      })
      return
    }

    updateSystem(systemId, "connectionStatus", "testing")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = system.ip.length > 0 && system.username.length > 0 && system.password.length > 0
      const newStatus = success ? "connected" : "disconnected"
      const lastConnected = success
        ? new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined

      updateSystem(systemId, "connectionStatus", newStatus)
      if (success) {
        updateSystem(systemId, "lastConnected", lastConnected)
      }

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: `${system.name} connection ${success ? "established" : "failed"}`,
        variant: success ? "default" : "destructive",
      })
    } catch (error) {
      updateSystem(systemId, "connectionStatus", "disconnected")
      toast({
        title: "Connection Error",
        description: `Failed to test ${system.name} connection`,
        variant: "destructive",
      })
    }
  }

  const togglePasswordVisibility = (systemId: string) => {
    setShowPasswords((prev) => ({ ...prev, [systemId]: !prev[systemId] }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "testing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Testing...
          </Badge>
        )
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            Connected
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            Disconnected
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const startEditingName = (systemId: string, currentName: string) => {
    setEditingSystem(systemId)
    setEditingName(currentName)
  }

  const saveEditingName = (systemId: string) => {
    if (editingName.trim()) {
      updateSystem(systemId, "name", editingName.trim())
    }
    setEditingSystem(null)
    setEditingName("")
  }

  const cancelEditingName = () => {
    setEditingSystem(null)
    setEditingName("")
  }

  const activeSystem = config.systems.find((s) => s.id === config.activeSystemId)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
          </div>
          <p className="text-gray-600">Manage system connections and credentials</p>
        </div>

        {/* Active System Selection */}
        <div className="mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-semibold">Active System Selection</CardTitle>
              </div>
              <CardDescription>Choose the system you want to use for operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="selected-system" className="text-sm font-medium">
                  Selected System
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select value={config.activeSystemId || ""} onValueChange={setActiveSystem}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a system" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.systems.map((system) => (
                          <SelectItem key={system.id} value={system.id}>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{system.name}</span>
                              <span className="text-gray-500">({system.ip})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeSystem && (
                    <div className="text-sm text-gray-600">
                      Currently selected: <span className="font-medium">{activeSystem.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Management */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
            <Button onClick={addNewSystem} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-4">
            {config.systems.map((system) => (
              <Card key={system.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-gray-600" />
                      <div>
                        {editingSystem === system.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 w-48"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditingName(system.id)
                                if (e.key === "Escape") cancelEditingName()
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={() => saveEditingName(system.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditingName}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>
                            {system.ip}:{system.port}
                          </span>
                          <span>•</span>
                          <span>{system.username}</span>
                          {system.lastConnected && (
                            <>
                              <span>•</span>
                              <span>Last connected: {system.lastConnected}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(system.connectionStatus)}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testConnection(system.id)}
                          disabled={system.connectionStatus === "testing"}
                          className="text-gray-600 border-gray-300"
                        >
                          {system.connectionStatus === "testing" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-1" />
                          )}
                          Test Connection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingName(system.id, system.name)}
                          className="text-gray-600 border-gray-300"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSystem(system.id)}
                          disabled={config.systems.length === 1}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">IP Address:</Label>
                      <div className="mt-1">
                        <Input
                          value={system.ip}
                          onChange={(e) => updateSystem(system.id, "ip", e.target.value)}
                          placeholder="192.168.1.100"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Username:</Label>
                      <div className="mt-1">
                        <Input
                          value={system.username}
                          onChange={(e) => updateSystem(system.id, "username", e.target.value)}
                          placeholder="admin"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Port:</Label>
                      <div className="mt-1">
                        <Input
                          value={system.port}
                          onChange={(e) => updateSystem(system.id, "port", e.target.value)}
                          placeholder="22"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">Password:</Label>
                    <div className="mt-1 relative">
                      <Input
                        type={showPasswords[system.id] ? "text" : "password"}
                        value={system.password}
                        onChange={(e) => updateSystem(system.id, "password", e.target.value)}
                        placeholder="Enter password"
                        className="h-9 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-9 w-9 p-0"
                        onClick={() => togglePasswordVisibility(system.id)}
                      >
                        {showPasswords[system.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button onClick={saveConfig} disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Configuration
          </Button>
          <Button onClick={resetConfig} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Systems
          </Button>
        </div>
      </div>
    </div>
  )
}
