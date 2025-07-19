"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

interface UserFormProps {
  initialData?: { id?: number; name: string; email: string; role: string; password?: string }
  onSubmit: (data: { name: string; email: string; role: string; password?: string }) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function UserForm({ initialData, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [role, setRole] = useState(initialData?.role || "client") // Default role
  const [password, setPassword] = useState("") // Password for new user or reset
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setEmail(initialData.email || "")
      setRole(initialData.role || "client")
      setPassword("") // Clear password field for editing
      setConfirmPassword("")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match!") // Use toast for better UX
      return
    }

    const formData: { name: string; email: string; role: string; password?: string } = { name, email, role }
    if (password) {
      // Only include password if it's provided (for new user or reset)
      formData.password = password
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="col-span-3"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right">
          Role
        </Label>
        <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="col-span-3"
          placeholder={initialData ? "Leave blank to keep current password" : "Enter password"}
          required={!initialData} // Required only for new users
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="confirmPassword" className="text-right">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="col-span-3"
          placeholder={initialData ? "Leave blank to keep current password" : "Confirm password"}
          required={!initialData} // Required only for new users
          disabled={isSubmitting}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
