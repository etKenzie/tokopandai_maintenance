"use client";

import "@/app/components/apps/calendar/Calendar.css";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import LocationPicker from "@/app/components/shared/LocationPicker";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getCookie } from "cookies-next";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "@/app/context/AuthContext";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

export interface MaintenanceRequest {
  id: number;
  client_id: number;
  tukang_id: number | null;
  maintenance_name: string;
  maintenance_desc: string;
  location: string;
  location_lat: string | null;
  location_lng: string | null;
  img_maintenance: string | null;
  status: string;
  request_time: string | null;
  approve_time: string | null;
  maintenance_start: string | null;
  maintenance_end: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client_name: string | null;
}

interface MaintenanceListResponse {
  status: string;
  data: MaintenanceRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface MaintenanceClient {
  id: number;
  client_name: string;
}

interface MaintenanceClientListResponse {
  status: string;
  data: MaintenanceClient[];
}

interface TukangItem {
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
  data: TukangItem[];
}

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resource?: MaintenanceRequest;
};

function maintenanceToEvents(data: MaintenanceRequest[]): CalendarEvent[] {
  return data
    .filter((r) => r.request_time || r.maintenance_start || r.approve_time)
    .map((r) => {
      const startStr = r.maintenance_start || r.request_time || r.approve_time;
      const endStr = r.maintenance_end;
      const start = startStr ? new Date(startStr) : new Date();
      const end = endStr ? new Date(endStr) : new Date(start.getTime() + 60 * 60 * 1000);
      return {
        id: r.id,
        title: `${r.maintenance_name} - ${r.client_name || "Unknown Client"}`,
        start,
        end,
        status: r.status,
        resource: r,
      };
    });
}

const statusColor: Record<string, string> = {
  REQUESTED: "#fdd43f",
  APPROVED: "#1a97f5",
  REJECTED: "#e53935",
  IN_PROGRESS: "#fb8c00",
  DONE: "#39b69a",
  VERIFIED: "#2e7d32",
  COMPLETED: "#39b69a",
};

function addMonthsSameDay(date: Date, months: number): Date {
  const startDay = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(startDay, lastDayOfMonth));
  target.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  return target;
}

function generateMonthlyDates(firstDate: Date, count: number): Date[] {
  const out: Date[] = [];
  for (let i = 0; i < count; i++) {
    out.push(addMonthsSameDay(firstDate, i));
  }
  return out;
}

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace("#", "");
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((c) => c + c)
          .join("")
      : sanitized;

  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return `rgba(97,93,255,${alpha})`;

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function MaintenanceCalendarToolbar(toolbar: any) {
  const views = (toolbar.views || []) as string[];

  return (
    <div className="rbc-toolbar">
      <span className="rbc-toolbar-label">{toolbar.label}</span>

      <div className="maintenance-toolbar-controls">
        <span className="rbc-btn-group">
          <button type="button" style={{ fontWeight: 800 }} onClick={() => toolbar.onNavigate("PREV")}>
            {"<"}
          </button>
          <button type="button" style={{ fontWeight: 800 }} onClick={() => toolbar.onNavigate("TODAY")}>
            Today
          </button>
          <button type="button" style={{ fontWeight: 800 }} onClick={() => toolbar.onNavigate("NEXT")}>
            {">"}
          </button>
        </span>

        <span className="rbc-btn-group">
          {views.map((view) => (
            <button
              key={view}
              type="button"
              style={{ fontWeight: 800 }}
              className={toolbar.view === view ? "rbc-active" : ""}
              onClick={() => toolbar.onView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

function MaintenanceMonthEvent({ event }: { event: CalendarEvent }) {
  const startTime = moment(event.start).format("HH:mm");
  const clientName = event.resource?.client_name || "Unknown Client";

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        gap: 6,
        width: "100%",
        padding: "2px 4px",
        boxSizing: "border-box",
      }}
    >
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <strong style={{ color: "#000000", lineHeight: 1.1, alignSelf: "flex-start", fontSize: "1rem" }}>
          {startTime}
        </strong>
        <span style={{ color: "#555", lineHeight: 1.1, textAlign: "right", fontSize: "0.8rem", fontWeight: 600 }}>
          {clientName}
        </span>
      </span>
      <span style={{ color: "#000000", lineHeight: 1.1, textAlign: "center", fontSize: "0.95rem" }}>
        {event.resource?.maintenance_name || event.title}
      </span>
    </span>
  );
}

function MaintenanceWeekEvent({ event }: { event: CalendarEvent }) {
  const clientName = event.resource?.client_name || "Unknown Client";
  const maintenanceTitle = event.resource?.maintenance_name || event.title;

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        width: "100%",
        padding: "2px 4px",
        boxSizing: "border-box",
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <strong style={{ color: "#000000", lineHeight: 1.1, fontSize: "1rem", whiteSpace: "nowrap" }}>
            {maintenanceTitle}
          </strong>
          <span style={{ color: "#555", lineHeight: 1.1, textAlign: "right", fontSize: "0.8rem", fontWeight: 600 }}>
            {clientName}
          </span>
        </span>
      </span>
    </span>
  );
}

function MaintenanceAgendaEvent({ event }: { event: CalendarEvent }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, width: "100%" }}>
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{event.resource?.maintenance_name || event.title}</Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
        {event.resource?.client_name || "Unknown Client"}
      </Typography>
    </Box>
  );
}

