"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Download, Edit, Trash2, Eye, Search, Mail, MailX, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import StudentModal from "../components/StudentModal"
import ConfirmDialog from "../components/ConfirmDialog"
import { studentsApi } from "../services/api"

const StudentsTable = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [studentToDelete, setStudentToDelete] = useState(null)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const data = await studentsApi.getAll()
            setStudents(data)
        } catch (error) {
            toast.error("Failed to fetch students")
            console.error("Error fetching students:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddStudent = () => {
        setEditingStudent(null)
        setShowModal(true)
    }

    const handleEditStudent = (student) => {
        setEditingStudent(student)
        setShowModal(true)
    }

    const handleDeleteStudent = (student) => {
        setStudentToDelete(student)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        try {
            await studentsApi.delete(studentToDelete._id)
            toast.success("Student deleted successfully")
            fetchStudents()
        } catch (error) {
            toast.error("Failed to delete student")
            console.error("Error deleting student:", error)
        } finally {
            setShowDeleteDialog(false)
            setStudentToDelete(null)
        }
    }

    const handleSaveStudent = async (studentData) => {
        try {
            if (editingStudent) {
                await studentsApi.update(editingStudent._id, studentData)
                toast.success("Student updated successfully")
            } else {
                await studentsApi.create(studentData)
                toast.success("Student added successfully")
            }
            fetchStudents()
            setShowModal(false)
        } catch (error) {
            console.error("Error saving student:", error)

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message

                if (errorMessage.includes("E11000") && errorMessage.includes("email")) {
                    toast.error("A student with this email already exists")
                } else if (errorMessage.includes("E11000") && errorMessage.includes("codeforcesHandle")) {
                    toast.error("A student with this Codeforces handle already exists")
                } else {
                    toast.error("Invalid data provided. Please check all fields.")
                }
            } else {
                toast.error(editingStudent ? "Failed to update student" : "Failed to add student")
            }
        }
    }

    const handleDownloadCSV = async () => {
        try {
            const response = await fetch("/api/students/export/csv")
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "students.csv"
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("CSV downloaded successfully")
        } catch (error) {
            toast.error("Failed to download CSV")
            console.error("Error downloading CSV:", error)
        }
    }

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Students</h1>
                    <p className="text-muted-foreground">Manage student profiles and track their Codeforces progress</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleDownloadCSV}
                        className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download CSV</span>
                    </button>

                    <button
                        onClick={handleAddStudent}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-responsive">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">CF Handle</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                                    Current Rating
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                                    Max Rating
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                                    Last Update
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                                    Reminders
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{student.name}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{student.email}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                                        {student.phoneNumber}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        <a
                                            href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {student.codeforcesHandle}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {student.currentRating || "Unrated"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {student.maxRating || "Unrated"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                                        {formatDate(student.lastDataUpdate)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                                        <div className="flex items-center space-x-1">
                                            {student.emailRemindersEnabled ? (
                                                <Mail className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <MailX className="h-4 w-4 text-red-500" />
                                            )}
                                            <span>{student.emailRemindersCount || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/student/${student._id}`}
                                                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>

                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                                title="Edit Student"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteStudent(student)}
                                                className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            {searchTerm ? "No students found matching your search." : "No students added yet."}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <StudentModal student={editingStudent} onSave={handleSaveStudent} onClose={() => setShowModal(false)} />
            )}

            {showDeleteDialog && (
                <ConfirmDialog
                    title="Delete Student"
                    message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </div>
    )
}

export default StudentsTable
