import React, { useState, useEffect, useRef } from "react";
import { useForm, useController } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import * as XLSX from "xlsx";
import {
    EVENT,
    location,
    searchUser_email_phone,
    displayAllUSer_email_phone,
    EVENT_API,
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


interface FormData {
    eventName: string;
    img: FileList | null;
    locationId: string[];
    attendanceName: string; // ✅ Added field
    eventTypeId: string[]; // ✅ Added for event types
}

interface Location {
    _id: string;
    name: string;
}

interface EventType { // ✅ Added interface
    _id: string;
    name: string;
}

interface NestedUser {
    id: string;
    email?: string;
    phone?: string;
}

interface ExcelRow {
    email?: string;
    phone?: string;
}

interface Outsider {
    name: string;
    email?: string;
    phoneNumber?: string;
}

interface OutsiderRow {
    name?: string;
    email?: string;
    phoneNumber?: string;
}

const AddEvent: React.FC = () => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: { locationId: [], eventTypeId: [], img: null, attendanceName: "" },
    });

    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outsiderFileInputRef = useRef<HTMLInputElement>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [nested, setNested] = useState<boolean>(true);
    const [showNestedSection, setShowNestedSection] = useState<boolean>(true);
    const [showOutsiderSection, setShowOutsiderSection] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [locationsLoading, setLocationsLoading] = useState<boolean>(true);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]); // ✅ Added for event types
    const [eventTypesLoading, setEventTypesLoading] = useState<boolean>(true); // ✅ Added loading
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [outsiders, setOutsiders] = useState<Outsider[]>([]);
    const [mamber, setMamber] = useState([]);
    const [selectedOutsiderGroups, setSelectedOutsiderGroups] = useState<string[]>([]);
    const toggleOutsiderGroup = (groupId: string, isChecked: boolean) => {
        setSelectedOutsiderGroups((prev) =>
            isChecked
                ? [...prev, groupId]                // add id
                : prev.filter((id) => id !== groupId) // remove id
        );
    };

    const locationController = useController({
        name: "locationId",
        control,
        rules: {
            validate: (value: string[]) =>
                value.length > 0 || "At least one location is required",
        },
    });

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const { data } = await axios.get(MamberAPI);
                console.log("🚀 ~ loadMembers ~ data:", data.members)
                if (data.success) {
                    setMamber(data.members);
                }
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        };

        loadMembers();
    }, []);


    // ✅ Added event type controller (no validation for optional)
    const eventTypeController = useController({
        name: "eventTypeId",
        control,
    });

    // 🧩 Clean up image URLs
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // 🧩 Fetch all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const res = await axios.get(displayAllUSer_email_phone);
                let users: any[] = [];
                if (Array.isArray(res.data)) users = res.data;
                else if (Array.isArray(res.data.data)) users = res.data.data;
                else if (Array.isArray(res.data.users)) users = res.data.users;
                setAllUsers(users);
            } catch {
                toast.error("Failed to load users");
            }
        };
        fetchAllUsers();
    }, []);

    // 🧩 Fetch locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLocationsLoading(true);
                const res = await axios.get(location);
                const locationsData: Location[] =
                    Array.isArray(res.data) ? res.data : res.data.data || [];
                setLocations(locationsData);
            } catch {
                toast.error("Failed to fetch locations");
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // ✅ Added: Fetch event types
    useEffect(() => {
        const fetchEventTypes = async () => {
            try {
                setEventTypesLoading(true);
                const res = await axios.get(`${EVENT_API}`); // Adjust endpoint if needed
                const eventTypesData: EventType[] =
                    Array.isArray(res.data) ? res.data : res.data.data || [];
                setEventTypes(eventTypesData);
            } catch (error) {
                console.error("Error fetching event types:", error);
                toast.error("Failed to fetch event types.");
                // Fallback to predefined types
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

    // 🔍 Search user by email or phone
    const handleSearch = async (query: string) => {
        if (!query.trim()) return setSearchResults([]);
        const param = /^\d+$/.test(query) ? "phone" : "email";
        try {
            const res = await axios.get(`${searchUser_email_phone}?${param}=${query}`);
            const results =
                Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.data)
                        ? res.data.data
                        : [];
            setSearchResults(results);
        } catch {
            setSearchResults([]);
        }
    };

    const handleAddUsers = () => {
        const newUsers = searchResults
            .filter((u) => selectedUsers.includes(u._id))
            .map((u) => ({ id: u._id, email: u.email, phone: u.phone }))
            .filter((u) => !nestedUsers.some((n) => n.id === u.id));
        setNestedUsers((prev) => [...prev, ...newUsers]);
        setSelectedUsers([]);
        toast.success(`${newUsers.length} user(s) added`);
    };

    const handleDeleteUser = (index: number) =>
        setNestedUsers((prev) => prev.filter((_, i) => i !== index));

    const handleDeleteOutsider = (index: number) =>
        setOutsiders((prev) => prev.filter((_, i) => i !== index));

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !allUsers.length) return;
        try {
            for (const file of Array.from(files)) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
                    const newUsers: NestedUser[] = [];
                    rows.forEach((row) => {
                        const user = allUsers.find(
                            (u) =>
                                (row.email && u.email === row.email) ||
                                (row.phone && u.phone === row.phone)
                        );
                        if (user && !nestedUsers.some((n) => n.id === user._id)) {
                            newUsers.push({ id: user._id, email: user.email, phone: user.phone });
                        }
                    });
                    setNestedUsers((prev) => [...prev, ...newUsers]);
                    toast.success(`Added ${newUsers.length} users from ${file.name}`);
                };
                reader.readAsArrayBuffer(file);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
            toast.error("Failed to process Excel file");
        }
    };

    const handleOutsiderExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        try {
            for (const file of Array.from(files)) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json<OutsiderRow>(sheet);
                    const newOutsiders: Outsider[] = [];
                    rows.forEach((row) => {
                        if (!row.name || typeof row.name !== 'string') return;
                        const trimmedName = row.name.trim();
                        if (!trimmedName) return;
                        const email = row.email ? (row.email as string).trim().toLowerCase() : undefined;
                        const phoneNumber = row.phoneNumber ? (row.phoneNumber as string).trim() : undefined;
                        // Check for duplicates based on email or phoneNumber
                        const isDuplicate = outsiders.some(o =>
                            (email && o.email === email) || (phoneNumber && o.phoneNumber === phoneNumber)
                        );
                        if (isDuplicate) return;
                        newOutsiders.push({ name: trimmedName, email, phoneNumber });
                    });
                    setOutsiders((prev) => [...prev, ...newOutsiders]);
                    toast.success(`Added ${newOutsiders.length} unique outsiders from ${file.name}`);
                };
                reader.readAsArrayBuffer(file);
            }
            if (outsiderFileInputRef.current) outsiderFileInputRef.current.value = "";
        } catch {
            toast.error("Failed to process Excel file for outsiders");
        }
    };

    // ✅ Submit Event
    const onSubmit = async (data: FormData) => {
        if (data.locationId.length === 0)
            return toast.error("Select at least one location");
        if (!data.img?.[0]) return toast.error("Image required");
        if (!startDate || !endDate) return toast.error("Date range required");
        if (!data.attendanceName.trim())
            return toast.error("Attendance name is required");

        try {
            const formData = new FormData();
            formData.append("name", data.eventName);
            formData.append("attendanceName", data.attendanceName);
            formData.append("img", data.img[0]);
            formData.append("location", JSON.stringify(data.locationId));
            formData.append("events", JSON.stringify(data.eventTypeId));
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("startTime", startTime);
            formData.append("endTime", endTime);
            formData.append("nested", nested.toString());

            // Send nested (internal) users
            if (nestedUsers.length > 0) {
                formData.append("geoAttendance", JSON.stringify(nestedUsers.map((u) => u.id)));
            }

            // Send selected outsider group IDs (this is what you wanted)
            // ✅ Send selected outsider group IDs to backend
            if (selectedOutsiderGroups.length > 0) {
                formData.append("outsider", JSON.stringify(selectedOutsiderGroups));
            }

            await axios.post(EVENT, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Event added successfully!", {
                onClose: () => navigate("/my_dashboard"),
            });
        } catch (error) {
            const errMsg =
                error instanceof AxiosError && error.response
                    ? error.response.data?.message || "Server error"
                    : "Failed to add event";
            toast.error(errMsg);
        }
    };
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            <ToastContainer />
            <div className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Add Event
                    </h2>
                    {adminType === "super admin" && (
                        <ClearIcon
                            onClick={() => navigate("/my_dashboard")}
                            className="cursor-pointer text-gray-600 hover:text-red-500 transition"
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Basic Information
                        </h3>
                        <div>
                            <label className="block text-sm text-gray-600">Event Name *</label>
                            <input
                                {...register("eventName", { required: "Event name is required" })}
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Enter event name"
                            />
                            {errors.eventName && (
                                <p className="text-red-500 text-sm">{errors.eventName.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">
                                Upload Image *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register("img", { required: "Image is required" })}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setImagePreview(file ? URL.createObjectURL(file) : null);
                                }}
                                className="block w-full p-2 border rounded-lg"
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    className="mt-3 w-40 h-40 object-cover rounded-xl shadow-md"
                                    alt="Preview"
                                />
                            )}
                            {errors.img && (
                                <p className="text-red-500 text-sm">{errors.img.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Attendance Name */}
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Popup Name *
                        </h3>
                        <input
                            {...register("attendanceName", {
                                required: "Attendance name is required",
                            })}
                            placeholder="Enter attendance name"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {errors.attendanceName && (
                            <p className="text-red-500 text-sm">
                                {errors.attendanceName.message}
                            </p>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Select Locations *
                        </h3>
                        {locationsLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {locations.map((loc) => (
                                    <label
                                        key={loc._id}
                                        className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1 border"
                                    >
                                        <Checkbox
                                            checked={locationController.field.value.includes(loc._id)}
                                            onChange={(e) => {
                                                const val = e.target.checked
                                                    ? [...locationController.field.value, loc._id]
                                                    : locationController.field.value.filter(
                                                        (id) => id !== loc._id
                                                    );
                                                locationController.field.onChange(val);
                                            }}
                                        />
                                        {loc.name}
                                    </label>
                                ))}
                            </div>
                        )}
                        {locationController.fieldState.error && (
                            <p className="text-red-500 text-sm mt-2">
                                {locationController.fieldState.error.message}
                            </p>
                        )}
                    </div>

                    {/* ✅ Event Types Section (Optional) */}
                    {/* <div className="p-5 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Select Event Types (Optional)
                        </h3>
                        {eventTypesLoading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {eventTypes.map((eventType) => (
                                    <label
                                        key={eventType._id}
                                        className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1 border"
                                    >
                                        <Checkbox
                                            checked={eventTypeController.field.value.includes(eventType._id)}
                                            onChange={(e) => {
                                                const val = e.target.checked
                                                    ? [...eventTypeController.field.value, eventType._id]
                                                    : eventTypeController.field.value.filter(
                                                        (id) => id !== eventType._id
                                                    );
                                                eventTypeController.field.onChange(val);
                                            }}
                                        />
                                        {eventType.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div> */}

                    {/* Dates */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Event Schedule
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border p-2 rounded-lg"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border p-2 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="border p-2 rounded-lg"
                            />
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="border p-2 rounded-lg"
                            />
                        </div>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={nested}
                                    onChange={(e) => setNested(e.target.checked)}
                                />
                            }
                            label="Enable Nested (UI only)"
                        />
                    </div>

                    {/* Nested Section (unchanged) */}
                    {showNestedSection && (
                        <div className="p-5 bg-white rounded-xl shadow-md space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Nested Users
                                </h3>
                                <IconButton
                                    onClick={() => setShowNestedSection((p) => !p)}
                                    size="small"
                                >
                                    {showNestedSection ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </div>

                            <input
                                type="text"
                                placeholder="Search by user email"
                                onChange={(e) => handleSearch(e.target.value)}
                                className="border p-2 rounded-lg w-full"
                            />

                            {searchResults.map((u) => (
                                <label
                                    key={u._id}
                                    className="flex items-center border p-2 rounded-md"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(u._id)}
                                        onChange={() =>
                                            setSelectedUsers((prev) =>
                                                prev.includes(u._id)
                                                    ? prev.filter((id) => id !== u._id)
                                                    : [...prev, u._id]
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    {u.email || u.phone}
                                </label>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddUsers}
                                disabled={!selectedUsers.length}
                                className={`w-full py-2 rounded-lg text-white font-medium transition ${selectedUsers.length
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : "bg-gray-300 cursor-not-allowed"
                                    }`}
                            >
                                Add Selected Users ({selectedUsers.length})
                            </button>

                            {nestedUsers.length > 0 && (
                                <div className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">
                                            Added Users ({nestedUsers.length})
                                        </h4>
                                        <button
                                            onClick={() => setNestedUsers([])}
                                            type="button"
                                            className="text-red-500 hover:text-red-600 text-sm"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    {nestedUsers.map((u, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center bg-white border rounded-md px-3 py-1 my-1"
                                        >
                                            <span>{u.email || u.phone}</span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteUser(i)}
                                            >
                                                <CancelIcon color="error" fontSize="small" />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-600">
                                    Upload Excel File
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls"
                                    multiple
                                    onChange={handleExcelUpload}
                                    className="block w-full border p-2 rounded-lg mt-1"
                                />
                            </div>
                        </div>
                    )}

                    
                    {/* Outsider Section – Select Group IDs */}
                    <div className="p-5 bg-white rounded-xl shadow-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Select Outsider Groups (Departments)
                        </h3>

                        {mamber.length === 0 ? (
                            <p className="text-gray-500">No groups available</p>
                        ) : (
                            <div className="space-y-3">
                                {mamber.map((group: any) => (
                                    <label
                                        key={group._id}
                                        className="flex justify-between items-center bg-gray-50 border p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800">{group.typeName}</p>
                                            <p className="text-xs text-gray-500">
                                                {group.users.length} members
                                            </p>
                                        </div>

                                        <Checkbox
                                            color="primary"
                                            checked={selectedOutsiderGroups.includes(group._id)}
                                            onChange={(e) => toggleOutsiderGroup(group._id, e.target.checked)}
                                        />
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Selected List Summary */}
                        {selectedOutsiderGroups.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border rounded-lg">
                                <h4 className="font-semibold text-blue-700 mb-2">
                                    Selected Groups ({selectedOutsiderGroups.length})
                                </h4>

                                <ul className="list-disc ml-5">
                                    {mamber
                                        .filter((g: any) => selectedOutsiderGroups.includes(g._id))
                                        .map((g: any) => (
                                            <li key={g._id} className="text-sm text-gray-700">
                                                {g.typeName}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>


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
                        Create Event
                    </Button>
                </form>
            </div>
        </>
    );
};

export default AddEvent;