import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useController } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import * as XLSX from "xlsx";
import {
    my_dashboard_all_event_users,
    SUB_EVENT,
    location,
    EVENT_API,
    MamberAPI
} from "../../../api/config";
import {
    Button,
    Checkbox,
    IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface FormData {
    eventName: string;
    attendanceName: string;
    img: FileList | null;
    locationId: string[];
    eventTypeId: string[];
}

interface Location { _id: string; name: string; }
interface EventType { _id: string; name: string; }
interface NestedUser { id: string; email?: string; phone?: string; }
interface Outsider { name: string; email?: string; phoneNumber?: string; }

const AddSubEvent: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const navigate = useNavigate();

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: { locationId: [], eventTypeId: [], img: null, attendanceName: "" },
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const outsiderFileInputRef = useRef<HTMLInputElement>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [eventTypesLoading, setEventTypesLoading] = useState(true);

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [outsiders, setOutsiders] = useState<Outsider[]>([]);

    // Outsider Groups (Departments)
    const [outsiderGroups, setOutsiderGroups] = useState<any[]>([]);
    const [selectedOutsiderGroups, setSelectedOutsiderGroups] = useState<string[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const locationController = useController({
        name: "locationId",
        control,
        rules: { validate: (v: string[]) => v.length > 0 || "Select at least one location" }
    });

    const eventTypeController = useController({
        name: "eventTypeId",
        control,
        rules: { validate: (v: string[]) => v.length > 0 || "Select at least one event type" }
    });

    // Cleanup preview
    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    // Load dashboard users
    useEffect(() => {
        if (!dashboardId) return;
        axios.get(`${my_dashboard_all_event_users}/${dashboardId}`)
            .then(res => {
                const users = res.data.success ? res.data.data : res.data.users || res.data;
                setAllUsers(Array.isArray(users) ? users : []);
            })
            .catch(() => toast.error("Failed to load users"));
    }, [dashboardId]);

    // Load locations
    useEffect(() => {
        axios.get(location)
            .then(res => setLocations(Array.isArray(res.data) ? res.data : res.data.data || []))
            .catch(() => toast.error("Failed to load locations"))
            .finally(() => setLocationsLoading(false));
    }, []);

 

    useEffect(() => {
        axios
            .get(EVENT_API, {
                params: { isActive: true },  // ✅ Sending false here
            })
            .then(res =>
                setEventTypes(
                    Array.isArray(res.data) ? res.data : res.data.data || []
                )
            )
            .catch(() => {
                setEventTypes([
                    { _id: "1", name: "Workshop" },
                    { _id: "2", name: "Conference" },
                    { _id: "3", name: "Seminar" },
                ]);
            })
            .finally(() => setEventTypesLoading(false));
    }, []);

    // Load outsider groups (departments)
    useEffect(() => {
        axios.get(MamberAPI)
            .then(res => {
                if (res.data.success) setOutsiderGroups(res.data.members || []);
            })
            .catch(() => toast.error("Failed to load departments"))
            .finally(() => setLoadingGroups(false));
    }, []);

    // Search with debounce
    const debouncedSearch = useCallback((query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const filtered = allUsers.filter(u =>
            (u.email?.toLowerCase().includes(query.toLowerCase())) ||
            (u.phone?.includes(query))
        );
        setSearchResults(filtered);
    }, [allUsers]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // ... later inside the component
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            debouncedSearch(query);
        }, 300);
    };
    const handleAddUsers = () => {
        const newUsers = searchResults
            .filter(u => selectedUsers.includes(u._id))
            .map(u => ({ id: u._id, email: u.email, phone: u.phone }))
            .filter(u => !nestedUsers.some(n => n.id === u.id));
        setNestedUsers(prev => [...prev, ...newUsers]);
        setSelectedUsers([]);
        setSearchResults([]);
        toast.success(`${newUsers.length} users added`);
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !allUsers.length) return;

        let totalAdded = 0;
        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = new Uint8Array(reader.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

                    const added: NestedUser[] = [];
                    rows.forEach(row => {
                        const email = row.email || row.Email;
                        const phone = row.phone || row.Phone;
                        const user = allUsers.find(u =>
                            (email && u.email === email) || (phone && u.phone === phone)
                        );
                        if (user && !nestedUsers.some(n => n.id === user._id)) {
                            added.push({ id: user._id, email: user.email, phone: user.phone });
                        }
                    });

                    if (added.length > 0) {
                        setNestedUsers(prev => [...prev, ...added]);
                        totalAdded += added.length;
                    }
                } catch (err) {
                    toast.error(`Failed to read ${file.name}`);
                }
            };
            reader.readAsArrayBuffer(file);
        }

        if (totalAdded > 0) toast.success(`Added ${totalAdded} users from Excel`);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (data: FormData) => {
        if (!dashboardId) return toast.error("Invalid event");
        if (data.locationId.length === 0) return toast.error("Select location");
        if (data.eventTypeId.length === 0) return toast.error("Select event type");
        if (!data.img?.[0]) return toast.error("Image required");
        if (!data.attendanceName) return toast.error("Attendance name required");
        if (!startDate || !endDate) return toast.error("Dates required");
        if (nestedUsers.length === 0) return toast.error("Add at least one user");

        const formData = new FormData();
        formData.append("name", data.eventName || "Sub Event");
        formData.append("attendanceName", data.attendanceName);
        formData.append("img", data.img[0]);
        formData.append("location", JSON.stringify(data.locationId));
        formData.append("events", JSON.stringify(data.eventTypeId));
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (startTime) formData.append("startTime", startTime);
        if (endTime) formData.append("endTime", endTime);

        formData.append("geoAttendance", JSON.stringify(nestedUsers.map(u => u.id)));

        if (selectedOutsiderGroups.length > 0) {
            formData.append("outsider", JSON.stringify(selectedOutsiderGroups));
        }

        if (outsiders.length > 0) {
            formData.append("outsider", JSON.stringify(outsiders));
        }

        try {
            await axios.post(`${SUB_EVENT}/${dashboardId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Sub-event created!", { onClose: () => navigate("/my_dashboard") });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create sub-event");
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add Sub Event</h2>
                    <ClearIcon onClick={() => navigate(-1)} className="cursor-pointer text-gray-600 hover:text-red-500" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("eventName")} placeholder="Event Name (optional)" className="p-3 border rounded-lg" />
                        <input {...register("attendanceName", { required: true })} placeholder="Attendance Name *" className="p-3 border rounded-lg" />
                    </div>

                    <input type="file" accept="image/*" {...register("img", { required: true })} onChange={e => {
                        const file = e.target.files?.[0];
                        setImagePreview(file ? URL.createObjectURL(file) : null);
                    }} className="block w-full" />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg" />}

                    {/* Location & Event Type */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Locations *</h3>
                            <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                                {locations.map(loc => (
                                    <label key={loc._id} className="flex items-center p-2 hover:bg-gray-50">
                                        <Checkbox checked={locationController.field.value.includes(loc._id)}
                                            onChange={e => {
                                                const val = e.target.checked
                                                    ? [...locationController.field.value, loc._id]
                                                    : locationController.field.value.filter(id => id !== loc._id);
                                                locationController.field.onChange(val);
                                            }} />
                                        <span className="ml-2">{loc.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Event Types *</h3>
                            <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                                {eventTypes.map(type => (
                                    <label key={type._id} className="flex items-center p-2 hover:bg-gray-50">
                                        <Checkbox checked={eventTypeController.field.value.includes(type._id)}
                                            onChange={e => {
                                                const val = e.target.checked
                                                    ? [...eventTypeController.field.value, type._id]
                                                    : eventTypeController.field.value.filter(id => id !== type._id);
                                                eventTypeController.field.onChange(val);
                                            }} />
                                        <span className="ml-2">{type.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="p-3 border rounded-lg" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="p-3 border rounded-lg" />
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-3 border rounded-lg" />
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="p-3 border rounded-lg" />
                    </div>

                    {/* Nested Users */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-bold mb-4">Select Nested Users *</h3>
                        <input type="text" placeholder="Search by email/phone" onChange={handleSearch} className="w-full p-3 border rounded-lg mb-3" />
                        <div className="max-h-48 overflow-y-auto border rounded-lg mb-3">
                            {searchResults.map(u => (
                                <label key={u._id} className="flex items-center p-2 hover:bg-gray-50">
                                    <Checkbox checked={selectedUsers.includes(u._id)}
                                        onChange={() => setSelectedUsers(prev =>
                                            prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]
                                        )} />
                                    <span className="ml-2">{u.email || u.phone}</span>
                                </label>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddUsers} disabled={!selectedUsers.length}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                            Add Selected ({selectedUsers.length})
                        </button>

                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" multiple onChange={handleExcelUpload} className="mt-4 block w-full" />
                    </div>

                    {nestedUsers.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <h4 className="font-semibold">Added Users ({nestedUsers.length})</h4>
                                <button type="button" onClick={() => setNestedUsers([])} className="text-red-600">Clear All</button>
                            </div>
                            {nestedUsers.map((u, i) => (
                                <div key={i} className="flex justify-between items-center py-1">
                                    <span>{u.email || u.phone}</span>
                                    <IconButton size="small" onClick={() => setNestedUsers(prev => prev.filter((_, idx) => idx !== i))}>
                                        <CancelIcon fontSize="small" color="error" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Outsider Groups */}
                    <div className="border-t pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <PersonAddIcon color="primary" />
                            <h3 className="text-xl font-bold">Add Guests by Department</h3>
                        </div>
                        {loadingGroups ? <p>Loading departments...</p> : outsiderGroups.map(group => (
                            <label key={group._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3 cursor-pointer hover:bg-gray-100">
                                <div>
                                    <div className="font-semibold">{group.typeName}</div>
                                    <div className="text-sm text-gray-600">{group.users?.length || 0} members</div>
                                </div>
                                <Checkbox
                                    checked={selectedOutsiderGroups.includes(group._id)}
                                    onChange={() => setSelectedOutsiderGroups(prev =>
                                        prev.includes(group._id)
                                            ? prev.filter(id => id !== group._id)
                                            : [...prev, group._id]
                                    )}
                                />
                            </label>
                        ))}
                        {selectedOutsiderGroups.length > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg text-green-800 font-medium">
                                {selectedOutsiderGroups.length} department(s) selected
                            </div>
                        )}
                    </div>

                    <Button type="submit" variant="contained" fullWidth startIcon={<CheckCircleIcon />}
                        sx={{ mt: 4, py: 2, background: "linear-gradient(to right, #27ae60, #27ae93)", fontWeight: "bold" }}>
                        Create Sub Event
                    </Button>
                </form>
            </div>
        </>
    );
};

export default AddSubEvent;