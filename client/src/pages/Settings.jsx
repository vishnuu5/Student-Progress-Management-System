"use client"

import { useState, useEffect } from "react"
import { Save, Clock, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { settingsApi } from "../services/api"

const Settings = () => {
    const [settings, setSettings] = useState({
        cronExpression: "0 2 * * *",
        cronDescription: "Daily at 2:00 AM",
        emailSettings: {
            smtpHost: "",
            smtpPort: 587,
            smtpUser: "",
            smtpPassword: "",
            fromEmail: "",
        },
        inactivityThreshold: 7,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const data = await settingsApi.get()
            setSettings({
                ...data,
                emailSettings: {
                    smtpHost: "",
                    smtpPort: 587,
                    smtpUser: "",
                    smtpPassword: "",
                    fromEmail: "",
                    ...data.emailSettings, // Spread existing emailSettings if they exist
                },
            })
        } catch (error) {
            toast.error("Failed to fetch settings")
            console.error("Error fetching settings:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await settingsApi.update(settings)
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error("Failed to save settings")
            console.error("Error saving settings:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (path, value) => {
        setSettings((prev) => {
            const newSettings = { ...prev }
            const keys = path.split(".")
            let current = newSettings

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }

            // Handle numeric inputs
            if (path === "inactivityThreshold" || path === "emailSettings.smtpPort") {
                const numValue = value === "" ? "" : Number.parseInt(value)
                current[keys[keys.length - 1]] = isNaN(numValue) ? "" : numValue
            } else {
                current[keys[keys.length - 1]] = value
            }
            return newSettings
        })
    }

    const cronPresets = [
        { expression: "0 2 * * *", description: "Daily at 2:00 AM" },
        { expression: "0 0 * * *", description: "Daily at midnight" },
        { expression: "0 6 * * *", description: "Daily at 6:00 AM" },
        { expression: "0 12 * * *", description: "Daily at noon" },
        { expression: "0 18 * * *", description: "Daily at 6:00 PM" },
        { expression: "0 2 * * 1", description: "Weekly on Monday at 2:00 AM" },
        { expression: "0 2 1 * *", description: "Monthly on 1st at 2:00 AM" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Configure system settings and preferences</p>
            </div>

            {/* Cron Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Data Sync Schedule</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Cron Expression</label>
                        <input
                            type="text"
                            value={settings.cronExpression}
                            onChange={(e) => handleInputChange("cronExpression", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="0 2 * * *"
                        />
                        <p className="text-sm text-muted-foreground mt-1">Current schedule: {settings.cronDescription}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Quick Presets</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cronPresets.map((preset) => (
                                <button
                                    key={preset.expression}
                                    onClick={() => {
                                        handleInputChange("cronExpression", preset.expression)
                                        handleInputChange("cronDescription", preset.description)
                                    }}
                                    className={`p-3 text-left border rounded-md transition-colors ${settings.cronExpression === preset.expression
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:bg-muted"
                                        }`}
                                >
                                    <div className="font-medium">{preset.description}</div>
                                    <div className="text-sm text-muted-foreground">{preset.expression}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Inactivity Threshold (days)</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={settings.inactivityThreshold || ""}
                            onChange={(e) => handleInputChange("inactivityThreshold", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Send reminder emails to students inactive for this many days
                        </p>
                    </div>
                </div>
            </div>

            {/* Email Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Email Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Host</label>
                        <input
                            type="text"
                            value={settings.emailSettings?.smtpHost || ""}
                            onChange={(e) => handleInputChange("emailSettings.smtpHost", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="smtp.gmail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Port</label>
                        <input
                            type="number"
                            value={settings.emailSettings?.smtpPort || ""}
                            onChange={(e) => handleInputChange("emailSettings.smtpPort", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="587"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Username</label>
                        <input
                            type="text"
                            value={settings.emailSettings?.smtpUser || ""}
                            onChange={(e) => handleInputChange("emailSettings.smtpUser", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="your-email@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Password</label>
                        <input
                            type="password"
                            value={settings.emailSettings?.smtpPassword || ""}
                            onChange={(e) => handleInputChange("emailSettings.smtpPassword", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="your-app-password"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">From Email</label>
                        <input
                            type="email"
                            value={settings.emailSettings?.fromEmail || ""}
                            onChange={(e) => handleInputChange("emailSettings.fromEmail", e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="noreply@yourcompany.com"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                </button>
            </div>
        </div>
    )
}

export default Settings
