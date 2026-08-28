import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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
    isInventoryManagement: boolean;
    autoApprove: boolean;
    isMultiEntry: boolean;
    skipCoordinator: boolean;
}

interface TimeSlot {
    start: string;
    end: string;
}

interface Location {
    _id: string;
    name: string;
}

const DigitalPassAdd: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [preview, setPreview] = useState({ backgroundImg: "" });
    const [formData, setFormData] = useState({
        name: "",
        bgColorCode: "#E6F3FF",
        textColorCode: "#000000",
        startDate: "",
        endDate: "",
        seatsCount: 0,
        vehiclesCount: 0,
        isInventoryManagement: false,
        autoApprove: false,
        isMultiEntry: false,
        skipCoordinator: false
    });
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // === Handle Background Image ===
    const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBackgroundFile(file);
        setPreview({ backgroundImg: URL.createObjectURL(file) });
    };

    // === Handle Remove Background Image ===
    const handleRemoveBackground = () => {
        setBackgroundFile(null);
        setPreview({ backgroundImg: "" });
    };

    // === Add Time Slot ===
    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { start: "", end: "" }]);
    };

    // === Remove Time Slot ===
    const removeTimeSlot = (index: number) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    // === Update Time Slot ===
    const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
        setTimeSlots(prev => prev.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        ));
    };

    // === Fetch Locations ===
    useEffect(() => {
        axios.get(location)
            .then(res => {
                if (res.data?.success) setLocations(res.data.data);
            })
            .catch(() => toast.error("Failed to load locations"));
    }, []);

    const handleLocationToggle = (id: string) => {
        setSelectedLocations(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // === Update Form Data Helper ===
    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // === Reset counts when inventory management is disabled ===
    useEffect(() => {
        if (!formData.isInventoryManagement) {
            updateFormData({ seatsCount: 0, vehiclesCount: 0 });
        }
    }, [formData.isInventoryManagement]);

    // === Submit ===
    const onSubmit = async () => {
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("bgColorCode", formData.bgColorCode.replace("#", ""));
            fd.append("textColorCode", formData.textColorCode.replace("#", ""));
            fd.append("active", "true");
            fd.append("isInventoryManagement", String(formData.isInventoryManagement));
            fd.append("autoApprove", String(formData.autoApprove));
            fd.append("isMultiEntry", String(formData.isMultiEntry));
            fd.append("skipCoordinator", String(formData.skipCoordinator));
            if (formData.startDate) fd.append("startDate", formData.startDate);
            if (formData.endDate) fd.append("endDate", formData.endDate);
            fd.append("seatsCount", String(formData.seatsCount));
            fd.append("vehiclesCount", String(formData.vehiclesCount));
            selectedLocations.forEach(id => fd.append("locationIds[]", id));
            // === Time Slots ===
            const validTimeSlots = timeSlots.filter(slot => slot.start && slot.end);
            if (validTimeSlots.length > 0) {
                fd.append("timeSlots", JSON.stringify(validTimeSlots));
            }
            // === ⭐ SEND BACKGROUND IMAGE — EXACTLY LIKE POSTMAN ===
            if (backgroundFile) {
                fd.append("backgroundImg", backgroundFile);
            }
            const response = await axios.post(digital_pass, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                toast.success("Pass Created Successfully!");
                setTimeout(() => navigate("/digitalPass"), 1200);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    const selectedLocNames = selectedLocations
        .map(id => locations.find(loc => loc._id === id)?.name)
        .filter(Boolean) as string[];

    const validTimeSlots = timeSlots.filter(slot => slot.start && slot.end);

    // Format date for display (e.g., "Nov 15, 2025")
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const adminType = localStorage.getItem("adminType");
    return (
        <div>
            <ToastContainer />
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* === LEFT SIDE FORM === */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        {adminType === "super admin" && (
                            <button onClick={() => navigate("/digitalPass")} className="p-2 rounded-full hover:bg-gray-200">
                                <ArrowBackIcon />
                            </button>
                        )}
                        <h2 className="text-2xl font-bold">Create Digital Pass</h2>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* === Event Name === */}
                        <div>
                            <label className="block mb-1 font-semibold">Event Name</label>
                            <input
                                type="text"
                                {...register("name")}
                                value={formData.name}
                                onChange={(e) => updateFormData({ name: e.target.value })}
                                className="w-full border p-3 rounded"
                                placeholder="Enter event name"
                            />
                        </div>

                        {/* === Date Section === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-semibold">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => updateFormData({ startDate: e.target.value })}
                                    className="w-full border p-3 rounded"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => updateFormData({ endDate: e.target.value })}
                                    className="w-full border p-3 rounded"
                                />
                            </div>
                        </div>

                        {/* === Time Slots Section === */}
                        <div>
                            <label className="block mb-1 font-semibold">Time Slots</label>
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

                        {/* === Design Section === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-semibold">Background Color</label>
                                <input
                                    type="color"
                                    value={formData.bgColorCode}
                                    onChange={(e) => updateFormData({ bgColorCode: e.target.value })}
                                    className="w-full h-12 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Text Color</label>
                                <input
                                    type="color"
                                    value={formData.textColorCode}
                                    onChange={(e) => updateFormData({ textColorCode: e.target.value })}
                                    className="w-full h-12 border rounded"
                                />
                            </div>
                        </div>

                        {/* === Location List === */}
                        <div>
                            <label className="block mb-1 font-semibold">Select Locations</label>
                            <div className="border rounded p-3 max-h-40 overflow-y-auto">
                                {locations.map(loc => (
                                    <label key={loc._id} className="block cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLocations.includes(loc._id)}
                                            onChange={() => handleLocationToggle(loc._id)}
                                            className="mr-2"
                                        /> {loc.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* === Inventory Management Toggle === */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInventoryManagement}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        updateFormData({ isInventoryManagement: newVal });
                                    }}
                                    className="mr-2"
                                />
                                <span>Enable Inventory Management</span>
                            </label>
                        </div>

                        {/* === Limits Section (Conditional) === */}
                        {formData.isInventoryManagement && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-semibold">Seats Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.seatsCount}
                                        onChange={(e) => updateFormData({ seatsCount: Number(e.target.value) || 0 })}
                                        className="w-full border p-3 rounded"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">Vehicles Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.vehiclesCount}
                                        onChange={(e) => updateFormData({ vehiclesCount: Number(e.target.value) || 0 })}
                                        className="w-full border p-3 rounded"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* === Auto Approve Toggle === */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.autoApprove}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        updateFormData({ autoApprove: newVal });
                                    }}
                                    className="mr-2"
                                />
                                <span>Auto Approve Requests</span>
                            </label>
                        </div>

                        {/* === Multi Entry Toggle === */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isMultiEntry}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        updateFormData({ isMultiEntry: newVal });
                                    }}
                                    className="mr-2"
                                />
                                <span>Enable Multi-Entry</span>
                            </label>
                        </div>

                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.skipCoordinator}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        updateFormData({ skipCoordinator: newVal });
                                    }}
                                    className="mr-2"
                                />
                                <span>Skip Coordinator</span>
                            </label>
                        </div>

                        {/* === Background Image Upload === */}
                        <div>
                            <label className="block mb-1 font-semibold">Background Image (Optional)</label>
                            <label className="border p-4 rounded-lg flex flex-col items-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBackgroundChange}
                                    className="hidden"
                                />
                                <span className="text-sm text-gray-600">Select Image</span>
                            </label>
                            {preview.backgroundImg && (
                                <div className="relative mt-3">
                                    <img
                                        src={preview.backgroundImg}
                                        alt="Preview"
                                        className="w-40 h-40 rounded-lg object-cover border"
                                    />
                                    <button
                                        onClick={handleRemoveBackground}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button text="Create Digital Pass" loading={loading} />
                    </form>
                </div>

                {/* === RIGHT SIDE PREVIEW === */}
                <div className="flex justify-center">
                    <div
                        className="w-[320px] h-[520px] rounded-3xl shadow-lg p-5 border flex flex-col justify-between"
                        style={{
                            background: preview.backgroundImg
                                ? `url(${preview.backgroundImg}) center/cover no-repeat`
                                : formData.bgColorCode,
                            color: formData.textColorCode,
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <img src={iconImg} className="w-20 h-20 mx-auto mb-4" alt="Icon" />
                            <h2 className="text-xl font-bold text-center">{formData.name}</h2>
                            {/* Dates & Time Slots */}
                            {(formData.startDate || formData.endDate || validTimeSlots.length > 0) && (
                                <div className="mt-4 text-sm text-center">
                                    {formData.startDate || formData.endDate ? (
                                        <p>
                                            Valid {formData.startDate ? `from ${formatDate(formData.startDate)}` : ''}
                                            {formData.endDate ? `to ${formatDate(formData.endDate)}` : ''}
                                        </p>
                                    ) : null}
                                    {validTimeSlots.length > 0 && (
                                        <>
                                            <p>Time Slots:</p>
                                            {validTimeSlots.map((slot, idx) => (
                                                <p key={idx}>{slot.start} - {slot.end}</p>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        
                            {/* Auto Approve Indicator */}
                            {formData.autoApprove && (
                                <div className="mt-3 text-sm text-center bg-green-100 px-2 py-1 rounded">
                                    Auto Approved
                                </div>
                            )}
                            {/* Multi Entry Indicator */}
                            {formData.isMultiEntry && (
                                <div className="mt-3 text-sm text-center bg-blue-100 px-2 py-1 rounded">
                                    Multi-Entry Allowed
                                </div>
                            )}
                            {/* Skip Coordinator Indicator */}
                            {formData.skipCoordinator && (
                                <div className="mt-3 text-sm text-center bg-yellow-100 px-2 py-1 rounded">
                                    Coordinator Skipped
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-md mt-auto">
                            <img src={QrPassImg} className="w-32 h-32 mx-auto" alt="QR Code" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalPassAdd;