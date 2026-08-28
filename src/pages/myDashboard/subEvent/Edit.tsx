import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useController } from "react-hook-form";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import * as XLSX from "xlsx";
import {
    my_dashboard_all_event_users,
    my_dashboard_1_user_card_details,
    SUB_EVENT,
    location,
    EVENT_API,
    MamberAPI
} from "../../../api/config";
import { Button, Checkbox, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
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
interface NestedUser { id: string; name?: string; email?: string; phone?: string; }
interface Outsider { name: string; email?: string; phoneNumber?: string; }

const EditSubEvent: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const locationHook = useLocation();
    const { parentId } = (locationHook.state as { parentId?: string } | undefined) || {};
    const navigate = useNavigate();

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: { locationId: [], eventTypeId: [], img: null, attendanceName: "" },
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const outsiderFileInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Fixed: useRef instead of state

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [allUsers, setAllUsers] = useState<NestedUser[]>([]);
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [outsiders, setOutsiders] = useState<Outsider[]>([]);
    const [searchResults, setSearchResults] = useState<NestedUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Outsider Groups
    const [outsiderGroups, setOutsiderGroups] = useState<any[]>([]);
    const [selectedOutsiderGroups, setSelectedOutsiderGroups] = useState<string[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const locationController = useController({ name: "locationId", control, rules: { required: "Select at least one location" } });
    const eventTypeController = useController({ name: "eventTypeId", control, rules: { required: "Select at least one event type" } });

    // Cleanup preview
    useEffect(() => {
        return () => { if (imagePreview && !imagePreview.startsWith("http")) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    // Load sub-event data
    useEffect(() => {
        if (!dashboardId) return;

        const fetchEvent = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${my_dashboard_1_user_card_details}/${dashboardId}`);
                const event = data.data?.[0];

                if (!event) throw new Error("Event not found");

                reset({
                    eventName: event.name || "",
                    attendanceName: event.attendanceName || "",
                    locationId: event.location?.map((l: any) => l._id || l) || [],
                    eventTypeId: event.events?.map((e: any) => e._id || e) || [],
                    img: null,
                });

                setStartDate(event.startDate?.split("T")[0] || "");
                setEndDate(event.endDate?.split("T")[0] || "");
                setStartTime(event.startTime || "");
                setEndTime(event.endTime || "");
                if (event.img) setImagePreview(event.img);

                // Load nested users
                if (Array.isArray(event.geoAttendance)) {
                    setNestedUsers(event.geoAttendance.map((u: any) => ({
                        id: u._id || u.id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone
                    })));
                }

                // Load outsiders (manual or groups)
                if (Array.isArray(event.outsider)) {
                    const isManual = event.outsider.some((o: any) => o.name);
                    if (isManual) {
                        setOutsiders(event.outsider);
                    } else {
                        setSelectedOutsiderGroups(event.outsider.map(String));
                    }
                }
            } catch (err) {
                toast.error("Failed to load event");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [dashboardId, reset, navigate]);

    // Load parent users & locations
    useEffect(() => {
        if (!parentId) return;

        axios.get(`${my_dashboard_all_event_users}/${parentId}`)
            .then(res => {
                const users = res.data.data || res.data.users || res.data;
                setAllUsers(Array.isArray(users) ? users.map((u: any) => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone
                })) : []);
            })
            .catch(() => toast.error("Failed to load users"));
    }, [parentId]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [locRes, eventRes, memberRes] = await Promise.all([
                    axios.get(location),
                    axios.get(EVENT_API, { params: { isActive: true } }),
                    axios.get(MamberAPI)
                ]);

                setLocations(locRes.data.data || locRes.data);

                setEventTypes(eventRes.data.data || eventRes.data);

                setOutsiderGroups(memberRes.data.members || []);

            } catch (error) {
                console.error("API Error:", error);
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchAll();
    }, []);


    // Debounced search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            if (!query) {
                setSearchResults([]);
                return;
            }
            const filtered = allUsers.filter(u =>
                u.email?.toLowerCase().includes(query) ||
                u.phone?.includes(query) ||
                u.name?.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
        }, 300);
    };

    const handleAddUsers = () => {
        const newUsers = searchResults
            .filter(u => selectedUsers.includes(u.id))
            .filter(u => !nestedUsers.some(n => n.id === u.id));
        setNestedUsers(prev => [...prev, ...newUsers]);
        setSelectedUsers([]);
        setSearchResults([]);
        toast.success(`${newUsers.length} users added`);
    };

    const onSubmit = async (data: FormData) => {
        if (!dashboardId) return toast.error("Invalid event");

        const formData = new FormData();
        formData.append("name", data.eventName || "Sub Event");
        formData.append("attendanceName", data.attendanceName);
        if (data.img?.[0]) formData.append("img", data.img[0]);
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
            await axios.patch(`${SUB_EVENT}/${dashboardId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Sub-event updated!", { onClose: () => navigate(`/my_dashboard_1/${parentId}`) });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading event...</div>;

    return (
        <>
            <ToastContainer />
            <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Sub Event</h2>
                    <ClearIcon onClick={() => navigate(-1)} className="cursor-pointer text-gray-600 hover:text-red-500" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <input {...register("eventName")} placeholder="Event Name" className="w-full p-3 border rounded-lg" />
                    <input {...register("attendanceName", { required: true })} placeholder="Attendance Name *" className="w-full p-3 border rounded-lg" />

                    <input type="file" accept="image/*" {...register("img")} onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setImagePreview(URL.createObjectURL(file));
                    }} className="block w-full" />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg" />}

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

                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="p-3 border rounded-lg" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="p-3 border rounded-lg" />
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-3 border rounded-lg" />
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="p-3 border rounded-lg" />
                    </div>

                    {/* Nested Users */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-bold mb-4">Nested Users *</h3>
                        <input type="text" placeholder="Search by name/email/phone" onChange={handleSearch} className="w-full p-3 border rounded-lg mb-3" />
                        <div className="max-h-48 overflow-y-auto border rounded-lg mb-3">
                            {searchResults.map(u => (
                                <label key={u.id} className="flex items-center p-2 hover:bg-gray-50">
                                    <Checkbox checked={selectedUsers.includes(u.id)}
                                        onChange={() => setSelectedUsers(prev =>
                                            prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                        )} />
                                    <span className="ml-2">{u.name || u.email || u.phone}</span>
                                </label>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddUsers} disabled={!selectedUsers.length}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                            Add Selected ({selectedUsers.length})
                        </button>
                    </div>

                    {nestedUsers.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <h4 className="font-semibold">Added Users ({nestedUsers.length})</h4>
                                <button type="button" onClick={() => setNestedUsers([])} className="text-red-600">Clear All</button>
                            </div>
                            {nestedUsers.map((u, i) => (
                                <div key={i} className="flex justify-between items-center py-1">
                                    <span>{u.name || u.email || u.phone}</span>
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
                    </div>

                    <Button type="submit" variant="contained" fullWidth startIcon={<SaveIcon />}
                        sx={{ mt: 4, py: 2, background: "linear-gradient(to right, #27ae60, #27ae93)", fontWeight: "bold" }}>
                        Update Sub Event
                    </Button>
                </form>
            </div>
        </>
    );
};

export default EditSubEvent;