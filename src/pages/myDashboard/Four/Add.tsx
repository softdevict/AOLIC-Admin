import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard_4, my_dashboard_all_users_3 } from "../../../api/config";
import { Typography, TextField, Button, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import ClearIcon from '@mui/icons-material/Clear';

interface FormData {
    name: string;
    img: FileList;
    commonlink: string;
    excelFile?: FileList;
}

interface SpecificUser {
    id: string;
    email?: string;
    phone?: string;
    link?: string;
}

interface DashboardCard {
    id: string;
    name: string;
    img: File;
    imgUrl?: string;
    commonlink: string;
    specifyLink?: SpecificUser[];
}

const Fourth_My_Dashboard_Add: React.FC = () => {
    const { root_Card_4 } = useParams<{ root_Card_4: string }>();
    const dashboardId = root_Card_4 || "default-dashboard-id";
    const navigate = useNavigate();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            commonlink: "",
        },
    });
    const [searchResults, setSearchResults] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [allUsers, setAllUsers] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const commonlink = watch("commonlink");
    const selectedImg = watch("img");
    const location = useLocation();
    // Log dashboardId for debugging
    console.log("🚀 ~ Fourth_My_Dashboard_Add ~ dashboardId:", dashboardId);

    // Fetch all available users on mount
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await axios.get(`${my_dashboard_all_users_3}/${dashboardId}`);
                console.log("🚀 ~ fetchAllUsers ~ response:", response);
                setAllUsers(response.data.data || []);
            } catch (error) {
                console.error("Error fetching all users:", error);
                toast.error("Failed to load users from server.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        };
        if (dashboardId) {
            fetchAllUsers();
        }
    }, [dashboardId]);

    // Handle image preview
    useEffect(() => {
        if (selectedImg && selectedImg[0]) {
            const previewUrl = URL.createObjectURL(selectedImg[0]);
            setImagePreview(previewUrl);
            return () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            };
        } else {
            setImagePreview(null);
        }
    }, [selectedImg]);

    // Search users by email or phone
    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const filtered = allUsers.filter(
            (user) =>
                (user.email && user.email.toLowerCase().includes(query.toLowerCase())) ||
                (user.phone && user.phone.includes(query))
        );
        setSearchResults(filtered);
    };

    // Parse Excel files for users


    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            let totalAdded = 0;
            let totalNotAdded = 0;

            for (const file of Array.from(files)) {
                const reader = new FileReader();

                await new Promise<void>((resolve, reject) => {
                    reader.onload = (evt) => {
                        try {
                            const bstr = evt.target?.result as string;
                            const wb = XLSX.read(bstr, { type: "binary" });
                            const wsname = wb.SheetNames[0];
                            const ws = wb.Sheets[wsname];

                            const data = XLSX.utils.sheet_to_json<{
                                Email?: string;
                                Phone?: string;
                                Link?: string;
                            }>(ws, {
                                header: ["Email", "Phone", "Link"], // 👈 include Link column
                                raw: false,
                                defval: "",
                                blankrows: false,
                            });

                            if (!data.length || (!data[0].Email && !data[0].Phone)) {
                                toast.error(`Invalid data in ${file.name}. Must have "Email" or "Phone".`);
                                resolve();
                                return;
                            }

                            const excelUsers = data
                                .map((row) => ({
                                    email: row.Email?.trim(),
                                    phone: row.Phone?.trim(),
                                    link: row.Link?.trim(),
                                }))
                                .filter((u) => u.email || u.phone);

                            let added = 0;
                            let notAdded = 0;

                            const newUsers: SpecificUser[] = [];

                            excelUsers.forEach((excelUser) => {
                                const matchingUser = allUsers.find(
                                    (u) =>
                                        (excelUser.email &&
                                            u.email &&
                                            u.email.toLowerCase() === excelUser.email.toLowerCase()) ||
                                        (excelUser.phone && u.phone === excelUser.phone)
                                );

                                if (matchingUser) {
                                    const alreadyExists = specificUsers.some((u) => u.id === matchingUser._id);

                                    if (!alreadyExists) {
                                        newUsers.push({
                                            id: matchingUser._id,
                                            email: matchingUser.email,
                                            phone: matchingUser.phone,
                                            // ✅ Priority: Excel Link → Common Link → ""
                                            link: excelUser.link || commonlink?.trim() || "",
                                        });
                                        added++;
                                    }
                                } else {
                                    notAdded++;
                                }
                            });

                            if (newUsers.length > 0) {
                                setSpecificUsers((prev) => [...prev, ...newUsers]);
                            }

                            totalAdded += added;
                            totalNotAdded += notAdded;

                            if (added > 0 || notAdded > 0) {
                                toast.info(
                                    `From ${file.name}: Added ${added} users, ${notAdded} not found.`,
                                    { autoClose: 4000 }
                                );
                            }

                            resolve();
                        } catch (err) {
                            console.error("Excel parse error:", err);
                            toast.error(`Error parsing ${file.name}`);
                            resolve();
                        }
                    };

                    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
                    reader.readAsBinaryString(file);
                });
            }

            if (fileInputRef.current) fileInputRef.current.value = "";

            if (totalAdded > 0 || totalNotAdded > 0) {
                toast.info(`Total: Added ${totalAdded}, ${totalNotAdded} not found.`, {
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error("Excel upload failed:", error);
            toast.error("Failed to process Excel upload.");
        }
    };



    // Add selected users
    const handleAddUsers = () => {
        const newUsers = searchResults.filter((u) => selectedUsers.includes(u._id));
        setSpecificUsers((prev) => [
            ...prev,
            ...newUsers
                .map((u) => ({
                    id: u._id,
                    email: u.email,
                    phone: u.phone,
                    link: userLinks[u._id] || "",
                }))
                .filter((u) => !prev.some((p) => p.id === u.id)),
        ]);
        setUserLinks({});
        setSelectedUsers([]);
    };

    // Update temporary link for a user
    const handleUserLinkChange = (userId: string, link: string) => {
        setUserLinks((prev) => ({ ...prev, [userId]: link }));
    };

    // Delete a user
    const handleDeleteUser = (index: number) => {
        setSpecificUsers((prev) => prev.filter((_, i) => i !== index));
    };

    // Modify a user's link
    const handleModifyLink = (index: number, newLink: string) => {
        setSpecificUsers((prev) => {
            const newUsers = [...prev];
            newUsers[index] = { ...newUsers[index], link: newLink };
            return newUsers;
        });
    };

    // Form submission
    const onSubmit = async (data: FormData) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);

            if (data.img && data.img[0]) {
                formData.append("img", data.img[0]);
            } else {
                throw new Error("Image is required.");
            }

            formData.append("commonlink", data.commonlink);

            if (specificUsers.length > 0) {
                const specifyLink = specificUsers.map((u) => ({
                    id: u.id,
                    link: u.link || "",
                }));
                formData.append("specifyLink", JSON.stringify(specifyLink));
            }

            console.log("FormData being sent:", Object.fromEntries(formData));

            const response = await axios.post(
                `${my_dashboard_4}/${dashboardId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            reset();
            setSpecificUsers([]);
            setSelectedUsers([]);
            setUserLinks({});
            setUploadMessage("");
            setImagePreview(null);

            toast.success("Dashboard card added successfully!", {
                position: "top-right",
                autoClose: 3000,
                onClose: () => navigate(`/my_dashboard_4/${dashboardId}`),
            });
        } catch (error) {
            console.error("Error adding dashboard card:", error);
            let errorMessage = "Failed to add dashboard card.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const nested_1 = location.state?.d1 || "";
    // console.log("🚀 ~ Fourth_My_Dashboard_Add ~ nested_1:", nested_1)
    const nested_2 = location.state?.d2 || "";
    // console.log("🚀 ~ Fourth_My_Dashboard_Add ~ nested_2:", nested_2)
    const nested_3 = location.state?.d3 || "";
    // console.log("🚀 ~ Fourth_My_Dashboard_Add ~ nested_3:", nested_3)
    const nested_4 = location.state?.d4 || "";
    // console.log("🚀 ~ Fourth_My_Dashboard_Add ~ nested_4:", nested_4)

    // Clear all data
    const handleClearAll = () => {
        reset();
        setSpecificUsers([]);
        setSelectedUsers([]);
        setUserLinks({});
        setUploadMessage("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.info("Form cleared successfully!");
    };


    return (
        <>
            <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2 ">
                <Link to="/">
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                </Link>
                <li>/</li>
                <Link to="/my_dashboard">
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">My Dashboard</button>
                </Link>
                <li>/</li>
                <Link to={`/my_dashboard_1/${nested_1}`}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Nested 1</button>
                </Link>
                <li>/</li>
                <Link to={`/my_dashboard_2/${nested_2}`} state={{ d1: nested_1 }}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Nested 2</button>
                </Link>
                <li>/</li>
                <Link to={`/my_dashboard_3/${nested_3}`} state={{ d1: nested_1, d2: nested_2 }}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Nested 3</button>
                </Link>
                <li>/</li>
                <Link to={`/my_dashboard_4/${nested_4}`} state={{ d1: nested_1, d2: nested_2, d3: nested_3 }}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Nested 4</button>
                </Link>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                        Add
                    </button>
                </li>
            </ol>
            <ToastContainer />
            <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow">
                <div className="flex justify-between px-2">
                    <Typography variant="h5" className="mb-4 font-bold">Add Dashboard Card</Typography>
                    <ClearIcon
                        onClick={() =>
                            navigate(`/my_dashboard_4/${nested_4}`, { state: { d1: nested_1, d2: nested_2, d3: nested_3 } })
                        }
                        style={{ cursor: "pointer" }}
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Section 1 - Basic Info */}
                    {/* <div className="border p-4 rounded"> */}
                    {/* <Typography variant="h6" className="mb-2">Basic Info</Typography> */}
                    <div className="space-y-3">
                        <div className="w-full mb-4">
                            <label className={`block text-sm font-medium mb-1 ${errors.name ? "text-red-500" : "text-gray-700"}`}>
                                Card Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                {...register("name", { required: "Name is required" })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="w-full mb-4">
                            <label className={`block text-sm font-medium mb-1 ${errors.img ? "text-red-500" : "text-gray-700"}`}>
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register("img", { required: "Image is required" })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.img ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                            />
                            {errors.img && (
                                <p className="text-sm text-red-500 mt-1">{errors.img.message}</p>
                            )}
                        </div>

                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-2 w-32 h-32 object-cover rounded"
                            />
                        )}
                        <div className="w-full mb-4">
                            <label className={`block text-sm font-medium mb-1 ${errors.commonlink ? "text-red-500" : "text-gray-700"}`}>
                                Common Link
                            </label>
                            <input
                                type="text"
                                placeholder="Enter common link"
                                {...register("commonlink", {
                                    required: "Common link is required",
                                    pattern: {
                                        value: /^https:\/\/.+/,
                                        message: "Link must start with https://",
                                    },
                                })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.commonlink ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                            />
                            {errors.commonlink && (
                                <p className="text-sm text-red-500 mt-1">{errors.commonlink.message}</p>
                            )}
                        </div>


                        {/* </div> */}


                        {/* Section 2 - User Selection */}
                        {/* <div className="border p-4 rounded"> */}
                        {/* <Typography variant="h6" className="mb-2">User Selection</Typography> */}
                        <div className="space-y-3">
                            <div>
                                <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                    Select Users (from {allUsers.length} available)
                                </h6>

                                <div className="w-full mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search by Email or Phone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter email or phone"
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm outline-none
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                    />
                                </div>

                                <div className="mt-2 max-h-40 overflow-y-auto">
                                    {searchResults.map((user, i) => (
                                        <div key={i} className="p-2 border rounded mb-1">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={() => {
                                                        setSelectedUsers((prev) =>
                                                            prev.includes(user._id)
                                                                ? prev.filter((id) => id !== user._id)
                                                                : [...prev, user._id]
                                                        );
                                                    }}
                                                />
                                                <span className="ml-2 flex-1">{user.email || user.phone || "Unknown"}</span>
                                            </div>
                                            {selectedUsers.includes(user._id) && (
                                                <div className="w-full mt-2">
                                                    <label htmlFor={`customLink-${user._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                        Custom Link
                                                    </label>
                                                    <input
                                                        id={`customLink-${user._id}`}
                                                        type="text"
                                                        placeholder="Enter link for this user"
                                                        value={userLinks[user._id] || ""}
                                                        onChange={(e) => handleUserLinkChange(user._id, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm outline-none
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                                    />
                                                </div>

                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddUsers}
                                    disabled={selectedUsers.length === 0}
                                    className={`mt-2 px-4 py-2 rounded-lg shadow-sm text-white font-medium transition 
    ${selectedUsers.length === 0
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500"
                                        }`}
                                >
                                    Add Selected Users
                                </button>

                            </div>

                            <div>
                                <div className="mb-4">
                                    <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                        Upload Excel for Users
                                    </h6>
                                    {uploadMessage && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {uploadMessage}
                                        </p>
                                    )}
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleExcelUpload}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm outline-none
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>





                    {/* Section 3 - Added Users */}
                    {specificUsers.length > 0 && (
                        <div className="border p-4 rounded">
                            <div className="flex justify-between items-center mb-2">

                                <h3 className="text-lg font-semibold">
                                    Added Specific Users
                                </h3>

                                <button
                                    onClick={handleClearAll}
                                    className="mt-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300 
             bg-gradient-to-r from-red-400 via-red-500 to-red-600 
             hover:from-red-500 hover:via-red-600 hover:to-red-700 
             hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    Clear All
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                                Specific Users: {specificUsers.length}
                            </p>

                            <div className="space-y-2">
                                {specificUsers.map((user, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span>{user.email || user.phone || "Unknown"}</span>
                                        <div className="flex-1 mb-2">
                                            <label htmlFor={`userLink-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Link
                                            </label>
                                            <input
                                                id={`userLink-${index}`}
                                                type="text"
                                                placeholder="Enter link"
                                                value={user.link || ""}
                                                onChange={(e) => handleModifyLink(index, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${!!user.link && !/^https:\/\/.+/.test(user.link) ? "border-red-500" : "border-gray-300"}
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                                            />
                                            {!!user.link && !/^https:\/\/.+/.test(user.link) && (
                                                <p className="text-sm text-red-500 mt-1">Link must start with https://</p>
                                            )}
                                        </div>

                                        <IconButton onClick={() => handleDeleteUser(index)}>
                                            <CancelIcon color="error" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        // color="primary"
                        sx={{
                            background: 'linear-gradient(to right, #27ae60, #27ae93)',
                            color: '#fff', // white text
                            '&:hover': {
                                background: 'linear-gradient(to right, #27ae60, #27ae93)',
                                filter: 'brightness(1.1)',
                            },
                            borderRadius: '12px',
                            py: 1.5, // padding top & bottom
                            fontWeight: 'bold',
                        }}
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        className="mt-4"
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </>
    );
};

export default Fourth_My_Dashboard_Add;