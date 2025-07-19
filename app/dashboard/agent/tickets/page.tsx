"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, PhoneCall, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { useAuth } from "@/components/auth-context"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Ticket {
  id: number
  ticket_number: string
  type_reservation: string // Assuming this is a string like 'online', 'in-person'
  status: "pending" | "called" | "completed" | "cancelled" // Example statuses
  user_id: number
  agency_id: number
  created_at: string
  updated_at: string
  // Potentially include related data if API returns it, e.g., user_name, agency_name
  user?: { name: string; email: string }
  agency?: { name: string }
}

export default function AgentTicketsPage() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user?.role === "agent") {
      fetchTickets()
    } else if (user && user.role !== "agent") {
      setError("You do not have permission to view this page.")
      setLoading(false)
    }
  }, [token, user])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      // Assuming agent can see all tickets or tickets for their agency
      // Adjust API path if agent tickets are filtered by agency
      const data = await apiFetch<Ticket[]>("/tickets", { token })
      setTickets(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch tickets.")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch tickets.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTicketStatus = async (ticketId: number, newStatus: "called" | "completed" | "cancelled") => {
    setIsUpdating(true)
    try {
      await apiFetch(`/tickets/${ticketId}`, {
        method: "PUT",
        body: { status: newStatus }, // Assuming your API accepts status update via PUT
        token,
      })
      toast({
        title: "Success",
        description: `Ticket ${ticketId} status updated to ${newStatus}.`,
      })
      fetchTickets() // Refresh list
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update ticket status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadgeVariant = (status: Ticket["status"]) => {
    switch (status) {
      case "pending":
        return "default"
      case "called":
        return "secondary"
      case "completed":
        return "default" // Use default, user can customize via CSS or extend shadcn
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const columns = [
    { key: "ticket_number", header: "Ticket #" },
    { key: "type_reservation", header: "Reservation Type" },
    {
      key: "status",
      header: "Status",
      render: (ticket: Ticket) => (
        <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status.toUpperCase()}</Badge>
      ),
    },
    {
      key: "user_info",
      header: "Client",
      render: (ticket: Ticket) => (
        <div>
          {ticket.user?.name || "N/A"} ({ticket.user?.email || "N/A"})
        </div>
      ),
    },
    {
      key: "agency_info",
      header: "Agency",
      render: (ticket: Ticket) => <div>{ticket.agency?.name || "N/A"}</div>,
    },
    {
      key: "created_at",
      header: "Created At",
      render: (ticket: Ticket) => new Date(ticket.created_at).toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (ticket: Ticket) => (
        <div className="flex gap-2">
          {ticket.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateTicketStatus(ticket.id, "called")}
              disabled={isUpdating}
            >
              <PhoneCall className="mr-2 h-4 w-4" /> Call
            </Button>
          )}
          {ticket.status === "called" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleUpdateTicketStatus(ticket.id, "completed")}
                disabled={isUpdating}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Complete
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleUpdateTicketStatus(ticket.id, "cancelled")}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  if (loading) {
    return <p>Loading tickets...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets Management</h1>
        <Button onClick={fetchTickets} disabled={isUpdating}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Tickets
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>A list of all tickets in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={tickets} columns={columns} emptyMessage="No tickets found." />
        </CardContent>
      </Card>
    </div>
  )
}