export default function MaintenancePage() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MaintenanceRequest[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);
  const [editForm, setEditForm] = useState({
    maintenance_name: "",
    maintenance_desc: "",
    location: "",
    location_lat: 0,
    location_lng: 0,
    img_maintenance: "",
    request_time: new Date(),
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingMaintenance, setDeletingMaintenance] = useState(false);
  const [approvingMaintenance, setApprovingMaintenance] = useState(false);
  const [completingMaintenance, setCompletingMaintenance] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [requestType, setRequestType] = useState<"emergency" | "scheduled">("emergency");
  const [clients, setClients] = useState<MaintenanceClient[]>([]);
  const [tukangList, setTukangList] = useState<TukangItem[]>([]);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedTukangId, setSelectedTukangId] = useState<number | "">("");
  const [selectedClientId, setSelectedClientId] = useState<number>(1);
  const [scheduledMonths, setScheduledMonths] = useState(6);
  const [scheduledFirstDate, setScheduledFirstDate] = useState<Date>(() => new Date());
  const [scheduledDates, setScheduledDates] = useState<Date[]>(() =>
    generateMonthlyDates(new Date(), 6)
  );
  const [form, setForm] = useState({
    maintenance_name: "",
    maintenance_desc: "",
    location: "",
    location_lat: 0,
    location_lng: 0,
    img_maintenance: "",
    request_time: new Date(),
  });

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/maintenance", {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: MaintenanceListResponse = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch("/api/maintenance/client", {
          method: "GET",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch clients");
        const json: MaintenanceClientListResponse = await res.json();
        const nextClients = json.data || [];
        setClients(nextClients);
        if (nextClients.length > 0) {
          setSelectedClientId((prev) =>
            nextClients.some((c) => c.id === prev) ? prev : nextClients[0].id
          );
        }
      } catch (err) {
        console.error(err);
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchTukang = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch("/api/maintenance/tukang", {
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
      }
    };
    fetchTukang();
  }, []);

  useEffect(() => {
    if (requestType === "scheduled") {
      setScheduledDates(generateMonthlyDates(scheduledFirstDate, scheduledMonths));
    }
  }, [requestType, scheduledMonths, scheduledFirstDate]);

  useEffect(() => {
    if (detailOpen && selectedMaintenance) {
      const r = selectedMaintenance;
      setEditForm({
        maintenance_name: r.maintenance_name || "",
        maintenance_desc: r.maintenance_desc || "",
        location: r.location || "",
        location_lat: r.location_lat != null ? Number(r.location_lat) : 0,
        location_lng: r.location_lng != null ? Number(r.location_lng) : 0,
        img_maintenance: r.img_maintenance || "",
        request_time: r.request_time ? new Date(r.request_time) : new Date(),
      });
    }
  }, [detailOpen, selectedMaintenance]);

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;
    setSavingEdit(true);
    try {
      const token = getCookie("token");
      const body = {
        maintenance_name: editForm.maintenance_name,
        maintenance_desc: editForm.maintenance_desc,
        location: editForm.location,
        location_lat: Number(editForm.location_lat),
        location_lng: Number(editForm.location_lng),
        img_maintenance: editForm.img_maintenance || undefined,
        request_time: editForm.request_time.toISOString().replace(/\.\d{3}Z$/, "Z"),
      };
      const res = await fetch(`/api/maintenance/${selectedMaintenance.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Failed to update");
      }
      setDetailOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenance();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaintenance) return;
    const normalizedStatus = (selectedMaintenance.status || "").toUpperCase();
    const canDelete =
      normalizedStatus === "REQUESTED" ||
      normalizedStatus === "APPROVED" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "DONE";
    if (!canDelete) return;
    if (!window.confirm("Delete this maintenance request? This cannot be undone.")) return;
    setDeletingMaintenance(true);
    try {
      const token = getCookie("token");
      const res = await fetch(`/api/maintenance/${selectedMaintenance.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Failed to delete");
      }
      setDetailOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenance();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete request");
    } finally {
      setDeletingMaintenance(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMaintenance || !isAdmin || selectedMaintenance.status !== "REQUESTED") return;
    if (!selectedTukangId) {
      alert("Please select tukang to assign.");
      return;
    }
    setApprovingMaintenance(true);
    try {
      const token = getCookie("token");
      const res = await fetch(`/api/maintenance/${selectedMaintenance.id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tukang_id: selectedTukangId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Failed to approve");
      }
      setApproveOpen(false);
      setSelectedTukangId("");
      setDetailOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenance();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setApprovingMaintenance(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedMaintenance) return;
    if (selectedMaintenance.status === "REQUESTED") {
      alert("Request must be approved before completing.");
      return;
    }
    setCompletingMaintenance(true);
    try {
      const token = getCookie("token");
      const res = await fetch(`/api/maintenance/${selectedMaintenance.id}/complete`, {
        method: "PATCH",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Failed to complete");
      }
      setDetailOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenance();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to complete request");
    } finally {
      setCompletingMaintenance(false);
    }
  };

  const events = maintenanceToEvents(data);

  const eventStyleGetter = (event: CalendarEvent) => {
    const color = statusColor[event.status] || "#615dff";
    return {
      style: {
        backgroundColor: hexToRgba(color, 0.15),
        border: `1.5px solid ${color}`,
        color: "#000000",
        borderRadius: 6,
        padding: "8px 10px",
        fontSize: "0.95rem",
        fontWeight: 500,
      },
    };
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getCookie("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (requestType === "emergency") {
        const body = {
          client_id: selectedClientId,
          maintenance_name: form.maintenance_name,
          maintenance_desc: form.maintenance_desc,
          location: form.location,
          location_lat: Number(form.location_lat),
          location_lng: Number(form.location_lng),
          img_maintenance: form.img_maintenance || undefined,
          request_time: form.request_time.toISOString().replace(/\.\d{3}Z$/, "Z"),
        };
        const res = await fetch("/api/maintenance", {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.details || err?.error || "Failed to create");
        }
      } else {
        for (let i = 0; i < scheduledDates.length; i++) {
          const body = {
            client_id: selectedClientId,
            maintenance_name: "Scheduled Maintenance",
            maintenance_desc: form.maintenance_desc,
            location: form.location,
            location_lat: Number(form.location_lat),
            location_lng: Number(form.location_lng),
            img_maintenance: form.img_maintenance || undefined,
            request_time: scheduledDates[i].toISOString().replace(/\.\d{3}Z$/, "Z"),
          };
          const res = await fetch("/api/maintenance", {
            method: "POST",
            credentials: "include",
            headers,
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.details || err?.error || `Failed to create visit ${i + 1}`);
          }
        }
      }

      setCreateOpen(false);
      setRequestType("emergency");
      setScheduledMonths(6);
      setScheduledFirstDate(new Date());
      setScheduledDates(generateMonthlyDates(new Date(), 6));
      setForm({
        maintenance_name: "",
        maintenance_desc: "",
        location: "",
        location_lat: 0,
        location_lng: 0,
        img_maintenance: "",
        request_time: new Date(),
      });
      await fetchMaintenance();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Requests" description="Maintenance requests and calendar">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Requests
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setCreateOpen(true)}>
          Create new request
        </Button>
      </Box>
      <BlankCard>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                "& .maintenance-calendar": {
                  fontFamily: `"Poppins", "Inter", "Segoe UI", sans-serif`,
                },
                "& .maintenance-calendar .rbc-toolbar": {
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1,
                  mb: 2,
                },
                "& .maintenance-calendar .rbc-toolbar-label": {
                  order: -1,
                  flex: "1 0 100%",
                  textAlign: "left",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  p: 0,
                },
                "& .maintenance-calendar .maintenance-toolbar-controls": {
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group:first-of-type": {
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 0.5,
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group:first-of-type button": {
                  fontWeight: "800 !important",
                  color: "primary.main",
                  borderColor: "primary.main",
                  borderRadius: 1.5,
                  px: 1.5,
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group:last-of-type": {
                  marginLeft: "auto",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group:last-of-type button": {
                  fontWeight: 800,
                  color: "primary.main",
                  borderColor: "primary.main",
                  borderRadius: 1.5,
                  px: 1.5,
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group button.rbc-active": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  borderColor: "primary.main",
                },
                "& .maintenance-calendar .rbc-toolbar .rbc-btn-group button:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
                "& .maintenance-calendar .rbc-header": {
                  fontSize: "1rem",
                  fontWeight: 800,
                  py: 1.25,
                  letterSpacing: "0.01em",
                },
                "& .maintenance-calendar .rbc-time-view .rbc-event-label": {
                  display: "none",
                },
                "& .maintenance-calendar .rbc-time-view .rbc-event-content": {
                  width: "100%",
                },
                "& .maintenance-calendar .rbc-time-view .rbc-timeslot-group": {
                  minHeight: "110px",
                },
                "& .maintenance-calendar .rbc-time-view .rbc-day-slot .rbc-events-container": {
                  marginRight: "4px",
                },
              }}
            >
              <Calendar
                className="maintenance-calendar"
                events={events}
                defaultView="month"
                defaultDate={new Date()}
                localizer={localizer}
                formats={{ eventTimeRangeFormat: () => "" }}
                components={{
                  toolbar: MaintenanceCalendarToolbar,
                  month: { event: MaintenanceMonthEvent },
                  week: { event: MaintenanceWeekEvent },
                  agenda: { event: MaintenanceAgendaEvent },
                }}
                style={{ height: "calc(100vh - 250px)" }}
                eventPropGetter={(event: CalendarEvent) => eventStyleGetter(event)}
                onSelectEvent={(event: CalendarEvent) => {
                  const ev = event;
                  if (ev.resource) {
                    setSelectedMaintenance(ev.resource);
                    setDetailOpen(true);
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </BlankCard>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xl" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontSize: "1.35rem" }}>Create maintenance request</DialogTitle>
          <DialogContent
            sx={{
              "& .MuiTypography-root": { fontSize: "1.0625rem" },
              "& .MuiFormControlLabel-label": { fontSize: "1.0625rem" },
              "& .MuiInputLabel-root": { fontSize: "1rem" },
              "& .MuiInputBase-input": { fontSize: "1.0625rem" },
              "& .MuiButton-root": { fontSize: "1rem" },
            }}
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: "1.0625rem" }}>
              {requestType === "emergency"
                ? "Submit a new maintenance request (client: Darmi). All fields are required except image."
                : "Schedule recurring visits. Name will be “Scheduled Maintenance”. Set number of months and visit dates."}
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: "1.0625rem" }}>
              Request type
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClientId}
                label="Client"
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.client_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <RadioGroup
              row
              value={requestType}
              onChange={(_, v) => setRequestType(v as "emergency" | "scheduled")}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="emergency" control={<Radio />} label="Emergency repair" />
              <FormControlLabel value="scheduled" control={<Radio />} label="Scheduled" />
            </RadioGroup>

            {requestType === "emergency" && (
              <TextField
                label="Maintenance name"
                fullWidth
                required
                value={form.maintenance_name}
                onChange={(e) => setForm((f) => ({ ...f, maintenance_name: e.target.value }))}
                sx={{ mb: 2 }}
              />
            )}
            {requestType === "scheduled" && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "1.0625rem" }}>
                Name: Scheduled Maintenance
              </Typography>
            )}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={form.maintenance_desc}
              onChange={(e) => setForm((f) => ({ ...f, maintenance_desc: e.target.value }))}
              sx={{ mb: 2, "& .MuiInputBase-input": { fontSize: "1.0625rem" } }}
            />
            <LocationPicker
              label="Location"
              required
              value={{
                location: form.location,
                location_lat: form.location_lat,
                location_lng: form.location_lng,
              }}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  location: v.location,
                  location_lat: v.location_lat,
                  location_lng: v.location_lng,
                }))
              }
            />
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontSize: "1.0625rem" }}>
              Image (optional) - JPG, PNG, GIF, or WebP, max 5MB
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" component="label" disabled={uploadingImage}>
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err?.error || "Upload failed");
                      }
                      const { url } = await res.json();
                      setForm((f) => ({ ...f, img_maintenance: url }));
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingImage(false);
                      e.target.value = "";
                    }
                  }}
                />
                {uploadingImage ? "Uploading..." : "Choose image"}
              </Button>
              {form.img_maintenance && (
                <>
                  <Box
                    component="img"
                    src={form.img_maintenance}
                    alt="Preview"
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Remove image"
                    onClick={() => setForm((f) => ({ ...f, img_maintenance: "" }))}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {requestType === "emergency" && (
                <DateTimePicker
                  label="Request time"
                  value={form.request_time}
                  onChange={(v) => setForm((f) => ({ ...f, request_time: v || new Date() }))}
                />
              )}
              {requestType === "scheduled" && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: "1.125rem", fontWeight: 600 }}>
                    Visit dates & times (edit date and time for each scheduled visit)
                  </Typography>
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, mb: 2 }}>
                    {scheduledDates.map((d, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: "1rem" }}>
                          Visit {i + 1}
                        </Typography>
                        <DateTimePicker
                          label="Date & time"
                          value={d}
                          onChange={(v) => {
                            const next = new Date(v || d);
                            setScheduledDates((prev) => {
                              const arr = [...prev];
                              arr[i] = next;
                              return arr;
                            });
                          }}
                        />
                      </Paper>
                    ))}
                  </Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontSize: "1.0625rem" }}>
                    Change number of months or first visit to regenerate the list above
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 2 }}>
                    <FormControl sx={{ minWidth: 140 }}>
                      <InputLabel>Months</InputLabel>
                      <Select
                        value={scheduledMonths}
                        label="Months"
                        onChange={(e) => setScheduledMonths(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n} month{n !== 1 ? "s" : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <DateTimePicker
                      label="First visit date & time"
                      value={scheduledFirstDate}
                      onChange={(v) => setScheduledFirstDate(v || new Date())}
                    />
                  </Box>
                </Box>
              )}
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ "& .MuiButton-root": { fontSize: "1rem" } }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? "Submitting..."
                : requestType === "scheduled"
                  ? `Create ${scheduledDates.length} scheduled visit${scheduledDates.length === 1 ? "" : "s"}`
                  : "Create request"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedMaintenance(null); }}
        maxWidth="md"
        fullWidth
      >
        {selectedMaintenance && (
          <form onSubmit={handleEditSave}>
            <DialogTitle sx={{ fontSize: "1.35rem" }}>
              Maintenance request
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: "1rem" }}>
                  Status:
                </Typography>
                <Chip
                  label={selectedMaintenance.status}
                  size="medium"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    bgcolor: statusColor[selectedMaintenance.status] || "#9e9e9e",
                    color: "#fff",
                  }}
                />
                {selectedMaintenance.status === "REQUESTED" && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                    (editable)
                  </Typography>
                )}
              </Box>
            </DialogTitle>
            <DialogContent
              sx={{
                "& .MuiTypography-root": { fontSize: "1.0625rem" },
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1.0625rem" },
                "& .MuiButton-root": { fontSize: "1rem" },
              }}
            >
              <TextField
                label="Maintenance name"
                fullWidth
                value={editForm.maintenance_name}
                onChange={(e) => setEditForm((f) => ({ ...f, maintenance_name: e.target.value }))}
                disabled={selectedMaintenance.status !== "REQUESTED"}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={editForm.maintenance_desc}
                onChange={(e) => setEditForm((f) => ({ ...f, maintenance_desc: e.target.value }))}
                disabled={selectedMaintenance.status !== "REQUESTED"}
                sx={{ mb: 2 }}
              />
              {selectedMaintenance.status === "REQUESTED" ? (
                <LocationPicker
                  label="Location"
                  value={{
                    location: editForm.location,
                    location_lat: editForm.location_lat,
                    location_lng: editForm.location_lng,
                  }}
                  onChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      location: v.location,
                      location_lat: v.location_lat,
                      location_lng: v.location_lng,
                    }))
                  }
                />
              ) : (
                <TextField
                  label="Location"
                  fullWidth
                  value={editForm.location}
                  disabled
                  sx={{ mb: 2 }}
                />
              )}
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontSize: "1.0625rem" }}>
                Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
                {selectedMaintenance.status === "REQUESTED" && (
                  <Button variant="outlined" component="label" disabled={uploadingEditImage}>
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingEditImage(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err?.error || "Upload failed");
                          }
                          const { url } = await res.json();
                          setEditForm((f) => ({ ...f, img_maintenance: url }));
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploadingEditImage(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    {uploadingEditImage ? "Uploading..." : "Choose image"}
                  </Button>
                )}
                {editForm.img_maintenance && (
                  <>
                    <Box
                      component="img"
                      src={editForm.img_maintenance}
                      alt="Preview"
                      sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                    />
                    {selectedMaintenance.status === "REQUESTED" && (
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Remove image"
                        onClick={() => setEditForm((f) => ({ ...f, img_maintenance: "" }))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </>
                )}
              </Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Request time"
                  value={editForm.request_time}
                  onChange={(v) => setEditForm((f) => ({ ...f, request_time: v || new Date() }))}
                  disabled={selectedMaintenance.status !== "REQUESTED"}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ "& .MuiButton-root": { fontSize: "1rem" } }}>
              {(() => {
                const normalizedStatus = (selectedMaintenance.status || "").toUpperCase();
                return (
                  normalizedStatus === "REQUESTED" ||
                  normalizedStatus === "APPROVED" ||
                  normalizedStatus === "COMPLETED" ||
                  normalizedStatus === "DONE"
                );
              })() && (
                <Button
                  color="error"
                  onClick={handleDelete}
                  disabled={savingEdit || deletingMaintenance || approvingMaintenance || completingMaintenance}
                  sx={{ mr: "auto" }}
                >
                  {deletingMaintenance ? "Deleting..." : "Delete"}
                </Button>
              )}
              {isAdmin && selectedMaintenance.status === "REQUESTED" && (
                <Button
                  color="info"
                  onClick={() => setApproveOpen(true)}
                  disabled={savingEdit || deletingMaintenance || approvingMaintenance || completingMaintenance}
                >
                  {approvingMaintenance ? "Approving..." : "Approve"}
                </Button>
              )}
              {selectedMaintenance.status !== "COMPLETED" && selectedMaintenance.status !== "REQUESTED" && (
                <Button
                  color="success"
                  onClick={handleComplete}
                  disabled={savingEdit || deletingMaintenance || approvingMaintenance || completingMaintenance}
                >
                  {completingMaintenance ? "Completing..." : "Complete"}
                </Button>
              )}
              <Button onClick={() => { setDetailOpen(false); setSelectedMaintenance(null); }}>
                Close
              </Button>
              {selectedMaintenance.status === "REQUESTED" && (
                <Button type="submit" variant="contained" disabled={savingEdit || deletingMaintenance || approvingMaintenance || completingMaintenance}>
                  {savingEdit ? "Saving..." : "Save changes"}
                </Button>
              )}
            </DialogActions>
          </form>
        )}
      </Dialog>
      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>Approve and assign tukang</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Select one tukang from the table below.
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>KTP</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tukangList.map((tukang) => {
                  const isSelected = Number(selectedTukangId) === tukang.id;
                  return (
                    <TableRow
                      key={tukang.id}
                      hover
                      selected={isSelected}
                      onClick={() => setSelectedTukangId(tukang.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{tukang.tukang_name}</TableCell>
                      <TableCell>{tukang.skill_list}</TableCell>
                      <TableCell>{tukang.location}</TableCell>
                      <TableCell>{tukang.address}</TableCell>
                      <TableCell>{tukang.ktp}</TableCell>
                      <TableCell>{tukang.phone}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={!selectedTukangId || approvingMaintenance}
          >
            {approvingMaintenance ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
