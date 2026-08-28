import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import Button from "../../components/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { digital_pass, location } from "../../api/config";

import QrPassImg from "../../assets/img/qr-AOLIC.png";
import iconImg from "../../assets/img/favicon.png";

interface FormData {
    name: string;
    bgColorCode: string;
    textColorCode: string;
    startDate: string;
    endDate: string;
    seatsCount: number;
    vehiclesCount: number;
    active?: boolean;
    isInventoryManagement?: boolean;
    autoApprove?: boolean;
    isMultiEntry?: boolean;
    skipCoordinator?: boolean;
}

interface TimeSlot {
    start: string;
    end: string;
}

interface Location {
    _id: string;
    name: string;
    img?: string;
    lat?: string;
    long?: string;
}

interface RawPassData {
    _id: string;
    passId: string;
    name: string;
    active: boolean;
    backgroundImg?: string;
    bgColorCode: string;
    textColorCode: string;
    seatsCount: number;
    vehiclesCount: number;
    manageSeatsCount?: { total: number };
    manageVehiclesCount?: { total: number };
    locations?: Location[];
    attendUser: any[];
    users: any[];
    createdAt: string;
    updatedAt: string;

    start?: { date: string; time: string; full?: string };
    end?: { date: string; time: string; full?: string };
    timeSlots?: TimeSlot[];
    isInventoryManagement?: boolean;
    autoApprove?: boolean;
    isMultiEntry?: boolean;
    skipCoordinator?: boolean;
}

