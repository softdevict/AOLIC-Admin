import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../../components/button/Button";
import logo from "../../assets/img/favicon.png";
import { apply_digital_pass } from "../../api/config";

interface FormData {
    name: string;
    phone: string;
    email: string;
    location: string;
    photo: FileList;
}

const DigitalPassApply: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // ✅ Handle photo preview
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setPhotoPreview(previewURL);
        }
    };

    // ✅ Submit form to backend
    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            const answers = [
                { fieldLabel: "Name", value: data.name },
                { fieldLabel: "Phone Number", value: data.phone },
                { fieldLabel: "Email", value: data.email },
                { fieldLabel: "Location", value: data.location },
            ];

            const fd = new FormData();
            fd.append("submittedBy", data.email);
            fd.append("answers", JSON.stringify(answers));
            if (data.photo?.[0]) fd.append("photo", data.photo[0]);

            const res = await axios.post(apply_digital_pass, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                toast.success("✅ Digital Pass Application Submitted Successfully!");
                reset();
                setPhotoPreview(null);
            } else {
                toast.warning(res.data.message || "Submission failed");
            }
        } catch (error: any) {
            console.error("❌ Error submitting form:", error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={4000} />

            <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl w-full max-w-md p-6 sm:p-8 border border-white/20 relative z-10">
                {/* ✅ Logo Header */}
                <div className="text-center mb-6">
                    <img
                        src={logo}
                        alt="Event Logo"
                        className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-md mb-3"
                    />
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Apply for Digital Pass
                    </h2>
                    <p className="text-sm text-gray-600">Fill in your details below</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* ✅ Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("name", { required: "Name is required" })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-400"
                            placeholder="Enter your full name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* ✅ Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Enter valid 10-digit number",
                                },
                            })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-400"
                            placeholder="Enter phone number"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* ✅ Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register("email", { required: "Email is required" })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-400"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* ✅ Location */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("location", { required: "Location is required" })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-400"
                            placeholder="Enter your location"
                        />
                        {errors.location && (
                            <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                        )}
                    </div>

                    {/* ✅ Photo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Upload Photo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register("photo", { required: "Photo is required" })}
                            onChange={handlePhotoChange}
                            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-purple-400"
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-32 h-32 mt-3 object-cover rounded-xl mx-auto shadow-md"
                            />
                        )}
                        {errors.photo && (
                            <p className="text-red-500 text-xs mt-1">{errors.photo.message}</p>
                        )}
                    </div>

                    {/* ✅ Button */}
                    <div className="pt-2">
                        <Button text="Apply for Pass" loading={loading} />
                    </div>
                </form>

                {/* ✅ Footer */}
                <div className="mt-6 pt-4 border-t border-purple-100 text-center">
                    <p className="text-xs text-gray-500">Secure & Fast • No spam</p>
                </div>
            </div>
        </div>
    );
};

export default DigitalPassApply;
