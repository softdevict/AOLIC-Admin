

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    ManageAccounts,
    Edit,
    Close,
    Add,
    CheckCircle,
    Cancel,
    Email,
    Phone,
    Business,
    Check,
} from "@mui/icons-material";
import {
    hod,
    searchUser_email_phone,
    event_name,
    SupervisorAPI
} from "../../../../api/config";

interface EventItem {
    _id: string;
    name: string;
    assigned?: boolean; // Optional for supervisor-specific fetches
    cardType?: string;
}

interface Department {
    _id: string;
    name: string;
}

interface Supervisor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    totalEvents: number;
    events: EventItem[];
    createdAt: string;
    isActiveSupervisor?: boolean;
    departmentName?: string; // Legacy single department field
    supervisorTypes?: {
        _id: string;
        name: string;
    }[];
}

interface ApiResponse {
    success: boolean;
    count: number;
    message: string;
    data: Supervisor[];
}

interface SearchUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

const SupervisorsList: React.FC = () => {
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [filteredSupervisors, setFilteredSupervisors] = useState<Supervisor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);

    // Department Modal
    const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false);
    const [selectedSupervisorForDept, setSelectedSupervisorForDept] = useState<Supervisor | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [assigningDepartment, setAssigningDepartment] = useState<boolean>(false);

    // Events (shared)
    const [allEvents, setAllEvents] = useState<EventItem[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [eventLoading, setEventLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    // Departments
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentLoading, setDepartmentLoading] = useState<boolean>(false);
    const [departmentSearch, setDepartmentSearch] = useState<string>("");
    const filteredDepartmentsList = departments.filter((dept) =>
        dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );

    // Fetch Departments
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setDepartmentLoading(true);
            const response = await axios.get(SupervisorAPI);
            const deptData = response.data.supervisors || response.data.data || response.data || [];
            if (Array.isArray(deptData)) {
                setDepartments(deptData);
            } else {
                toast.error("Invalid departments data received.");
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast.error("Failed to fetch departments");
        } finally {
            setDepartmentLoading(false);
        }
    };

    // Fetch Supervisors
    useEffect(() => {
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const res = await axios.get<ApiResponse>(hod);
            if (res.data.success) {
                const supervisorsWithStatus = res.data.data.map((sup: Supervisor) => ({
                    ...sup,
                    isActiveSupervisor: sup.isActiveSupervisor ?? false,
                    supervisorTypes: sup.supervisorTypes || [],
                }));
                setSupervisors(supervisorsWithStatus);
                setFilteredSupervisors(supervisorsWithStatus);
            } else {
                toast.error("Failed to fetch supervisors.");
            }
        } catch (error) {
            console.error("Error fetching supervisors:", error);
            toast.error("Server error while fetching supervisors.");
        } finally {
            setLoading(false);
        }
    };

    // Search User (debounced)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await axios.get(`${searchUser_email_phone}?email=${encodeURIComponent(searchQuery)}`);
                setSearchResults(res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
            } catch (error) {
                console.error("Error searching users:", error);
                toast.error("Error searching users.");
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch Events (unified: optional supervisorId)
    const fetchAllEvents = async (supervisorId?: string) => {
        try {
            setEventLoading(true);

            if (supervisorId) {
                const res = await axios.get(`${event_name}/${supervisorId}`);

                if (res.data.success) {
                    const cards = res.data.cards || res.data.allEvents || [];

                    setAllEvents(cards);

                    // AUTO SELECT ASSIGNED CARDS ⚡
                    setSelectedEvents(
                        cards
                            .filter((card: EventItem) => card.assigned === true)
                            .map((card: EventItem) => card._id)
                    );

                    return;
                }
            }

            // If no supervisor (for create)
            const res = await axios.get(event_name);
            setAllEvents(res.data.events || []);
            setSelectedEvents([]);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load events.");
        } finally {
            setEventLoading(false);
        }
    };

    // Handle User Selection (Create Modal)
    const handleSelectUser = async (user: SearchUser) => {
        setSelectedUser(user);
        setSelectedEvents([]); // Reset selections
        await fetchAllEvents(); // No ID for new user
    };

    // Toggle Event Selection
    const handleToggleEvent = (eventId: string) => {
        setSelectedEvents((prev) =>
            prev.includes(eventId)
                ? prev.filter((id) => id !== eventId)
                : [...prev, eventId]
        );
    };

    // Select/Deselect All Events
    const handleSelectAll = () => {
        if (selectedEvents.length === allEvents.length) {
            setSelectedEvents([]);
        } else {
            setSelectedEvents(allEvents.map((e) => e._id));
        }
    };

    // Save New Supervisor
    const handleSaveSupervisor = async () => {
        if (!selectedUser || selectedEvents.length === 0) {
            toast.error("Please select a user and at least one event.");
            return;
        }
        try {
            setSaving(true);
            const res = await axios.post(hod, {
                userId: selectedUser._id,
                cardIds: selectedEvents,
            });
            if (res.data.success) {
                toast.success(`${selectedUser.name} added as Supervisor!`);
                await fetchSupervisors();
                closeCreateModal();
            } else {
                toast.error(res.data.message || "Failed to create supervisor.");
            }
        } catch (error) {
            console.error("Error creating supervisor:", error);
            toast.error("Error creating supervisor.");
        } finally {
            setSaving(false);
        }
    };

    // Save Updated Events
    const handleSaveEvents = async () => {
        if (!selectedSupervisor) return;
        try {
            setSaving(true);
            const res = await axios.post(`${hod}/${selectedSupervisor._id}`, {
                cardIds: selectedEvents,
            });
            if (res.data.success) {
                toast.success("Events updated successfully!");
                await fetchSupervisors();
                closeEditModal();
            } else {
                toast.error(res.data.message || "Failed to update events.");
            }
        } catch (error) {
            console.error("Error updating events:", error);
            toast.error("Error updating events.");
        } finally {
            setSaving(false);
        }
    };

    // Toggle Supervisor Status
    const toggleSupervisor = async (userId: string) => {
        // Optimistic update
        setSupervisors((prev) =>
            prev.map((sup) =>
                sup._id === userId
                    ? { ...sup, isActiveSupervisor: !sup.isActiveSupervisor }
                    : sup
            )
        );
        setFilteredSupervisors((prev) =>
            prev.map((sup) =>
                sup._id === userId
                    ? { ...sup, isActiveSupervisor: !sup.isActiveSupervisor }
                    : sup
            )
        );

        try {
            const res = await axios.get(`${hod}/${userId}`);
            if (res.data.success) {
                toast.success(res.data.message || "Status updated successfully.");
            } else {
                // Revert optimistic update on failure
                await fetchSupervisors();
                toast.error(res.data.message || "Failed to toggle supervisor.");
            }
        } catch (error) {
            // Revert on error
            await fetchSupervisors();
            console.error("Error toggling supervisor:", error);
            toast.error("Error toggling supervisor.");
        }
    };

    // Open Department Modal (pre-populate selected)
    const handleOpenDepartmentModal = (sup: Supervisor) => {
        setSelectedSupervisorForDept(sup);
        setSelectedDepartments(sup.supervisorTypes?.map((d) => d._id) || []);
        setDepartmentSearch("");
        setShowDepartmentModal(true);
    };

    // Toggle Department Selection (for multiple)
    const handleToggleDepartment = (deptId: string) => {
        setSelectedDepartments((prev) =>
            prev.includes(deptId)
                ? prev.filter((id) => id !== deptId)
                : [...prev, deptId]
        );
    };

    // Assign Departments (add only new ones)
    const handleAssignDepartments = async () => {
        if (!selectedSupervisorForDept || selectedDepartments.length === 0) {
            toast.error("Please select at least one department.");
            return;
        }

        const currentDeptIds = selectedSupervisorForDept.supervisorTypes?.map((t) => t._id) || [];
        const toAdd = selectedDepartments.filter((id) => !currentDeptIds.includes(id));

        if (toAdd.length === 0) {
            toast.info("No new departments to assign. All selected are already assigned.");
            closeDepartmentModal();
            return;
        }

        try {
            setAssigningDepartment(true);
            const assignPromises = toAdd.map((deptId) =>
                axios.patch(`${SupervisorAPI}/addDepartment`, {
                    userId: selectedSupervisorForDept._id,
                    supervisorId: deptId,
                })
            );

            const results = await Promise.allSettled(assignPromises);
            const successes = results.filter(
                (result): result is PromiseFulfilledResult<any> => result.status === "fulfilled"
            );
            const failures = results.filter((result) => result.status === "rejected");

            if (successes.length > 0) {
                toast.success(`${successes.length} department(s) assigned successfully!`);
                await fetchSupervisors();
                closeDepartmentModal();
            }
            if (failures.length > 0) {
                toast.error(`Failed to assign ${failures.length} department(s).`);
            }
        } catch (error) {
            console.error("Error assigning departments:", error);
            toast.error("Error assigning departments.");
        } finally {
            setAssigningDepartment(false);
        }
    };

    // Open Edit Modal
    const handleEdit = async (sup: Supervisor) => {
        setSelectedSupervisor(sup);
        setSelectedEvents([]);
        setAllEvents([]);
        await fetchAllEvents(sup._id); // Pass ID for supervisor-specific fetch
        setShowEditModal(true);
    };

    // Filter Supervisors
    const handleFilterChange = (value: "all" | "active" | "inactive") => {
        setFilter(value);
        switch (value) {
            case "all":
                setFilteredSupervisors(supervisors);
                break;
            case "active":
                setFilteredSupervisors(supervisors.filter((sup) => sup.isActiveSupervisor));
                break;
            case "inactive":
                setFilteredSupervisors(supervisors.filter((sup) => !sup.isActiveSupervisor));
                break;
        }
    };

    // Close Modals
    const closeCreateModal = () => {
        setShowCreateModal(false);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedUser(null);
        setSelectedEvents([]);
        setAllEvents([]);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedSupervisor(null);
        setSelectedEvents([]);
        setAllEvents([]);
    };

    const closeDepartmentModal = () => {
        setShowDepartmentModal(false);
        setSelectedSupervisorForDept(null);
        setSelectedDepartments([]);
        setDepartmentSearch("");
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ManageAccounts className="text-blue-600 dark:text-blue-400" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Supervisors & Events</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value as "all" | "active" | "inactive")}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Supervisors</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                        <Add fontSize="small" />
                        Create Supervisor
                    </button>
                </div>
            </div>

            {/* Supervisors Table */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Loading supervisors...</p>
                    </div>
                ) : filteredSupervisors.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No supervisors found.</p>
                    </div>
                ) : (
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-left border-b border-gray-200 dark:border-gray-600">
                                <th className="px-4 py-3 font-semibold">#</th>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Phone</th>
                                <th className="px-4 py-3 font-semibold">Departments</th>
                                <th className="px-4 py-3 font-semibold">Events Assigned</th>
                                <th className="px-4 py-3 font-semibold text-center">Status</th>
                                <th className="px-4 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSupervisors.map((sup, index) => (
                                <tr
                                    key={sup._id}
                                    className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-600"
                                >
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-medium">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{sup.name}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{sup.email}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{sup.phone}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 ">
                                            {sup.supervisorTypes && sup.supervisorTypes.length > 0 ? (
                                                sup.supervisorTypes.map((dept) => (
                                                    <span
                                                        key={dept._id}
                                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium flex items-center gap-1"
                                                    >
                                                        {dept.name}
                                                        <Check className="text-green-600 text-xs" />
                                                    </span>
                                                ))
                                            ) : sup.departmentName ? (
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium flex items-center gap-1">
                                                    {sup.departmentName}
                                                    <Check className="text-green-600 text-xs" />
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500 text-sm italic">No Department</span>
                                            )}
                                            <button
                                                onClick={() => handleOpenDepartmentModal(sup)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                                title="Manage Departments"
                                            >
                                                <Business fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                {sup.events.length} event{sup.events.length !== 1 ? "s" : ""} assigned
                                            </span>
                                            {sup.events.length > 0 ? (
                                                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-0.5 max-h-20 overflow-y-auto">
                                                    {sup.events.map((e, eIndex) => (
                                                        <li key={eIndex} className="truncate">
                                                            {e.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">No events</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {sup.isActiveSupervisor ? (
                                            <span className="text-green-600 font-medium flex justify-center items-center gap-1">
                                                <CheckCircle fontSize="small" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-red-500 font-medium flex justify-center items-center gap-1">
                                                <Cancel fontSize="small" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => toggleSupervisor(sup._id)}
                                                className={`px-3 py-1 rounded text-white text-sm font-medium transition-colors ${sup.isActiveSupervisor
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                                    }`}
                                            >
                                                {sup.isActiveSupervisor ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(sup)}
                                                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                                            >
                                                <Edit fontSize="small" />
                                                Edit Events
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Supervisor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
                        <button
                            onClick={closeCreateModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Close fontSize="medium" />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Supervisor</h2>

                        {!selectedUser ? (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search by email or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {searching ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400">Searching...</p>
                                ) : searchResults.length === 0 ? (
                                    <p className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">No users found.</p>
                                ) : (
                                    <div className="max-h-72 overflow-y-auto border border-gray-300 rounded-lg">
                                        {searchResults.map((user) => (
                                            <div
                                                key={user._id}
                                                onClick={() => handleSelectUser(user)}
                                                className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center gap-2"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <Email fontSize="small" className="text-blue-600" />
                                                        {user.email}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <Phone fontSize="small" className="text-blue-600" />
                                                        {user.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50 dark:bg-gray-700">
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <Email fontSize="small" />
                                        {selectedUser.email} | <Phone fontSize="small" /> {selectedUser.phone}
                                    </p>
                                </div>

                                {eventLoading ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400">Loading events...</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                Select Events ({selectedEvents.length}/{allEvents.length})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleSelectAll}
                                                className="text-blue-600 text-sm hover:underline font-medium"
                                            >
                                                {selectedEvents.length === allEvents.length ? "Deselect All" : "Select All"}
                                            </button>
                                        </div>
                                        {allEvents.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400">No events available.</p>
                                        ) : (
                                            allEvents.map((ev) => (
                                                <label
                                                    key={ev._id}
                                                    className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                                                >
                                                    <span className="text-sm">{ev.name}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEvents.includes(ev._id)}
                                                        onChange={() => handleToggleEvent(ev._id)}
                                                        className="w-4 h-4 accent-blue-600 rounded"
                                                    />
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveSupervisor}
                                        disabled={saving || selectedEvents.length === 0}
                                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${saving || selectedEvents.length === 0
                                            ? "bg-green-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {saving ? "Saving..." : "Create Supervisor"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Events Modal */}
            {showEditModal && selectedSupervisor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Close fontSize="medium" />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Edit Events for {selectedSupervisor.name}
                        </h2>

                        {eventLoading ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">Loading events...</p>
                        ) : (
                            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        Events ({selectedEvents.length}/{allEvents.length})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSelectAll}
                                        className="text-blue-600 text-sm hover:underline font-medium"
                                    >
                                        {selectedEvents.length === allEvents.length ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                                {allEvents.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400">No events available.</p>
                                ) : (
                                    allEvents.map((ev) => (
                                        <label
                                            key={ev._id}
                                            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                                        >
                                            <span className="text-sm">{ev.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.includes(ev._id)}
                                                onChange={() => handleToggleEvent(ev._id)}
                                                className="w-4 h-4 accent-blue-600 rounded"
                                            />
                                        </label>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEvents}
                                disabled={saving}
                                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${saving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Departments Modal */}
            {showDepartmentModal && selectedSupervisorForDept && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm relative shadow-2xl">
                        <button
                            onClick={closeDepartmentModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Close fontSize="medium" />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Business className="text-blue-600" />
                            Assign Departments
                        </h2>

                        {/* Supervisor Info */}
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">{selectedSupervisorForDept.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupervisorForDept.email}</p>
                            {selectedSupervisorForDept.supervisorTypes && selectedSupervisorForDept.supervisorTypes.length > 0 && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                    Current: {selectedSupervisorForDept.supervisorTypes.map((d) => d.name).join(", ")}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                To Assign: {selectedDepartments.length}
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={departmentSearch}
                            onChange={(e) => setDepartmentSearch(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg bg-white dark:bg-gray-700">
                            {departmentLoading ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading departments...</p>
                            ) : filteredDepartmentsList.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    {departmentSearch ? "No matching departments" : "No departments available"}
                                </p>
                            ) : (
                                filteredDepartmentsList.map((dept) => (
                                    <label
                                        key={dept._id}
                                        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.includes(dept._id)}
                                                onChange={() => handleToggleDepartment(dept._id)}
                                                className="w-4 h-4 accent-blue-600 rounded"
                                            />
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {dept.name}
                                            </span>
                                        </div>
                                        {selectedDepartments.includes(dept._id) && (
                                            <Check className="text-green-600" fontSize="small" />
                                        )}
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDepartmentModal}
                                disabled={assigningDepartment}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssignDepartments}
                                disabled={assigningDepartment || selectedDepartments.length === 0}
                                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${assigningDepartment || selectedDepartments.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {assigningDepartment ? "Assigning..." : `Assign ${selectedDepartments.length} Dept(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorsList;