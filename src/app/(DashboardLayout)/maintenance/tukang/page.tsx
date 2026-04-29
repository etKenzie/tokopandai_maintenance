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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

interface Tukang {
  id: number;
  tukang_name: string;
  skill_list: string;
  location: string;
  address: string;
  ktp: string;
  phone: string;
}

interface TukangListResponse {
  status: string;
  data: Tukang[];
}

interface TukangFormState {
  tukang_name: string;
  skill_list: string;
  location: string;
  address: string;
  ktp: string;
  phone: string;
}

const emptyForm: TukangFormState = {
  tukang_name: "",
  skill_list: "",
  location: "",
  address: "",
  ktp: "",
  phone: "",
};

export default function MaintenanceTukangPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tukangList, setTukangList] = useState<Tukang[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<TukangFormState>(emptyForm);
  const [selectedTukang, setSelectedTukang] = useState<Tukang | null>(null);

  const dialogTitle = useMemo(
    () => (editOpen ? "Edit Tukang" : "Add Tukang"),
    [editOpen]
  );

  const fetchTukang = useCallback(async () => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const res = await logMaintenanceFetch("/api/maintenance/tukang", {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch tukang");
      const json: TukangListResponse = await res.json();
      setTukangList(json.data || []);
    } catch (err) {
      console.error(err);
      setTukangList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTukang();
  }, [fetchTukang]);

  const openCreate = () => {
    setSelectedTukang(null);
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const openEdit = (item: Tukang) => {
    setSelectedTukang(item);
    setForm({
      tukang_name: item.tukang_name || "",
      skill_list: item.skill_list || "",
      location: item.location || "",
      address: item.address || "",
      ktp: item.ktp || "",
      phone: item.phone || "",
    });
    setEditOpen(true);
  };

  const closeDialog = () => {
    setCreateOpen(false);
    setEditOpen(false);
    setSelectedTukang(null);
    setForm(emptyForm);
  };

  const upsertTukang = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getCookie("token");
      const isEdit = Boolean(selectedTukang);
      const endpoint = isEdit ? `/api/maintenance/tukang/${selectedTukang?.id}` : "/api/maintenance/tukang";
      const method = isEdit ? "PUT" : "POST";

      const res = await logMaintenanceFetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || `Failed to ${isEdit ? "update" : "create"} tukang`);
      }

      closeDialog();
      await fetchTukang();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tukang");
    } finally {
      setSaving(false);
    }
  };

  const deleteTukang = async (item: Tukang) => {
    if (!window.confirm(`Delete tukang "${item.tukang_name}"?`)) return;
    try {
      const token = getCookie("token");
      const res = await logMaintenanceFetch(`/api/maintenance/tukang/${item.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Failed to delete tukang");
      }
      await fetchTukang();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tukang");
    }
  };

  return (
    <PageContainer title="Tukang" description="Manage maintenance tukang">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Tukang
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Add tukang
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
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tukangList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.tukang_name}</TableCell>
                    <TableCell>{item.skill_list}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => openEdit(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteTukang(item)}>
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

      <Dialog open={createOpen || editOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <form onSubmit={upsertTukang}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              required
              fullWidth
              label="Tukang name"
              value={form.tukang_name}
              onChange={(e) => setForm((f) => ({ ...f, tukang_name: e.target.value }))}
            />
            <TextField
              required
              fullWidth
              label="Skill list"
              value={form.skill_list}
              onChange={(e) => setForm((f) => ({ ...f, skill_list: e.target.value }))}
              helperText="Example: AC,Plumbing"
            />
            <TextField
              required
              fullWidth
              label="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <TextField
              required
              fullWidth
              label="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <TextField
              required
              fullWidth
              label="KTP"
              value={form.ktp}
              onChange={(e) => setForm((f) => ({ ...f, ktp: e.target.value }))}
            />
            <TextField
              required
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : selectedTukang ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}
