import React, { useEffect, useState } from "react";
import axios from "axios";
import { digital_pass } from "../../../api/config";
import { ColorRing } from 'react-loader-spinner';

// ⭐ Define TypeScript Interface
interface ApplyFormTemplate {
    _id: string;
    img?: string;
    title: string;
    body: string;
    subBody?: string;
    endLine?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Button Component
interface ButtonProps {
    text: string;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, loading = false }) => {
    return (
        <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white transition-all duration-200
                ${loading
                    ? 'bg-gradient-to-r from-[#27ae60] to-[#27ae93] opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#27ae60] to-[#27ae93] hover:brightness-110'}
            `}
            style={{
                boxShadow: '0 4px 12px rgba(39, 174, 96, 0.5)',
            }}
        >
            {loading && (
                <ColorRing
                    visible={true}
                    height={24}
                    width={24}
                    colors={['#fff', '#fff', '#fff', '#fff', '#fff']}
                />
            )}
            <span>{text}</span>
        </button>
    );
};

const ApplayMessage: React.FC = () => {
    const [template, setTemplate] = useState<ApplyFormTemplate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ApplyFormTemplate>>({});
    const [updating, setUpdating] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 1️⃣ Fetch template
    const getTemplate = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${digital_pass}/ApplayFormTemplate`);

            console.log("GET Response:", res.data);

            if (res.data.success && res.data.data) {
                const fetchedTemplate = res.data.data;
                setTemplate(fetchedTemplate);
                setFormData({
                    title: fetchedTemplate.title,
                    body: fetchedTemplate.body,
                    subBody: fetchedTemplate.subBody || "",
                    endLine: fetchedTemplate.endLine || ""
                });
                setImagePreview(fetchedTemplate.img || null);
            }
        } catch (error) {
            console.error("GET Error:", error);
            setError("Failed to load template");
        } finally {
            setLoading(false);
        }
    };

    // 2️⃣ Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 3️⃣ Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 4️⃣ Update template
    const updateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!template || !formData.title || !formData.body) {
            alert("Title and Body are required!");
            return;
        }

        setUpdating(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("body", formData.body);
            formDataToSend.append("subBody", formData.subBody || "");
            formDataToSend.append("endLine", formData.endLine || "");

            if (imageFile) {
                formDataToSend.append("img", imageFile);
            }

            const res = await axios.put(
                `${digital_pass}/ApplayFormTemplate/${template._id}`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("PUT Response:", res.data);

            await getTemplate();
            setImageFile(null);
            alert("Template updated successfully!");
        } catch (error) {
            console.error("PUT Error:", error);
            alert("Failed to update template");
        } finally {
            setUpdating(false);
        }
    };

    // 5️⃣ On mount
    useEffect(() => {
        getTemplate();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ColorRing
                    visible={true}
                    height={80}
                    width={80}
                    colors={['#27ae60', '#27ae93', '#27ae60', '#27ae93', '#27ae60']}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                    <p className="font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600 text-lg">No template found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Apply Form Template
                </h2>

                <form
                    onSubmit={updateTemplate}
                    className="bg-white rounded-xl shadow-xl p-8 space-y-6"
                >
                    {/* Image Upload Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Template Image
                        </label>

                        {imagePreview && (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={imagePreview}
                                    alt="Template Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <label className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-[#27ae60] to-[#27ae93] text-white rounded-lg cursor-pointer hover:brightness-110 transition-all duration-200 font-semibold">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {imageFile ? "Change Image" : "Upload New Image"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                        {imageFile && (
                            <p className="text-sm text-green-600">✓ New image selected: {imageFile.name}</p>
                        )}
                    </div>

                    {/* Title Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ""}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27ae60] focus:border-transparent outline-none transition-all duration-200"
                            placeholder="Enter template title"
                        />
                    </div>

                    {/* Body Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Body <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="body"
                            value={formData.body || ""}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27ae60] focus:border-transparent outline-none transition-all duration-200 resize-vertical"
                            placeholder="Enter main body content"
                        />
                    </div>

                    {/* Sub Body Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Sub Body
                        </label>
                        <textarea
                            name="subBody"
                            value={formData.subBody || ""}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27ae60] focus:border-transparent outline-none transition-all duration-200 resize-vertical"
                            placeholder="Enter sub body content (optional)"
                        />
                    </div>

                    {/* End Line Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            End Line
                        </label>
                        <input
                            type="text"
                            name="endLine"
                            value={formData.endLine || ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27ae60] focus:border-transparent outline-none transition-all duration-200"
                            placeholder="Enter end line text (optional)"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button text="Update Template" loading={updating} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplayMessage;