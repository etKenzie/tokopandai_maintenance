"use client";

import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getCookie } from "cookies-next";
import React, { useCallback, useEffect, useState } from "react";

interface MaintenanceClient {
  id: number;
  client_name: string;
}

interface MaintenanceClientListResponse {
  status: string;
  data: MaintenanceClient[];
}

export default function MaintenanceClientPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<MaintenanceClient[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [selectedClient, setSelectedClient] = useState<MaintenanceClient | null>(null);
  const [editClientName, setEditClientName] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/maintenance/client", {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const json: MaintenanceClientListResponse = await res.json();
      setClients(json.data || []);
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <PageContainer title="Maintenance Clients" description="Manage maintenance clients">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Maintenance Clients
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add client
        </Button>
      </Box>
      <BlankCard>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.client_name}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedClient(client);
                          setEditClientName(client.client_name);
                          setEditOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={async () => {
                          if (!window.confirm(`Delete client "${client.client_name}"?`)) return;
                          try {
                            const token = getCookie("token");
                            const res = await fetch(`/api/maintenance/client/${client.id}`, {
                              method: "DELETE",
                              credentials: "include",
                              headers: token ? { Authorization: `Bearer ${token}` } : {},
                            });
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              throw new Error(err?.details || err?.error || "Failed to delete client");
                            }
                            await fetchClients();
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Failed to delete client");
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </BlankCard>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              const token = getCookie("token");
              const res = await fetch("/api/maintenance/client", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ client_name: newClientName }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.details || err?.error || "Failed to create client");
              }
              setCreateOpen(false);
              setNewClientName("");
              await fetchClients();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Failed to create client");
            } finally {
              setSaving(false);
            }
          }}
        >
          <DialogTitle>Add maintenance client</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              required
              label="Client name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedClient) return;
            setSaving(true);
            try {
              const token = getCookie("token");
              const res = await fetch(`/api/maintenance/client/${selectedClient.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ client_name: editClientName }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.details || err?.error || "Failed to update client");
              }
              setEditOpen(false);
              setSelectedClient(null);
              setEditClientName("");
              await fetchClients();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Failed to update client");
            } finally {
              setSaving(false);
            }
          }}
        >
          <DialogTitle>Edit maintenance client</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              required
              label="Client name"
              value={editClientName}
              onChange={(e) => setEditClientName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Update"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}
