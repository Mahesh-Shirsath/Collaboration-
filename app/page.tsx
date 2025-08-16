"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Code, Cog, Database, GitBranch, Layers, Play, Settings, Zap, Server, Shield, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Framework Solution Platform</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your development workflow with automated framework execution, code generation, and Jenkins
            integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* JTAF Framework */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-6 w-6 text-blue-600" />
                  <CardTitle>JTAF Framework</CardTitle>
                </div>
                <Badge variant="secondary">Framework</Badge>
              </div>
              <CardDescription>
                Java Test Automation Framework with parameter configuration and execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Play className="h-4 w-4 mr-2" />
                  Execute test suites with custom parameters
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Jenkins pipeline integration
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="h-4 w-4 mr-2" />
                  Build tracking and logging
                </div>
                <Link href="/frameworks/jtaf">
                  <Button className="w-full mt-4">
                    <Cog className="h-4 w-4 mr-2" />
                    Configure & Execute
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Floating Framework */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-green-600" />
                  <CardTitle>Floating Framework</CardTitle>
                </div>
                <Badge variant="secondary">Framework</Badge>
              </div>
              <CardDescription>Lightweight framework for rapid development and deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Play className="h-4 w-4 mr-2" />
                  Quick setup and execution
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Automated build pipeline
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="h-4 w-4 mr-2" />
                  Real-time monitoring
                </div>
                <Link href="/frameworks/floating">
                  <Button className="w-full mt-4">
                    <Cog className="h-4 w-4 mr-2" />
                    Configure & Execute
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* OS Making */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-6 w-6 text-purple-600" />
                  <CardTitle>OS Making</CardTitle>
                </div>
                <Badge variant="secondary">Pipeline</Badge>
              </div>
              <CardDescription>Operating system build and deployment pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Play className="h-4 w-4 mr-2" />
                  Automated OS build process
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Jenkins pipeline execution
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="h-4 w-4 mr-2" />
                  Build artifact management
                </div>
                <Link href="/os-making">
                  <Button className="w-full mt-4">
                    <Cog className="h-4 w-4 mr-2" />
                    Start Build Process
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Code Generation */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-6 w-6 text-orange-600" />
                  <CardTitle>Code Generation</CardTitle>
                </div>
                <Badge variant="secondary">AI Tool</Badge>
              </div>
              <CardDescription>AI-powered code generation with React-based chatbot interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Code className="h-4 w-4 mr-2" />
                  Generate code snippets
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-2" />
                  Interactive chat interface
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="h-4 w-4 mr-2" />
                  Code history management
                </div>
                <Link href="/code-generation">
                  <Button className="w-full mt-4">
                    <Code className="h-4 w-4 mr-2" />
                    Generate Code
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Tracker */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-6 w-6 text-indigo-600" />
                  <CardTitle>Pipeline Tracker</CardTitle>
                </div>
                <Badge variant="secondary">Monitor</Badge>
              </div>
              <CardDescription>Monitor and track all Jenkins pipeline executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Real-time pipeline status
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="h-4 w-4 mr-2" />
                  Build history and logs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Play className="h-4 w-4 mr-2" />
                  Pipeline management
                </div>
                <Link href="/pipelines">
                  <Button className="w-full mt-4">
                    <GitBranch className="h-4 w-4 mr-2" />
                    View Pipelines
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-red-600" />
                  <CardTitle>System Configuration</CardTitle>
                </div>
                <Badge variant="secondary">Settings</Badge>
              </div>
              <CardDescription>Configure Jenkins, database, and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Server className="h-4 w-4 mr-2" />
                  Jenkins server settings
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Security configuration
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification settings
                </div>
                <Link href="/system-config">
                  <Button className="w-full mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure System
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GitBranch className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Pipelines</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Generated Codes</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successful Builds</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
