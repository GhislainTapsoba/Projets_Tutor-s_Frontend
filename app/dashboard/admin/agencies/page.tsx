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
import { AgencyForm } from "@/components/forms/agency-form"
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

interface Agency {
  id: number
  name: string
  address: string
  phone: string
  email: string
  description?: string
  created_at: string
  updated_at: string
}

export default function AdminAgenciesPage() {
  const { token, user } = useAuth()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAgencies()
    } else if (user && user.role !== "admin") {
      setError("You do not have permission to view this page.")
      setLoading(false)
    }
  }, [token, user])

  const fetchAgencies = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Agency[]>("/agencies", { token })
      setAgencies(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch agencies.")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch agencies.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAgency = async (formData: Omit<Agency, "id" | "created_at" | "updated_at">) => {
    setIsSubmitting(true)
    try {
      await apiFetch("/agencies", { method: "POST", body: formData, token })
      toast({
        title: "Success",
        description: "Agency added successfully.",
      })
      setIsFormOpen(false)
      fetchAgencies()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add agency.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAgency = async (formData: Omit<Agency, "id" | "created_at" | "updated_at">) => {
    if (!editingAgency) return
    setIsSubmitting(true)
    try {
      await apiFetch(`/agencies/${editingAgency.id}`, { method: "PUT", body: formData, token })
      toast({
        title: "Success",
        description: "Agency updated successfully.",
      })
      setIsFormOpen(false)
      setEditingAgency(null)
      fetchAgencies()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update agency.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAgency = async (id: number) => {
    try {
      await apiFetch(`/agencies/${id}`, { method: "DELETE", token })
      toast({
        title: "Success",
        description: "Agency deleted successfully.",
      })
      fetchAgencies()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete agency.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "address", header: "Address" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    {
      key: "actions",
      header: "Actions",
      render: (agency: Agency) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setEditingAgency(agency)
              setIsFormOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit agency</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete agency</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the agency &quot;{agency.name}&quot; and
                  remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteAgency(agency.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  if (loading) {
    return <p>Loading agencies...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agencies Management</h1>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditingAgency(null) // Clear editing state when dialog closes
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAgency(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Agency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingAgency ? "Edit Agency" : "Add New Agency"}</DialogTitle>
              <DialogDescription>
                {editingAgency ? "Make changes to the agency here." : "Fill in the details for a new agency."}
              </DialogDescription>
            </DialogHeader>
            <AgencyForm
              initialData={editingAgency || undefined}
              onSubmit={editingAgency ? handleEditAgency : handleAddAgency}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Agencies</CardTitle>
          <CardDescription>A list of all registered agencies in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={agencies} columns={columns} emptyMessage="No agencies found." />
        </CardContent>
      </Card>
    </div>
  )
}
