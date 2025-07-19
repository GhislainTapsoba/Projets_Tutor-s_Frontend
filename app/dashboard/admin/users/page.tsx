"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserForm } from "@/components/forms/user-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth-context"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "agent" | "client"
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    } else if (user && user.role !== "admin") {
      setError("You do not have permission to view this page.")
      setLoading(false)
    }
  }, [token, user])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<User[]>("/users", { token })
      setUsers(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch users.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (formData: Omit<User, "id" | "created_at" | "updated_at"> & { password?: string }) => {
    setIsSubmitting(true)
    try {
      await apiFetch("/users", { method: "POST", body: formData, token })
      toast({
        title: "Success",
        description: "User added successfully.",
      })
      setIsFormOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add user.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async (formData: Omit<User, "id" | "created_at" | "updated_at"> & { password?: string }) => {
    if (!editingUser) return
    setIsSubmitting(true)
    try {
      await apiFetch(`/users/${editingUser.id}`, { method: "PUT", body: formData, token })
      toast({
        title: "Success",
        description: "User updated successfully.",
      })
      setIsFormOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update user.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE", token })
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <Badge variant={user.role === "admin" ? "destructive" : user.role === "agent" ? "secondary" : "default"}>
          {user.role.toUpperCase()}
        </Badge>
      ),
    },
    { key: "created_at", header: "Created At", render: (user: User) => new Date(user.created_at).toLocaleString() },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setEditingUser(user)
              setIsFormOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit user</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete user</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user &quot;{user.name}&quot; and remove
                  their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  if (loading) {
    return <p>Loading users...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditingUser(null)
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Make changes to the user here." : "Fill in the details for a new user."}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              initialData={editingUser || undefined}
              onSubmit={editingUser ? handleEditUser : handleAddUser}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={users} columns={columns} emptyMessage="No users found." />
        </CardContent>
      </Card>
    </div>
  )
}
