import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { digital_pass } from "../../api/config";
import debounce from "lodash.debounce";
import Calender from "./Calender"; // Adjust path as needed
import CalenderNoTime from "./CalenderNoTime";

const API_BASE = digital_pass;

interface User {
    recordId: string;
    responseId: string;
    status: "pending" | "approved" | "rejected";
    submissionDate: string;
    submittedBy: string;
    name: string;
    phone: string;
    email: string;
    photo: string;
    formData: Record<string, any>;
}

interface UserBooking {
    responseId: string;
    count: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    // Add other fields as needed
}

interface TimeSlot {
    start: string;
    end: string;
    _id: string;
}

interface CalendarNoTimeProps {
    eventTimeSlots?: { start: string; end: string }[];
    capacity?: number;
    users?: any[];
}

const PassUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [userData, setUserData] = useState<UserBooking[]>([]);
    const [totalSeatsCount, setTotalSeatsCount] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    const [viewUser, setViewUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Record<string, any>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const [updateModal, setUpdateModal] = useState(false);
    const [modalAction, setModalAction] = useState<{ ids: string[]; status: "approved" | "rejected" } | null>(null);
    const [comment, setComment] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const commentRef = useRef<HTMLTextAreaElement>(null);
    const debouncedSearch = useCallback(debounce((term: string) => setSearchTerm(term), 300), []);

    const isNoTimeEvent = useMemo(() => {
        return (
            timeSlots.length === 0 ||
            timeSlots.every(slot => slot.start === "" && slot.end === "")
        );
    }, [timeSlots]);

    // Helper function to extract unique locations from event data (preferred over user data for consistency)
    const extractLocationsFromEventData = (locationNames: any): string[] => {
        if (Array.isArray(locationNames)) {
            return locationNames.filter((loc: string) => loc && loc.trim() !== '');
        }
        return [];
    };

    const [locationData, setLocationData] = useState<string[]>([]);

    const fetchUsers = useCallback(async () => {
        if (!userId) {
            toast.error("No event ID provided");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/displayAllApplay/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch applications");
            const data = await res.json();

            setLocationData(extractLocationsFromEventData(data.event?.locationNames || []));
            setAvailableLocations(extractLocationsFromEventData(data.event?.locationNames || [])); // Sync with locationData for consistency
            setTotalSeatsCount(data.event?.totalSeatsCount || 0);
            setStartDate(data.event?.startDate || "");
            setEndDate(data.event?.endDate || "");
            setTimeSlots(data.event?.timeSlots || []);

            if (data.success && Array.isArray(data.users)) {
                const formatted = data.users
                    .filter((u: any) => u?.responseId)
                    .map((u: any): User => ({
                        recordId: u._id || u.recordId || "",
                        responseId: u.responseId || "",
                        status: (u.status || "pending") as "pending" | "approved" | "rejected",
                        submissionDate: u.submissionDate || "",
                        submittedBy: u.submittedBy || "Unknown",
                        name: u.name || u.formData?.Name || u.formData?.name || "Unknown",
                        phone: u.phone || u.formData?.["Phone Number"] || u.formData?.phone || "",
                        email: u.email || u.formData?.Email || u.formData?.email || "",
                        photo: u.photo || u.formData?.Photo || "/placeholder-avatar.jpg",
                        formData: u.formData || {},
                    }));
                setUsers(formatted);

                const approvedUsers = formatted.filter((u: User) => u.status === "approved");
                const userBookings: UserBooking[] = approvedUsers.map((u: User) => ({
                    responseId: u.responseId,
                    count: parseInt(u.formData?.Count || u.formData?.count || "0") || 0,
                    startDate: u.formData?.["Start Date"] || u.formData?.startDate || data.event?.startDate || "",
                    endDate: u.formData?.["End Date"] || u.formData?.endDate || data.event?.endDate || "",
                    startTime: u.formData?.["Start Time"] || u.formData?.startTime || "",
                    endTime: u.formData?.["End Time"] || u.formData?.endTime || "",
                }));
                setUserData(userBookings);
            } else {
                setUsers([]);
                setUserData([]);
                toast.warn("No applications found");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setUsers([]);
            setUserData([]);
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(u =>
            u.name.toLowerCase().includes(term) ||
            u.phone.includes(term) ||
            u.email.toLowerCase().includes(term) ||
            String(u.formData?.Count || u.formData?.count || "").includes(term)
        );
    }, [users, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalApprovedCount = useMemo(() =>
        users
            .filter(u => u.status === "approved")
            .reduce((sum, u) => sum + (parseInt(u.formData?.Count || u.formData?.count || "0") || 0), 0),
        [users]
    );

    const remainingSeats = totalSeatsCount - totalApprovedCount;
    const isFull = totalApprovedCount >= totalSeatsCount;
    const progressPercent = Math.min((totalApprovedCount / totalSeatsCount) * 100, 100);

    const allSelected = currentUsers.length > 0 && currentUsers.every(u => selectedIds.has(u.responseId));
    const someSelected = currentUsers.some(u => selectedIds.has(u.responseId));

    const handleSelectAll = () => {
        if (allSelected) {
            const newSet = new Set(selectedIds);
            currentUsers.forEach(u => newSet.delete(u.responseId));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            currentUsers.forEach(u => newSet.add(u.responseId));
            setSelectedIds(newSet);
        }
    };

    const handleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedIds(newSet);
    };

    const getNewApprovedCount = (ids: string[]) => ids.reduce((sum, id) => {
        const user = users.find(u => u.responseId === id);
        if (user && user.status !== "approved") {
            return sum + (parseInt(user.formData?.Count || user.formData?.count || "0") || 0);
        }
        return sum;
    }, 0);

    const updateStatus = async (ids: string[], status: "approved" | "rejected" | "pending", comment = "") => {
        setSubmitting(true);
        try {
            const endpoint = ids.length === 1 ? `/applyPass/${ids[0]}` : '/applyPass/bulk';
            const body = ids.length === 1 ? { status, comment } : { ids, status, comment };
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Failed to update status");
            const data = await res.json();
            if (data.success) {
                setSelectedIds(new Set());
                toast.success(`${ids.length} application${ids.length > 1 ? 's' : ''} ${status}d!`);
                await fetchUsers();
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Network error");
        } finally {
            setSubmitting(false);
            if (updateModal) {
                setUpdateModal(false);
                setModalAction(null);
            }
            setComment("");
        }
    };

    const openStatusModal = (ids: string[], status: "approved" | "rejected") => {
        setModalAction({ ids, status });
        setComment("");
        setUpdateModal(true);
        setTimeout(() => commentRef.current?.focus(), 100);
    };

    // Helper function to get user's selected locations
    const getUserSelectedLocations = (value: any): string[] => {
        let userSelectedLocations: string[] = [];

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    userSelectedLocations = parsed
                        .filter((loc: any) =>
                            (loc.selected === undefined || loc.selected === true) &&
                            (loc.name || loc.address || loc)
                        )
                        .map((loc: any) => loc.name || loc.address || String(loc));
                } else {
                    userSelectedLocations = [String(parsed)];
                }
            } catch (e) {
                userSelectedLocations = [value];
            }
        } else if (Array.isArray(value)) {
            userSelectedLocations = value
                .filter((loc: any) => loc && (loc.selected === undefined || loc.selected === true))
                .map((loc: any) => typeof loc === 'string' ? loc : (loc.name || loc.address || String(loc)));
        }

        return userSelectedLocations.filter(loc => loc && loc.trim() !== '');
    };

    const handleEdit = async () => {
        if (!editingUser) return;
        const formData = new FormData();

        Object.entries(editForm).forEach(([key, value]) => {
            if (key.toLowerCase() !== "photo" && value !== undefined && value !== null) {
                const isTimeField =
                    key.toLowerCase().includes('start time') ||
                    key.toLowerCase().includes('end time');

                if (isTimeField && (value === "" || value === null || value === undefined)) {
                    formData.append(key, "");
                    return;
                }

                if ((key.toLowerCase().includes('location') || key.toLowerCase().includes('address')) && Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (photoFile) formData.append("photo", photoFile);

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/applyPass/editPass/${editingUser.recordId}`, {
                method: "PATCH",
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to update");
            const data = await res.json();
            if (data.success) {
                toast.success("Updated!");
                setEditingUser(null);
                setEditForm({});
                setPhotoFile(null);
                setPhotoPreview("");
                await fetchUsers();
            } else {
                toast.error(data.message || "Failed");
            }
        } catch (err) {
            console.error("Edit error:", err);
            toast.error("Save failed");
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
    };

    const formatDate = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">No Event ID</h1>
                    <p className="text-gray-600">Please provide a valid event ID.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
            <ToastContainer position="top-right" theme="colored" autoClose={2500} />

            {/* Header - Smaller & Cleaner */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-lg shadow hover:shadow-md transition">
                            <ArrowBackIcon fontSize="small" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Pass Applications</h1>
                            <p className="text-sm text-gray-600">
                                Total Seats: <strong>{totalSeatsCount}</strong>
                            </p>
                        </div>
                    </div>
                </div>
                {totalSeatsCount > 0 && (
                    isNoTimeEvent ? (
                        <CalenderNoTime
                            eventTimeSlots={timeSlots}
                            capacity={totalSeatsCount}
                            users={userData}
                        />
                    ) : (
                        <Calender
                            eventTimeSlots={timeSlots}
                            capacity={totalSeatsCount}
                            users={userData}
                        />
                    )
                )}

                {/* Search - Smaller */}
                <div className="relative mt-5 max-w-xl">
                    <SearchIcon className="absolute left-4 top-3 text-gray-400" fontSize="small" />
                    <input
                        type="text"
                        placeholder="Search name, phone, email, count..."
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {selectedIds.size > 0 && (
                    <div className="p-4 bg-indigo-600 text-white text-sm font-medium flex justify-between items-center">
                        <span>{selectedIds.size} selected</span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => openStatusModal(Array.from(selectedIds), "approved")}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white text-green-600 rounded-lg text-xs font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircleIcon fontSize="small" /> Approve
                            </button>
                            <button
                                onClick={() => openStatusModal(Array.from(selectedIds), "rejected")}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 rounded-lg text-xs font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CancelIcon fontSize="small" /> Reject
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="p-16 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 text-sm">No applications found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left">
                                            <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={handleSelectAll} size="small" />
                                        </th>
                                        <th className="px-5 py-3 text-left">Applicant</th>
                                        <th className="px-5 py-3 text-left">Contact</th>
                                        <th className="px-5 py-3 text-left">Submitted</th>
                                        <th className="px-5 py-3 text-left text-indigo-600 font-bold">Count</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {currentUsers.map((user) => {
                                        const count = user.formData?.Count || user.formData?.count || "—";
                                        const statusLabel = user.status.charAt(0).toUpperCase() + user.status.slice(1);
                                        const statusClass = user.status === "approved"
                                            ? "bg-green-100 text-green-700 border-green-400"
                                            : user.status === "rejected"
                                                ? "bg-red-100 text-red-700 border-red-400"
                                                : "bg-amber-100 text-amber-700 border-amber-400";
                                        return (
                                            <tr key={user.responseId} className="hover:bg-gray-50 transition">
                                                <td className="px-5 py-4">
                                                    <Checkbox checked={selectedIds.has(user.responseId)} onChange={() => handleSelect(user.responseId)} size="small" />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.photo}
                                                            alt=""
                                                            className="w-10 h-10 rounded-full object-cover border"
                                                            onError={(e) => (e.target as any).src = "/placeholder-avatar.jpg"}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            {user.phone || "—"}
                                                            {user.phone && (
                                                                <button onClick={() => copyToClipboard(user.phone)} title="Copy">
                                                                    <ContentCopyIcon fontSize="small" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="text-gray-500">{user.email || "—"}</div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-gray-500">{formatDate(user.submissionDate)}</td>
                                                <td className="px-5 py-4">
                                                    <span className="text-2xl font-bold text-indigo-600">
                                                        {count === "—" ? "—" : Number(count).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setViewUser(user)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                            title="View"
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setEditForm({ ...user.formData });
                                                                setPhotoPreview(user.photo);
                                                            }}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </button>
                                                        <button
                                                            onClick={() => openStatusModal([user.recordId], "approved")}
                                                            disabled={submitting}
                                                            className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-green-600 hover:bg-green-100 rounded-lg"
                                                            title="Approve"
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </button>
                                                        <button
                                                            onClick={() => openStatusModal([user.recordId], "rejected")}
                                                            disabled={submitting}
                                                            className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:bg-red-100 rounded-lg"
                                                            title="Reject"
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
                                    <span className="font-medium">{filteredUsers.length}</span> results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors ${currentPage === page
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* View Modal */}
            {viewUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">View Application Details</h2>
                            <button onClick={() => setViewUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-sm font-medium mb-3">Photo</label>
                                <img
                                    src={viewUser.photo}
                                    alt=""
                                    className="w-full rounded-xl object-cover shadow"
                                    onError={(e) => (e.target as any).src = "/placeholder-avatar.jpg"}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <p className="text-lg font-semibold">{viewUser.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <p>{viewUser.phone || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p>{viewUser.email || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                                    <p>{viewUser.submittedBy}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                                    <p>{formatDate(viewUser.submissionDate)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${viewUser.status === "approved"
                                            ? "bg-green-100 text-green-700 border-green-400"
                                            : viewUser.status === "rejected"
                                                ? "bg-red-100 text-red-700 border-red-400"
                                                : "bg-amber-100 text-amber-700 border-amber-400"
                                            }`}
                                    >
                                        {viewUser.status.charAt(0).toUpperCase() + viewUser.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {parseInt(viewUser.formData?.Count || viewUser.formData?.count || "0") || "—"}
                                    </p>
                                </div>
                                {/* Form Data */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                                    {Object.entries(viewUser.formData)
                                        .filter(([k]) => !k.toLowerCase().includes("photo"))
                                        .map(([key, value]) => (
                                            <div key={key} className="border-b pb-2 last:border-b-0">
                                                <p className="font-medium text-gray-900 capitalize">{key}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal for Bulk */}
            {updateModal && modalAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setUpdateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modalAction.status === "approved" ? "Approve" : "Reject"} {modalAction.ids.length} Application
                                {modalAction.ids.length > 1 ? "s" : ""}
                            </h2>
                            <button onClick={() => setUpdateModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {modalAction.status === "approved" ? "Approve" : "Reject"} the selected application
                                {modalAction.ids.length > 1 ? "s" : ""}?
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Comment (Optional)</label>
                                <textarea
                                    ref={commentRef}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment or reason..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => setUpdateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateStatus(modalAction.ids, modalAction.status, comment)}
                                disabled={submitting}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${modalAction.status === "approved"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-red-600 text-white hover:bg-red-700"
                                    } disabled:opacity-50`}
                            >
                                {submitting ? "Processing..." : modalAction.status.charAt(0).toUpperCase() + modalAction.status.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Edit Application</h2>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-sm font-medium mb-3">Photo</label>
                                <img src={photoPreview || editingUser.photo} alt="" className="w-full rounded-xl object-cover shadow" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPhotoFile(file);
                                            const r = new FileReader();
                                            r.onloadend = () => setPhotoPreview(r.result as string);
                                            r.readAsDataURL(file);
                                        }
                                    }}
                                    className="mt-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-indigo-600 file:text-white text-sm"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                {Object.entries(editForm)
                                    .filter(([key]) => !key.toLowerCase().includes("photo"))
                                    .map(([key, value]) => {
                                        // Normalize keys for time fields (handle variations like "Start Time", "start time", etc.)
                                        const normalizedKey = key.toLowerCase().replace(/\s+/g, " ");
                                        const isLocationsField = normalizedKey.includes("location") || normalizedKey.includes("address");
                                        const isStartTimeField = normalizedKey.includes("start time");
                                        const isEndTimeField = normalizedKey.includes("end time");

                                        if (isLocationsField) {
                                            const userSelectedLocations = getUserSelectedLocations(value);

                                            return (
                                                <div key={key}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Locations</label>
                                                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                                                        {locationData.map((location, index) => {
                                                            const isChecked = userSelectedLocations.includes(location);
                                                            return (
                                                                <div key={index} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${key}-${index}`}
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            const updatedSelectedLocations = e.target.checked
                                                                                ? [...userSelectedLocations, location]
                                                                                : userSelectedLocations.filter((loc) => loc !== location);
                                                                            setEditForm((prev) => ({
                                                                                ...prev,
                                                                                [key]: updatedSelectedLocations,
                                                                            }));
                                                                        }}
                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                    />
                                                                    <label
                                                                        htmlFor={`${key}-${index}`}
                                                                        className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                                                                    >
                                                                        {location}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {userSelectedLocations.length} of {locationData.length} locations selected
                                                    </p>
                                                </div>
                                            );
                                        } else if (isStartTimeField || isEndTimeField) {
                                            // Handle time slot selection as radio buttons - render once for time slots
                                            if (isStartTimeField) {
                                                const currentStartTime = editForm["Start Time"] || editForm["start time"] || editForm.startTime || "";
                                                const currentEndTime = editForm["End Time"] || editForm["end time"] || editForm.endTime || "";

                                                return (
                                                    <div key="timeSlot-selection">
                                                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Time Slot</label>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                                                            {timeSlots.map((timeSlot, index) => {
                                                                const isSelected =
                                                                    currentStartTime === timeSlot.start && currentEndTime === timeSlot.end;
                                                                return (
                                                                    <div key={index} className="flex items-center">
                                                                        <input
                                                                            type="radio"
                                                                            id={`timeSlot-${index}`}
                                                                            name="timeSlot"
                                                                            checked={isSelected}
                                                                            onChange={() => {
                                                                                setEditForm((prev) => ({
                                                                                    ...prev,
                                                                                    "Start Time": timeSlot.start,
                                                                                    "End Time": timeSlot.end,
                                                                                    startTime: timeSlot.start, // Fallback keys
                                                                                    endTime: timeSlot.end,
                                                                                }));
                                                                            }}
                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                                        />
                                                                        <label
                                                                            htmlFor={`timeSlot-${index}`}
                                                                            className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                                                                        >
                                                                            {timeSlot.start} - {timeSlot.end}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {(currentStartTime || currentEndTime) && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Selected: {currentStartTime} - {currentEndTime}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            // Skip rendering for end time field as it's handled above
                                            return null;
                                        }

                                        // Default input for other fields
                                        return (
                                            <div key={key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {key === "Count" || key.toLowerCase() === "count" ? "Number of Passes" : key}
                                                </label>
                                                <input
                                                    type={key === "Count" || key.toLowerCase() === "count" ? "number" : "text"}
                                                    value={value as string}
                                                    onChange={(e) =>
                                                        setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
                                                    }
                                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-300 text-sm"
                                                    min={key === "Count" || key.toLowerCase() === "count" ? "1" : undefined}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setEditingUser(null)} className="px-6 py-2.5 border rounded-lg text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={submitting}
                                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassUser;