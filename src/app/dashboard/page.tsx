"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

interface EditGuest {
  name: string;
}

interface Guest {
  name: string;
}

interface RSVPSubmission {
  id: string;
  name: string;
  email: string;
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
    guests: [] as EditGuest[],
  });
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "email" | "guests" | "created_at";
    direction: "asc" | "desc";
  }>({ key: "created_at", direction: "desc" });
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
      const response = await fetch(`/api/rsvps/${deleteDialog.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

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
      guests: (submission.guests || []).map((g) => ({
        name: g.name,
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
      guests: [...editForm.guests, { name: "" }],
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
      const response = await fetch(`/api/rsvps/${editDialog.submission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          guests: editForm.guests.map((g) => ({
            name: g.name,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      setSubmissions(
        submissions.map((sub) =>
          sub.id === editDialog.submission!.id
            ? {
                ...sub,
                name: editForm.name,
                email: editForm.email,
                guests: editForm.guests.map((g) => ({
                  name: g.name,
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

  const handleSort = (key: "name" | "email" | "guests" | "created_at") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === "name" || key === "email") {
      comparison = a[key].localeCompare(b[key]);
    } else if (key === "guests") {
      const aGuests = 1 + (a.guests?.length || 0);
      const bGuests = 1 + (b.guests?.length || 0);
      comparison = aGuests - bGuests;
    } else if (key === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return direction === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ columnKey }: { columnKey: "name" | "email" | "guests" | "created_at" }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">↕</span>;
    }
    return <span className="sort-icon">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };

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
    const headers = ["Name", "Email", "Additional Guests", "Total Guests", "Submitted"];

    const rows = sortedSubmissions.map((sub) => {
      const guestsList = sub.guests && sub.guests.length > 0
        ? sub.guests.map(g => g.name).join("; ")
        : "";
      const totalGuestsCount = 1 + (sub.guests?.length || 0);

      return [
        sub.name,
        sub.email,
        guestsList,
        totalGuestsCount.toString(),
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
    link.setAttribute("download", `wedding-rsvp-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Brand colors
    const maroon: [number, number, number] = [125, 27, 27];
    const cream: [number, number, number] = [232, 228, 220];
    const lightCream: [number, number, number] = [245, 243, 239];

    // Add decorative header bar
    doc.setFillColor(...maroon);
    doc.rect(0, 0, 210, 8, "F");

    // Add title
    doc.setTextColor(...maroon);
    doc.setFontSize(24);
    doc.text("BOGDANA & HAMZA", 105, 22, { align: "center" });

    doc.setFontSize(14);
    doc.text("Wedding RSVP Submissions", 105, 32, { align: "center" });

    // Add decorative line
    doc.setDrawColor(...maroon);
    doc.setLineWidth(0.5);
    doc.line(60, 38, 150, 38);

    // Add summary box
    doc.setFillColor(...cream);
    doc.roundedRect(14, 45, 182, 20, 2, 2, "F");

    doc.setFontSize(11);
    doc.setTextColor(...maroon);
    doc.text(`Total RSVPs: ${submissions.length}`, 24, 56);
    doc.text(`Total Guests: ${totalGuests}`, 90, 56);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 56);

    // Prepare table data
    const tableData = sortedSubmissions.map((sub) => {
      const guestsList = sub.guests && sub.guests.length > 0
        ? sub.guests.map(g => g.name).join("\n")
        : "-";

      return [
        sub.name,
        sub.email,
        guestsList,
        (1 + (sub.guests?.length || 0)).toString(),
        formatDate(sub.created_at)
      ];
    });

    autoTable(doc, {
      startY: 72,
      head: [["Name", "Email", "Additional Guests", "Total", "Submitted"]],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: maroon,
      },
      headStyles: {
        fillColor: maroon,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: lightCream,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 35 },
      },
    });

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...maroon);
    doc.rect(0, pageHeight - 8, 210, 8, "F");

    doc.save(`wedding-rsvp-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className={`dashboard-title ${playfair.className}`}>RSVP DASHBOARD</h1>
        <button onClick={handleLogout} className={`dashboard-logout ${playfair.className}`}>
          Sign Out
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card relative overflow-hidden pb-16">
          <p className={`stat-value ${playfair.className}`}>{submissions.length}</p>
          <p className={`stat-label ${playfair.className}`}>Total RSVPs</p>
          <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
            {[...Array(30)].map((_, i) => (
              <img
                key={i}
                src="/Border pattern 1.svg"
                alt=""
                className="h-8 flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
              />
            ))}
          </div>
        </div>
        <div className="stat-card relative overflow-hidden pb-16">
          <p className={`stat-value ${playfair.className}`}>{totalGuests}</p>
          <p className={`stat-label ${playfair.className}`}>Total Guests</p>
          <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
            {[...Array(30)].map((_, i) => (
              <img
                key={i}
                src="/Border pattern 1.svg"
                alt=""
                className="h-8 flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section-header">
          <h2 className={`dashboard-section-title ${playfair.className}`}>ALL SUBMISSIONS</h2>
          {submissions.length > 0 && (
            <div className="export-buttons">
              <button className={`export-button ${playfair.className}`} onClick={exportToCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                Export CSV
              </button>
              <button className={`export-button ${playfair.className}`} onClick={exportToPDF}>
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
          <div className="rsvp-table-container relative overflow-hidden pb-10">
            <div className={`loading-state ${playfair.className}`}>Loading submissions...</div>
            <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
              {[...Array(50)].map((_, i) => (
                <img
                  key={i}
                  src="/Border pattern 1.svg"
                  alt=""
                  className="h-8 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rsvp-table-container relative overflow-hidden pb-10">
            <div className={`empty-state ${playfair.className}`}>{error}</div>
            <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
              {[...Array(50)].map((_, i) => (
                <img
                  key={i}
                  src="/Border pattern 1.svg"
                  alt=""
                  className="h-8 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
                />
              ))}
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rsvp-table-container relative overflow-hidden pb-10">
            <div className={`empty-state ${playfair.className}`}>No RSVP submissions yet.</div>
            <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
              {[...Array(50)].map((_, i) => (
                <img
                  key={i}
                  src="/Border pattern 1.svg"
                  alt=""
                  className="h-8 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rsvp-table-container relative overflow-hidden pb-10">
            <table className={`rsvp-table ${playfair.className}`}>
              <thead>
                <tr>
                  <th className="sortable-header" onClick={() => handleSort("name")}>
                    Name <SortIcon columnKey="name" />
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("email")}>
                    Email <SortIcon columnKey="email" />
                  </th>
                  <th>Additional Guests</th>
                  <th className="sortable-header" onClick={() => handleSort("guests")}>
                    Total Guests <SortIcon columnKey="guests" />
                  </th>
                  <th className="sortable-header" onClick={() => handleSort("created_at")}>
                    Submitted <SortIcon columnKey="created_at" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.name}</td>
                    <td>{submission.email}</td>
                    <td>
                      {submission.guests && submission.guests.length > 0 ? (
                        <ul className="guest-list">
                          {submission.guests.map((guest, index) => (
                            <li key={index}>{guest.name}</li>
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
            <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden w-full">
              {[...Array(50)].map((_, i) => (
                <img
                  key={i}
                  src="/Border pattern 1.svg"
                  alt=""
                  className="h-8 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={playfair.className}>Delete RSVP</AlertDialogTitle>
            <AlertDialogDescription className={playfair.className}>
              Are you sure you want to delete the RSVP for &quot;{deleteDialog.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} className={playfair.className}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={playfair.className}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editDialog.open} onOpenChange={closeEditDialog}>
        <AlertDialogContent className="edit-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle className={playfair.className}>Edit RSVP</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="edit-form">
            <div className="edit-field">
              <label className={playfair.className}>Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className={playfair.className}
              />
            </div>
            <div className="edit-field">
              <label className={playfair.className}>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className={playfair.className}
              />
            </div>
            <div className="edit-guests-section">
              <div className="edit-guests-header">
                <label className={playfair.className}>Additional Guests</label>
                <button
                  type="button"
                  className={`add-guest-button ${playfair.className}`}
                  onClick={addEditGuest}
                >
                  + Add Guest
                </button>
              </div>
              {editForm.guests.map((guest, index) => (
                <div key={index} className="edit-guest-card">
                  <div className="edit-guest-header">
                    <span className={playfair.className}>Guest {index + 2}</span>
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
                    className={playfair.className}
                  />
                </div>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeEditDialog} className={playfair.className}>
              Cancel
            </AlertDialogCancel>
            <button
              className={`save-button ${playfair.className}`}
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