const DigitalPassEdit: React.FC = () => {
    const { passId } = useParams<{ passId: string }>();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>();

    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [preview, setPreview] = useState({ backgroundImg: "" });
    const [uniquePassId, setUniquePassId] = useState("");
    const [passData, setPassData] = useState<RawPassData | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    const watched = watch();

    // -----------------------------------
    // TIME SLOTS HANDLERS
    // -----------------------------------
    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { start: "", end: "" }]);
    };

    const removeTimeSlot = (index: number) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
        setTimeSlots(prev => prev.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        ));
    };

    // -----------------------------------
    // FETCH PASS DETAILS (GET API)
    // -----------------------------------
    useEffect(() => {
        if (!passId) return;

        const fetchPassDetails = async () => {
            try {
                const res = await axios.get(`${digital_pass}/fullDetails/cardId/${passId}`);
                if (res.data?.success) {
                    const p: RawPassData = res.data.data;
                    console.log("🚀 ~ DigitalPassEdit ~ Fetched Pass Data:", p);
                    console.log("🚀 ~ skipCoordinator from backend:", p.skipCoordinator);

                    setPassData(p);

                    setValue("name", p.name);

                    const hexWithHash = (code: string) => code.startsWith('#') ? code : `#${code}`;
                    setValue("bgColorCode", hexWithHash(p.bgColorCode));
                    setValue("textColorCode", hexWithHash(p.textColorCode));

                    setValue("active", p.active ?? true);
                    setValue("isInventoryManagement", p.isInventoryManagement ?? false);
                    setValue("autoApprove", p.autoApprove ?? false);
                    setValue("isMultiEntry", p.isMultiEntry ?? false);
                    setValue("skipCoordinator", p.skipCoordinator ?? false);

                    setValue("startDate", p.start?.date || "");
                    setValue("endDate", p.end?.date || "");

                    setValue("seatsCount", p.seatsCount);
                    setValue("vehiclesCount", p.vehiclesCount);

                    setUniquePassId(p.passId);
                    setSelectedLocations(p.locations ? p.locations.map((l) => l._id) : []);
                    setTimeSlots(p.timeSlots || []);

                    if (p.backgroundImg) {
                        setPreview({ backgroundImg: p.backgroundImg });
                    }
                } else {
                    toast.error("Failed to load pass details");
                }
            } catch (err: any) {
                console.error("❌ Fetch error:", err);
                toast.error("Failed to load pass details");
            }
        };

        fetchPassDetails();
    }, [passId, setValue]);

    // -----------------------------------
    // FETCH LOCATIONS
    // -----------------------------------
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get(location);
                setLocations(res.data?.data || []);
            } catch (err: any) {
                console.error("❌ Locations fetch error:", err);
                toast.error("Failed to load locations");
            }
        };

        fetchLocations();
    }, []);

    // -----------------------------------
    // BACKGROUND IMAGE CHANGE
    // -----------------------------------
    const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBackgroundFile(file);
        setPreview({ backgroundImg: URL.createObjectURL(file) });
        setRemoveImage(false);
    };

    // -----------------------------------
    // REMOVE CURRENT IMAGE
    // -----------------------------------
    const handleRemoveCurrentImage = () => {
        setRemoveImage(true);
        setPreview({ backgroundImg: "" });
    };

    // -----------------------------------
    // REMOVE NEW IMAGE
    // -----------------------------------
    const handleRemoveNewImage = () => {
        setBackgroundFile(null);
        setPreview({ backgroundImg: "" });
    };

    // -----------------------------------
    // PREVIEW REMOVE HANDLER
    // -----------------------------------
    const handlePreviewRemove = () => {
        if (backgroundFile) {
            handleRemoveNewImage();
        } else {
            handleRemoveCurrentImage();
        }
    };

    // -----------------------------------
    // TOGGLE LOCATION CHECKBOX
    // -----------------------------------
    const handleLocationToggle = (id: string) => {
        setSelectedLocations((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // -----------------------------------
    // SUBMIT UPDATE (PUT API)
    // -----------------------------------
    const onSubmit = async (data: FormData) => {
        console.log("=================================");
        console.log("📤 Form data being submitted:", data);
        console.log("📤 skipCoordinator value:", data.skipCoordinator);

        try {
            setLoading(true);

            const fd = new FormData();

            fd.append("name", data.name);
            fd.append("bgColorCode", data.bgColorCode.replace("#", ""));
            fd.append("textColorCode", data.textColorCode.replace("#", ""));

            // Convert boolean to string 'true' or 'false'
            fd.append("active", String(data.active ?? true));
            fd.append("isInventoryManagement", String(data.isInventoryManagement ?? false));
            fd.append("autoApprove", String(data.autoApprove ?? false));
            fd.append("isMultiEntry", String(data.isMultiEntry ?? false));
            fd.append("skipCoordinator", String(data.skipCoordinator ?? false));

            if (data.startDate) fd.append("startDate", data.startDate);
            if (data.endDate) fd.append("endDate", data.endDate);

            fd.append("seatsCount", String(data.seatsCount));
            fd.append("vehiclesCount", String(data.vehiclesCount));

            selectedLocations.forEach((loc) => fd.append("locationIds[]", loc));

            // Time Slots
            const validTimeSlots = timeSlots.filter(slot => slot.start && slot.end);
            if (validTimeSlots.length > 0) {
                fd.append("timeSlots", JSON.stringify(validTimeSlots));
            }

            if (backgroundFile) {
                fd.append("backgroundImg", backgroundFile);
            }

            if (removeImage) {
                fd.append("removeBackgroundImg", "true");
            }

            // Debug: Log FormData contents
            console.log("📦 FormData contents being sent:");
            for (let pair of fd.entries()) {
                console.log(`   ${pair[0]}: ${pair[1]}`);
            }

            const response = await axios.put(`${digital_pass}/${passId}`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Server Response:", response.data);

            if (response.data?.success) {
                toast.success("Pass Updated Successfully!");
                setTimeout(() => navigate("/digitalPass"), 1200);
            } else {
                toast.error(response.data?.message || "Update failed");
            }
        } catch (err: any) {
            console.error("❌ Update error:", err);
            toast.error(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    const selectedLocNames = selectedLocations
        .map((id) => locations.find((loc) => loc._id === id)?.name)
        .filter(Boolean);

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    if (!passData) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl">Loading...</div>
        </div>;
    }

    const isInventoryManagement = watch("isInventoryManagement") ?? false;
    const autoApprove = watch("autoApprove") ?? false;
    const isMultiEntry = watch("isMultiEntry") ?? false;
    const skipCoordinator = watch("skipCoordinator") ?? false;
    const validTimeSlots = timeSlots.filter(slot => slot.start && slot.end);

    // Determine if preview has an image to show remove icon
    const hasPreviewImage = preview.backgroundImg && (backgroundFile || (passData.backgroundImg && !removeImage));

    // Determine remove handler for preview
    const previewRemoveHandler = backgroundFile ? handleRemoveNewImage : handleRemoveCurrentImage;

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <ToastContainer />

            {/* BREADCRUMBS */}
            <ol className="flex gap-2 text-gray-600 font-semibold mb-4">
                <Link to="/">Home</Link> /{" "}
                <Link to="/digitalPass">Digital Passes</Link> /{" "}
                <span className="text-black">Edit Pass</span>
            </ol>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ---------------------------------------------------- */}
                {/* LEFT SIDE FORM */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => navigate("/digitalPass")}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <ArrowBackIcon />
                        </button>
                        <h2 className="text-2xl font-bold">Edit Digital Pass</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* EVENT NAME */}
                        <div>
                            <label className="font-semibold">Event Name</label>
                            <input
                                type="text"
                                {...register("name", { required: true })}
                                className="w-full border p-3 rounded"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">Event name is required</p>}
                        </div>

                        {/* DATES */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">Start Date</label>
                                {/* <input
                                    type="date"
                                    {...register("startDate")}
                                    className="w-full border p-3 rounded"
                                /> */}
                                <input
                                    type="date"
                                    {...register("startDate", {
                                        validate: (value) => {
                                            const endDate = watch("endDate");
                                            if (!value || !endDate) return true;
                                            return new Date(value) <= new Date(endDate) || "Start date cannot be after End date";
                                        }
                                    })}
                                    className="w-full border p-3 rounded"
                                />
                                {errors.startDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="font-semibold">End Date</label>
                                {/* <input
                                    type="date"
                                    {...register("endDate")}
                                    className="w-full border p-3 rounded"
                                /> */}
                                <input
                                    type="date"
                                    {...register("endDate", {
                                        validate: (value) => {
                                            const startDate = watch("startDate");
                                            if (!value || !startDate) return true;
                                            return new Date(value) >= new Date(startDate) || "End date cannot be before Start date";
                                        }
                                    })}
                                    className="w-full border p-3 rounded"
                                />
                                {errors.endDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        {/* TIME SLOTS */}
                        <div>
                            <label className="font-semibold">Time Slots</label>
                            <div className="space-y-2">
                                {timeSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                        <input
                                            type="time"
                                            value={slot.start}
                                            onChange={(e) => updateTimeSlot(index, "start", e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                        />
                                        <span>-</span>
                                        <input
                                            type="time"
                                            value={slot.end}
                                            onChange={(e) => updateTimeSlot(index, "end", e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTimeSlot(index)}
                                            className="p-1 text-red-500 hover:text-red-700"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTimeSlot}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    + Add Time Slot
                                </button>
                            </div>
                        </div>

                        {/* COLORS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">Background Color</label>
                                <input
                                    type="color"
                                    {...register("bgColorCode")}
                                    className="w-full h-14 rounded"
                                />
                            </div>
                            <div>
                                <label className="font-semibold">Text Color</label>
                                <input
                                    type="color"
                                    {...register("textColorCode")}
                                    className="w-full h-14 rounded"
                                />
                            </div>
                        </div>

                        {/* LOCATIONS */}
                        {locations.length > 0 && (
                            <div>
                                <label className="font-semibold">Locations ({selectedLocNames.length} selected)</label>
                                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                                    {locations.map((loc) => (
                                        <label key={loc._id} className="block">
                                            <input
                                                type="checkbox"
                                                checked={selectedLocations.includes(loc._id)}
                                                onChange={() => handleLocationToggle(loc._id)}
                                                className="mr-2"
                                            />
                                            {loc.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* INVENTORY MANAGEMENT TOGGLE */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isInventoryManagement")}
                                    checked={isInventoryManagement}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        setValue("isInventoryManagement", newVal);
                                        if (!newVal) {
                                            setValue("seatsCount", 0);
                                            setValue("vehiclesCount", 0);
                                        }
                                    }}
                                    className="mr-2"
                                />
                                <span>Enable Inventory Management</span>
                            </label>
                        </div>

                        {/* COUNTS (Conditional) */}
                        {isInventoryManagement && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold">Seats</label>
                                    <input
                                        type="number"
                                        min="0"
                                        {...register("seatsCount", { valueAsNumber: true, min: { value: 0, message: "Seats must be at least 0" } })}
                                        className="w-full border p-3 rounded"
                                    />
                                    {errors.seatsCount && <p className="text-red-500 text-sm mt-1">{errors.seatsCount.message}</p>}
                                </div>
                                <div>
                                    <label className="font-semibold">Vehicles</label>
                                    <input
                                        type="number"
                                        min="0"
                                        {...register("vehiclesCount", { valueAsNumber: true, min: { value: 0, message: "Vehicles must be at least 0" } })}
                                        className="w-full border p-3 rounded"
                                    />
                                    {errors.vehiclesCount && <p className="text-red-500 text-sm mt-1">{errors.vehiclesCount.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* AUTO APPROVE TOGGLE */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("autoApprove")}
                                    checked={autoApprove}
                                    onChange={(e) => setValue("autoApprove", e.target.checked)}
                                    className="mr-2"
                                />
                                <span>Auto Approve Requests</span>
                            </label>
                        </div>

                        {/* MULTI ENTRY TOGGLE */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isMultiEntry")}
                                    checked={isMultiEntry}
                                    onChange={(e) => setValue("isMultiEntry", e.target.checked)}
                                    className="mr-2"
                                />
                                <span>Enable Multi-Entry</span>
                            </label>
                        </div>

                        {/* SKIP COORDINATOR TOGGLE */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("skipCoordinator")}
                                    checked={skipCoordinator}
                                    onChange={(e) => {
                                        const newValue = e.target.checked;
                                        console.log("🔄 Checkbox changed to:", newValue);
                                        setValue("skipCoordinator", newValue);
                                    }}
                                    className="mr-2"
                                />
                                <span>Skip Coordinator</span>
                            </label>
                        </div>

                        {/* BACKGROUND IMAGE */}
                        <div>
                            <label className="font-semibold">Background Image</label>
                            {passData.backgroundImg && !removeImage && !backgroundFile && (
                                <div className="relative mb-2">
                                    <img
                                        src={passData.backgroundImg}
                                        alt="Current Background"
                                        className="w-40 h-40 rounded object-cover border"
                                    />
                                    <p className="text-sm text-gray-600">Current image</p>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCurrentImage}
                                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </div>
                            )}
                            {removeImage && (
                                <p className="text-sm text-gray-600 mt-2">Image removed</p>
                            )}
                            <label className="block border p-4 rounded bg-gray-50 cursor-pointer hover:bg-gray-100">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBackgroundChange}
                                    className="hidden"
                                />
                                <p className="text-center text-gray-500">Choose New Image</p>
                            </label>

                            {preview.backgroundImg && backgroundFile && (
                                <div className="relative mt-3">
                                    <img
                                        src={preview.backgroundImg}
                                        alt="New Preview"
                                        className="w-40 h-40 rounded object-cover border"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">New image selected</p>
                                    <button
                                        type="button"
                                        onClick={handleRemoveNewImage}
                                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button loading={loading} text="Save Changes" />
                    </form>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT SIDE PREVIEW */}
                {/* ---------------------------------------------------- */}
                <div className="flex justify-center items-start">
                    <div
                        className="relative w-[320px] h-[520px] rounded-3xl shadow-xl p-5 border flex flex-col justify-between overflow-hidden"
                        style={{
                            background: preview.backgroundImg
                                ? `url("${preview.backgroundImg}") center/cover no-repeat`
                                : (watched.bgColorCode || "#E6F3FF"),
                            color: watched.textColorCode || "#000000",
                        }}
                    >
                        {hasPreviewImage && (
                            <button
                                type="button"
                                onClick={handlePreviewRemove}
                                className="absolute top-4 right-4 z-20 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        )}

                        {/* Overlay for better readability on images */}
                        {preview.backgroundImg && <div className="absolute inset-0 bg-black/10" />}

                        <div className="text-center z-10 relative">
                            <img src={iconImg} className="w-20 h-20 mx-auto" alt="Icon" />
                            <h2 className="text-xl font-bold mt-3">{watched.name || passData.name || "Event Name"}</h2>

                            {/* Dates & Time Slots */}
                            {/* {(watched.startDate || watched.endDate || validTimeSlots.length > 0) && (
                                <div className="mt-4 text-sm text-center">
                                    {watched.startDate || watched.endDate ? (
                                        <p>
                                            Valid {watched.startDate ? `from ${formatDate(watched.startDate)}` : ''}
                                            {watched.endDate ? ` to ${formatDate(watched.endDate)}` : ''}
                                        </p>
                                    ) : null}
                                    {validTimeSlots.length > 0 && (
                                        <>
                                            <p className="mt-2 font-semibold">Time Slots:</p>
                                            {validTimeSlots.map((slot, idx) => (
                                                <p key={idx}>{slot.start} - {slot.end}</p>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )} */}

                            {/* Status Indicators */}
                            <div className="mt-3 space-y-2">
                                {autoApprove && (
                                    <div className="text-xs bg-green-100 px-3 py-1 rounded-full text-green-800 inline-block">
                                        ✓ Auto Approved
                                    </div>
                                )}

                                {isMultiEntry && (
                                    <div className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-800 inline-block ml-2">
                                        ✓ Multi-Entry
                                    </div>
                                )}

                                {skipCoordinator && (
                                    <div className="text-xs bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 inline-block ml-2">
                                        ✓ Skip Coordinator
                                    </div>
                                )}
                            </div>

                            {/* Limits (Conditional on >0) */}
                            {(watched.seatsCount > 0 || watched.vehiclesCount > 0) && (
                                <div className="mt-3 text-sm">
                                    {watched.seatsCount > 0 && <p>Seats: {watched.seatsCount}</p>}
                                    {watched.vehiclesCount > 0 && <p>Vehicles: {watched.vehiclesCount}</p>}
                                </div>
                            )}

                            {/* Locations */}
                            {/* {selectedLocNames.length > 0 && (
                                <div className="mt-3 text-sm">
                                    <strong>Locations:</strong>
                                    {selectedLocNames.map((name, idx) => (
                                        <p key={idx} className="truncate">• {name}</p>
                                    ))}
                                </div>
                            )} */}
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md z-10 relative text-center">
                            <img src={QrPassImg} className="w-32 h-32 mx-auto" alt="QR Code" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalPassEdit;