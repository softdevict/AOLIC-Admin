import React, { useState, useEffect } from "react";
import { ColorRing } from "react-loader-spinner";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    LocationOff as LocationOffIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { location as LOCATION_API } from "../../../api/config";

interface Location {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}

interface FormData {
    id: string | null;
    name: string;
    latitude: string;
    longitude: string;
    image: string;
}

interface ButtonProps {
    text: string;
    loading?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary";
}

/** Reusable gradient button */
const Button: React.FC<ButtonProps> = ({
    text,
    loading = false,
    onClick,
    disabled = false,
    variant = "primary",
}) => {
    const base =
        "flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white transition-all duration-300 border";
    const style =
        variant === "primary"
            ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            : "bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:to-gray-800";
    const shadow =
        variant === "primary"
            ? "shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
            : "shadow-[0_2px_10px_rgba(148,163,184,0.2)]";

    return (
        <button
            type="button"
            disabled={loading || disabled}
            onClick={(e) => {
                e.preventDefault();
                onClick?.();
            }}
            className={`${base} ${style} ${shadow} ${loading || disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {loading && (
                <ColorRing
                    visible={true}
                    height={20}
                    width={20}
                    colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
                />
            )}
            <span className="text-sm">{text}</span>
        </button>
    );
};

const LocationPage: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [formData, setFormData] = useState<FormData>({
        id: null,
        name: "",
        latitude: "",
        longitude: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [loading, setLoading] = useState({
        page: true,
        add: false,
        update: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fetchError, setFetchError] = useState(false);

    /** Fetch all locations */
    const fetchLocations = async () => {
        try {
            setFetchError(false);
            const res = await axios.get(LOCATION_API);
            console.log("🚀 ~ fetchLocations ~ res:", res)
            if (res.data.success) {
                const formatted = res.data.data.map((l: any) => ({
                    id: l._id,
                    name: l.name,
                    latitude: l.lat,
                    longitude: l.long,
                    image: l.img || "",
                    createdAt: l.createdAt,
                    updatedAt: l.updatedAt,
                }));
                setLocations(formatted);
            } else {
                setLocations([]);
            }
        } catch (err) {
            console.error(err);
            setLocations([]);
            setFetchError(true);
        } finally {
            setLoading((p) => ({ ...p, page: false }));
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    /** Validate form before submit */
    const validateForm = () => {
        const errs: Record<string, string> = {};
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (!formData.name.trim()) errs.name = "Location name is required.";
        if (isNaN(lat) || lat < -90 || lat > 90)
            errs.latitude = "Latitude must be between -90 and 90.";
        if (isNaN(lng) || lng < -180 || lng > 180)
            errs.longitude = "Longitude must be between -180 and 180.";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /** Handle input change */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    /** Handle image upload */
    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setFormData((p) => ({ ...p, image: URL.createObjectURL(file) }));
        }
    };

    /** Add new location */
    const handleAdd = async () => {
        if (!validateForm()) return;
        setLoading((p) => ({ ...p, add: true }));
        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("lat", formData.latitude);
            fd.append("long", formData.longitude);
            if (imageFile) fd.append("img", imageFile);

            const res = await axios.post(LOCATION_API, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("🚀 ~ handleAdd ~ res:", res);

            if (res.data.success) {
                // Reload page after success
                window.location.reload();
            } else {
                // No toast; proceed to reload in finally
            }
        } catch (err) {
            console.error(err);
            // No toast; proceed to reload in finally
        } finally {
            setLoading((p) => ({ ...p, add: false }));
            closeModal();
            // Always reload after submit attempt to display updated table
            window.location.reload();
        }
    };

    /** Update existing location */
    const handleUpdate = async () => {
        if (!validateForm() || !formData.id) return;
        setLoading((p) => ({ ...p, update: true }));

        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("lat", formData.latitude);
            fd.append("long", formData.longitude);
            if (imageFile) fd.append("img", imageFile);

            const res = await axios.patch(`${LOCATION_API}/${formData.id}`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("🚀 ~ handleUpdate ~ res:", res);

            if (res.data.success) {
                toast.success("Location updated successfully!");
                await fetchLocations();
            } else {
                toast.error("Failed to update location.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update location.");
        } finally {
            setLoading((p) => ({ ...p, update: false }));
            closeModal();
        }
    };

    /** Delete location */
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this location?"))
            return;

        try {
            await axios.delete(`${LOCATION_API}/${id}`);
            toast.success("Location deleted successfully!");
            await fetchLocations();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete location.");
        }
    };

    /** Modal control */
    const openAddModal = () => {
        resetForm();
        setMode("add");
        setModalOpen(true);
    };
    const openEditModal = (loc: Location) => {
        setFormData({
            id: loc.id,
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            image: loc.image,
        });
        setImageFile(null);
        setMode("edit");
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);
    const resetForm = () =>
        setFormData({ id: null, name: "", latitude: "", longitude: "", image: "" });

    /** Page loading spinner */
    if (loading.page)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <ColorRing
                    visible={true}
                    height="80"
                    width="80"
                    colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]}
                />
            </div>
        );
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            <ToastContainer position="top-right" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                {adminType === "super admin" && (
                    <ol className="flex text-gray-500 font-semibold space-x-2 mb-4">
                        <Link to="/">Home</Link>
                        <li>/</li>
                        <Link to="/my_dashboard">My Dashboard</Link>
                        <li>/</li>
                        <li className="text-black">Geo Locations</li>
                    </ol>)}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2">
                        Geo Locations
                    </h1>
                    <Button text="Add Location" onClick={openAddModal} />
                </div>

                {fetchError ? (
                    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-red-300 shadow-inner">
                        <LocationOffIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 mb-2">
                            Failed to load locations
                        </h3>
                        <p className="text-slate-500 mb-4">Please check your connection and try again.</p>
                        <Button
                            text="Retry"
                            variant="primary"
                            onClick={fetchLocations}
                        />
                    </div>
                ) : locations.length ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-50 border-b-2 border-blue-200 text-slate-700">
                                <tr>
                                    {["S.No", "Name", "Image", "Latitude", "Longitude", "Actions"].map(
                                        (th) => (
                                            <th
                                                key={th}
                                                className="px-6 py-3 text-left font-semibold uppercase tracking-wider"
                                            >
                                                {th}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {locations.map((loc, i) => (
                                    <tr
                                        key={loc.id}
                                        className="hover:bg-blue-50 transition duration-150"
                                    >
                                        <td className="px-6 py-3">{i + 1}</td>
                                        <td className="px-6 py-3 font-medium">{loc.name}</td>
                                        <td className="px-6 py-3">
                                            <img
                                                src={loc.image}
                                                alt={loc.name}
                                                className="w-12 h-12 object-cover rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/48x48/10B981/FFFFFF?text=${loc.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}`;
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-3">{loc.latitude}</td>
                                        <td className="px-6 py-3">{loc.longitude}</td>
                                        <td className="px-6 py-3 flex gap-3">
                                            <button
                                                onClick={() => openEditModal(loc)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300 shadow-inner">
                        <LocationOffIcon className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 mb-2">
                            No locations yet
                        </h3>
                        <p className="text-slate-500">Get started by adding your first one!</p>
                    </div>
                )}

                {/* Modal */}
                {modalOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl relative"
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                            >
                                <CloseIcon />
                            </button>

                            <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                {mode === "add" ? (
                                    <AddIcon className="text-blue-600" />
                                ) : (
                                    <EditIcon className="text-blue-600" />
                                )}
                                {mode === "add" ? "Add Location" : "Edit Location"}
                            </h3>

                            {/* Form */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Location Name
                                    </label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${errors.name
                                            ? "border-red-300 bg-red-50 focus:ring-red-500"
                                            : "border-slate-300 focus:ring-blue-500"
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    {["latitude", "longitude"].map((field) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                                                {field}
                                            </label>
                                            <input
                                                name={field}
                                                value={formData[field as "latitude" | "longitude"]}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${errors[field]
                                                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                                                    : "border-slate-300 focus:ring-blue-500"
                                                    }`}
                                            />
                                            {errors[field] && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors[field]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Image
                                    </label>
                                    {formData.image && (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-lg mb-2"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImage}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 file:rounded-full hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <Button
                                    text={mode === "add" ? "Add Location" : "Update Location"}
                                    loading={mode === "add" ? loading.add : loading.update}
                                    onClick={mode === "add" ? handleAdd : handleUpdate}
                                    disabled={mode === "add" ? loading.add : loading.update}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default LocationPage;