"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const StudentModal = ({ student, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        codeforcesHandle: "",
        emailRemindersEnabled: true,
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || "",
                email: student.email || "",
                phoneNumber: student.phoneNumber || "",
                codeforcesHandle: student.codeforcesHandle || "",
                emailRemindersEnabled: student.emailRemindersEnabled !== false,
            })
        }
    }, [student])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required"
        }

        if (!formData.codeforcesHandle.trim()) {
            newErrors.codeforcesHandle = "Codeforces handle is required"
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.codeforcesHandle)) {
            newErrors.codeforcesHandle = "Codeforces handle can only contain letters, numbers, underscores, and hyphens"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm() && !isSubmitting) {
            setIsSubmitting(true)
            try {
                await onSave(formData)
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">{student ? "Edit Student" : "Add Student"}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.name ? "border-destructive" : "border-border"
                                }`}
                            placeholder="Enter student name"
                        />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? "border-destructive" : "border-border"
                                }`}
                            placeholder="Enter email address"
                        />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-1">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.phoneNumber ? "border-destructive" : "border-border"
                                }`}
                            placeholder="Enter phone number"
                        />
                        {errors.phoneNumber && <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>

                    <div>
                        <label htmlFor="codeforcesHandle" className="block text-sm font-medium text-foreground mb-1">
                            Codeforces Handle *
                        </label>
                        <input
                            type="text"
                            id="codeforcesHandle"
                            name="codeforcesHandle"
                            value={formData.codeforcesHandle}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.codeforcesHandle ? "border-destructive" : "border-border"
                                }`}
                            placeholder="Enter Codeforces handle"
                        />
                        {errors.codeforcesHandle && <p className="text-destructive text-sm mt-1">{errors.codeforcesHandle}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="emailRemindersEnabled"
                            name="emailRemindersEnabled"
                            checked={formData.emailRemindersEnabled}
                            onChange={handleChange}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="emailRemindersEnabled" className="text-sm text-foreground">
                            Enable email reminders
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : student ? "Update" : "Add"} Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StudentModal
