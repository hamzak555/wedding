"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import "../envelope.css";

interface EditGuest {
  name: string;
  dietary_restrictions: string;
}

interface Guest {
  name: string;
  dietary_restrictions: string | null;
}

interface RSVPSubmission {
  id: string;
  name: string;
  email: string;
  primary_dietary: string | null;
  guests: Guest[];
  created_at: string;
}

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<RSVPSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    submission: RSVPSubmission | null;
  }>({ open: false, submission: null });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    primary_dietary: "",
    guests: [] as EditGuest[],
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      fetchSubmissions();
    };

    checkAuth();
  }, [router, supabase.auth]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: "", name: "" });
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("rsvps")
        .delete()
        .eq("id", deleteDialog.id);

      if (error) throw error;

      setSubmissions(submissions.filter((sub) => sub.id !== deleteDialog.id));
      closeDeleteDialog();
    } catch (err) {
      console.error("Error deleting RSVP:", err);
      closeDeleteDialog();
    }
  };

  const openEditDialog = (submission: RSVPSubmission) => {
    setEditForm({
      name: submission.name,
      email: submission.email,
      primary_dietary: submission.primary_dietary || "",
      guests: (submission.guests || []).map((g) => ({
        name: g.name,
        dietary_restrictions: g.dietary_restrictions || "",
      })),
    });
    setEditDialog({ open: true, submission });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, submission: null });
  };

  const addEditGuest = () => {
    setEditForm({
      ...editForm,
      guests: [...editForm.guests, { name: "", dietary_restrictions: "" }],
    });
  };

  const removeEditGuest = (index: number) => {
    setEditForm({
      ...editForm,
      guests: editForm.guests.filter((_, i) => i !== index),
    });
  };

  const updateEditGuest = (
    index: number,
    field: keyof EditGuest,
    value: string
  ) => {
    setEditForm({
      ...editForm,
      guests: editForm.guests.map((g, i) =>
        i === index ? { ...g, [field]: value } : g
      ),
    });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.submission) return;

    // Check if any guest has an empty name
    const hasEmptyGuestName = editForm.guests.some(
      (guest) => guest.name.trim() === ""
    );
    if (hasEmptyGuestName) {
      return;
    }

    try {
      const { error } = await supabase
        .from("rsvps")
        .update({
          name: editForm.name,
          email: editForm.email,
          primary_dietary: editForm.primary_dietary || null,
          guests: editForm.guests.map((g) => ({
            name: g.name,
            dietary_restrictions: g.dietary_restrictions || null,
          })),
        })
        .eq("id", editDialog.submission.id);

      if (error) throw error;

      setSubmissions(
        submissions.map((sub) =>
          sub.id === editDialog.submission!.id
            ? {
                ...sub,
                name: editForm.name,
                email: editForm.email,
                primary_dietary: editForm.primary_dietary || null,
                guests: editForm.guests.map((g) => ({
                  name: g.name,
                  dietary_restrictions: g.dietary_restrictions || null,
                })),
              }
            : sub
        )
      );
      closeEditDialog();
    } catch (err) {
      console.error("Error updating RSVP:", err);
    }
  };

  const totalGuests = submissions.reduce((acc, sub) => {
    return acc + 1 + (sub.guests?.length || 0);
  }, 0);

  const hasEmptyGuestName = editForm.guests.some(
    (guest) => guest.name.trim() === ""
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Dietary Restrictions", "Additional Guests", "Total Guests", "Submitted"];

    const rows = submissions.map((sub) => {
      const guestsList = sub.guests && sub.guests.length > 0
        ? sub.guests.map(g => `${g.name}${g.dietary_restrictions ? ` (${g.dietary_restrictions})` : ""}`).join("; ")
        : "";
      const totalGuests = 1 + (sub.guests?.length || 0);

      return [
        sub.name,
        sub.email,
        sub.primary_dietary || "",
        guestsList,
        totalGuests.toString(),
        formatDate(sub.created_at)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rsvp-submissions-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("RSVP Submissions", 14, 22);

    // Add summary
    doc.setFontSize(12);
    doc.text(`Total RSVPs: ${submissions.length}`, 14, 32);
    doc.text(`Total Guests: ${totalGuests}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);

    // Prepare table data
    const tableData = submissions.map((sub) => {
      const guestsList = sub.guests && sub.guests.length > 0
        ? sub.guests.map(g => `${g.name}${g.dietary_restrictions ? ` (${g.dietary_restrictions})` : ""}`).join("\n")
        : "-";

      return [
        sub.name,
        sub.email,
        sub.primary_dietary || "-",
        guestsList,
        (1 + (sub.guests?.length || 0)).toString(),
        formatDate(sub.created_at)
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [["Name", "Email", "Dietary", "Additional Guests", "Total", "Submitted"]],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [137, 142, 108],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 15 },
        5: { cellWidth: 30 },
      },
    });

    doc.save(`rsvp-submissions-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Rsvp Dashboard</h1>
        <button onClick={handleLogout} className="dashboard-logout">
          Sign Out
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <p className="stat-value">{submissions.length}</p>
          <p className="stat-label">Total RSVPs</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{totalGuests}</p>
          <p className="stat-label">Total Guests</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">All Submissions</h2>
          {submissions.length > 0 && (
            <div className="export-buttons">
              <button className="export-button" onClick={exportToCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                Export CSV
              </button>
              <button className="export-button" onClick={exportToPDF}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Export PDF
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rsvp-table-container">
            <div className="loading-state">Loading submissions...</div>
          </div>
        ) : error ? (
          <div className="rsvp-table-container">
            <div className="empty-state">{error}</div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rsvp-table-container">
            <div className="empty-state">No RSVP submissions yet.</div>
          </div>
        ) : (
          <div className="rsvp-table-container">
            <table className="rsvp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dietary Restrictions</th>
                  <th>Additional Guests</th>
                  <th>Total Guests</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.name}</td>
                    <td>{submission.email}</td>
                    <td>{submission.primary_dietary || "-"}</td>
                    <td>
                      {submission.guests && submission.guests.length > 0 ? (
                        <ul className="guest-list">
                          {submission.guests.map((guest, index) => (
                            <li key={index}>
                              {guest.name}
                              {guest.dietary_restrictions && (
                                <span className="guest-dietary">
                                  {" "}
                                  ({guest.dietary_restrictions})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{1 + (submission.guests?.length || 0)}</td>
                    <td>{formatDate(submission.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => openEditDialog(submission)}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </button>
                        <button
                          className="delete-button"
                          onClick={() =>
                            openDeleteDialog(submission.id, submission.name)
                          }
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RSVP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the RSVP for &quot;{deleteDialog.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editDialog.open} onOpenChange={closeEditDialog}>
        <AlertDialogContent className="edit-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit RSVP</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="edit-form">
            <div className="edit-field">
              <label>Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="edit-field">
              <label>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="edit-field">
              <label>Dietary Restrictions</label>
              <input
                type="text"
                value={editForm.primary_dietary}
                onChange={(e) =>
                  setEditForm({ ...editForm, primary_dietary: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="edit-guests-section">
              <div className="edit-guests-header">
                <label>Additional Guests</label>
                <button
                  type="button"
                  className="add-guest-button"
                  onClick={addEditGuest}
                >
                  + Add Guest
                </button>
              </div>
              {editForm.guests.map((guest, index) => (
                <div key={index} className="edit-guest-card">
                  <div className="edit-guest-header">
                    <span>Guest {index + 2}</span>
                    <button
                      type="button"
                      className="remove-guest-button"
                      onClick={() => removeEditGuest(index)}
                    >
                      &times;
                    </button>
                  </div>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) =>
                      updateEditGuest(index, "name", e.target.value)
                    }
                    placeholder="Guest name"
                  />
                  <input
                    type="text"
                    value={guest.dietary_restrictions}
                    onChange={(e) =>
                      updateEditGuest(index, "dietary_restrictions", e.target.value)
                    }
                    placeholder="Dietary restrictions (optional)"
                  />
                </div>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeEditDialog}>
              Cancel
            </AlertDialogCancel>
            <button
              className="save-button"
              onClick={handleSaveEdit}
              disabled={hasEmptyGuestName}
            >
              Save Changes
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
