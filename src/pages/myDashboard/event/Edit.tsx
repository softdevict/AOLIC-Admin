import React, { useState, useEffect, useRef } from "react";
import { useForm, useController } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import {
    my_dashboard_user_card_details,
    EVENT_API,
    location,
    searchUser_email_phone,
    EVENT,
    MamberAPI
} from "../../../api/config";
import {
    Button,
    Checkbox,
    FormControlLabel,
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
    img: FileList | null;
    locationId: string[];
    eventTypeId: string[];
    attendanceName: string;
}

interface Location { _id: string; name: string; }
interface EventType { _id: string; name: string; }
interface NestedUser { id: string; email?: string; phone?: string; }
interface SearchUser { _id: string; name?: string; email?: string; phone?: string; }
interface Outsider { name: string; email?: string; phoneNumber?: string; }

const EditEvent: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const id = dashboardId;
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            eventName: "",
            locationId: [],
            eventTypeId: [],
            img: null,
            attendanceName: ""
        }
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [nested, setNested] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [locationsLoading, setLocationsLoading] = useState<boolean>(true);
    const [eventTypesLoading, setEventTypesLoading] = useState<boolean>(true);
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [outsiders, setOutsiders] = useState<Outsider[]>([]);
    const [outsiderGroups, setOutsiderGroups] = useState<any[]>([]);
    const [selectedOutsiderGroups, setSelectedOutsiderGroups] = useState<string[]>([]);
    const [loadingGroups, setLoadingGroups] = useState<boolean>(true);

    const outsiderFileInputRef = useRef<HTMLInputElement>(null);

    const locationController = useController({
        name: "locationId",
        control,
        rules: { validate: (v: string[]) => v.length > 0 || "At least one location required" }
    });

    const eventTypeController = useController({ name: "eventTypeId", control });

    // Cleanup image preview
    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    // Fetch event types
    useEffect(() => {
        const fetchEventTypes = async () => {
            try {
                setEventTypesLoading(true);
                const res = await axios.get(`${EVENT_API}`);
                const data = Array.isArray(res.data) ? res.data : res.data.data || [];
                setEventTypes(data);
            } catch {
                toast.error("Failed to fetch event types");
                setEventTypes([
                    { _id: "1", name: "Workshop" },
                    { _id: "2", name: "Conference" },
                    { _id: "3", name: "Seminar" },
                    { _id: "4", name: "Webinar" },
                ]);
            } finally {
                setEventTypesLoading(false);
            }
        };
        fetchEventTypes();
    }, []);

    // Fetch locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLocationsLoading(true);
                const res = await axios.get(location);
                const data = Array.isArray(res.data) ? res.data : res.data.data || [];
                setLocations(data);
            } catch { toast.error("Failed to fetch locations"); }
            finally { setLocationsLoading(false); }
        };
        fetchLocations();
    }, []);

    // Fetch outsider groups (departments)
    useEffect(() => {
        const loadGroups = async () => {
            try {
                setLoadingGroups(true);
                const { data } = await axios.get(MamberAPI);
                if (data.success && Array.isArray(data.members)) {
                    setOutsiderGroups(data.members);
                }
            } catch { toast.error("Failed to load departments"); }
            finally { setLoadingGroups(false); }
        };
        loadGroups();
    }, []);

    // Fetch current event data
    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const res = await axios.get(`${my_dashboard_user_card_details}/${id}`);
                const d = res.data.data;

                reset({
                    eventName: d.name || "",
                    attendanceName: d.attendanceName || "",
                    locationId: d.location?.map((l: any) => l._id || l) || [],
                    eventTypeId: d.events?.map((e: any) => e._id || e) || [],
                    img: null,
                });

                setStartDate(d.startDate || "");
                setEndDate(d.endDate || "");
                setStartTime(d.startTime || "");
                setEndTime(d.endTime || "");
                setNested(!!d.nested);
                setImagePreview(d.img || null);

                // Load nested users
                if (d.geoAttendance?.length > 0) {
                    const users = d.geoAttendance.map((u: any) => ({
                        id: u._id || u.id || u,
                        email: u.email,
                        phone: u.phone,
                    }));
                    setNestedUsers(users);
                }

                // Load outsiders (manual or group IDs)
                if (d.outsider?.length > 0) {
                    const isManual = d.outsider.some((o: any) => typeof o === "object" && o.name);
                    if (isManual) {
                        setOutsiders(d.outsider);
                    } else {
                        setSelectedOutsiderGroups(d.outsider.map((id: string) => id.toString()));
                    }
                }
            } catch {
                toast.error("Failed to load event");
            }
        };
        fetchEvent();
    }, [id, reset]);

    // Search users
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const param = /^\d+$/.test(searchQuery) ? "phone" : "email";
        axios.get(`${searchUser_email_phone}?${param}=${searchQuery}`)
            .then(res => setSearchResults(res.data.data || res.data || []))
            .catch(() => setSearchResults([]));
    }, [searchQuery]);

    const handleAddUsers = () => {
        const newUsers = searchResults
            .filter(u => selectedUsers.includes(u._id))
            .map(u => ({ id: u._id, email: u.email, phone: u.phone }))
            .filter(u => !nestedUsers.some(n => n.id === u.id));
        setNestedUsers(prev => [...prev, ...newUsers]);
        setSelectedUsers([]);
        toast.success(`${newUsers.length} user(s) added`);
    };

    const toggleOutsiderGroup = (groupId: string) => {
        setSelectedOutsiderGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const onSubmit = async (data: FormData) => {
        if (data.locationId.length === 0) return toast.error("Select at least one location");
        if (!startDate || !endDate) return toast.error("Dates required");

        try {
            const formData = new FormData();
            formData.append("name", data.eventName);
            formData.append("attendanceName", data.attendanceName);
            if (data.img?.[0]) formData.append("img", data.img[0]);
            formData.append("location", JSON.stringify(data.locationId));
            formData.append("events", JSON.stringify(data.eventTypeId));
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("startTime", startTime);
            formData.append("endTime", endTime);
            formData.append("nested", nested.toString());

            if (nestedUsers.length > 0) {
                formData.append("geoAttendance", JSON.stringify(nestedUsers.map(u => u.id)));
            }

            // Send selected department group IDs
            if (selectedOutsiderGroups.length > 0) {
                formData.append("outsider", JSON.stringify(selectedOutsiderGroups));
            }

            // Also allow manual outsiders (from Excel)
            if (outsiders.length > 0) {
                formData.append("outsider", JSON.stringify(outsiders));
            }

            await axios.patch(`${EVENT}/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Event updated successfully!", {
                onClose: () => navigate("/my_dashboard")
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Edit Event
                    </h2>
                    <ClearIcon
                        onClick={() => navigate("/my_dashboard")}
                        className="cursor-pointer text-gray-600 hover:text-red-500 transition"
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Basic Info */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
                        <div>
                            <label className="block text-sm text-gray-600">Event Name *</label>
                            <input {...register("eventName", { required: "Event name is required" })}
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Enter event name" />
                            {errors.eventName && <p className="text-red-500 text-sm">{errors.eventName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Upload New Image (optional)</label>
                            <input type="file" accept="image/*" {...register("img")}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setImagePreview(file ? URL.createObjectURL(file) : null);
                                }}
                                className="block w-full p-2 border rounded-lg" />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="mt-3 w-40 h-40 object-cover rounded-xl shadow-md" />
                            )}
                        </div>
                    </div>

                    {/* Attendance Name */}
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Popup Name *</h3>
                        <input {...register("attendanceName", { required: "Attendance name is required" })}
                            placeholder="Enter attendance name"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        {errors.attendanceName && <p className="text-red-500 text-sm">{errors.attendanceName.message}</p>}
                    </div>

                    {/* Location */}
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Locations *</h3>
                        {locationsLoading ? <p className="text-gray-500">Loading...</p> : (
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {locations.map(loc => (
                                    <label key={loc._id} className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1 border">
                                        <Checkbox
                                            checked={locationController.field.value.includes(loc._id)}
                                            onChange={(e) => {
                                                const val = e.target.checked
                                                    ? [...locationController.field.value, loc._id]
                                                    : locationController.field.value.filter((id: string) => id !== loc._id);
                                                locationController.field.onChange(val);
                                            }}
                                        />
                                        {loc.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">Event Schedule</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded-lg" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 rounded-lg" />
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border p-2 rounded-lg" />
                        </div>
                        <FormControlLabel
                            control={<Checkbox checked={nested} onChange={e => setNested(e.target.checked)} />}
                            label="Enable Nested (UI only)"
                        />
                    </div>

                    {/* Nested Users */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">Nested Users</h3>
                        <input
                            type="text"
                            placeholder="Search by email"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="border p-2 rounded-lg w-full"
                        />
                        <div className="space-y-2">
                            {searchResults.map(u => (
                                <label key={u._id} className="flex items-center">
                                    <Checkbox
                                        checked={selectedUsers.includes(u._id)}
                                        onChange={() => setSelectedUsers(prev =>
                                            prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]
                                        )}
                                    />
                                    <span className="ml-2">{u.name ? `${u.name} (${u.email || u.phone})` : u.email || u.phone}</span>
                                </label>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddUsers} disabled={!selectedUsers.length}
                            className={`w-full py-2 rounded-lg text-white ${selectedUsers.length ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300"}`}>
                            Add Selected ({selectedUsers.length})
                        </button>
                        {nestedUsers.length > 0 && (
                            <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-medium">Added ({nestedUsers.length})</h4>
                                    <button type="button" onClick={() => setNestedUsers([])} className="text-red-500 text-sm">Clear All</button>
                                </div>
                                {nestedUsers.map(u => (
                                    <div key={u.id} className="flex justify-between items-center bg-white border rounded-md px-3 py-1 my-1">
                                        <span>{u.email || u.phone}</span>
                                        <IconButton size="small" onClick={() => setNestedUsers(prev => prev.filter(x => x.id !== u.id))}>
                                            <CancelIcon color="error" fontSize="small" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Outsider Groups (Departments) */}
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <PersonAddIcon fontSize="large" color="primary" />
                            <h3 className="text-xl font-bold">Add Guests by Department</h3>
                        </div>

                        {loadingGroups ? (
                            <p className="text-gray-500">Loading departments...</p>
                        ) : outsiderGroups.length === 0 ? (
                            <p className="text-gray-500">No departments found</p>
                        ) : (
                            <div className="space-y-4">
                                {outsiderGroups.map((group: any) => (
                                    <label
                                        key={group._id}
                                        className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                                    >
                                        <div>
                                            <span className="text-lg font-semibold">{group.typeName}</span>
                                            <span className="text-sm text-gray-600 ml-3">
                                                ({group.users?.length || 0} members)
                                            </span>
                                        </div>
                                        <Checkbox
                                            checked={selectedOutsiderGroups.includes(group._id)}
                                            onChange={() => toggleOutsiderGroup(group._id)}
                                            color="primary"
                                        />
                                    </label>
                                ))}
                            </div>
                        )}

                        {selectedOutsiderGroups.length > 0 && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="font-medium text-green-800">
                                    {selectedOutsiderGroups.length} department(s) selected
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        fullWidth
                        sx={{
                            background: "linear-gradient(to right, #27ae60, #27ae93)",
                            color: "#fff",
                            py: 1.8,
                            fontWeight: "bold",
                            borderRadius: "10px",
                            fontSize: "1rem",
                        }}
                    >
                        Update Event
                    </Button>
                </form>
            </div>
        </>
    );
};

export default EditEvent;