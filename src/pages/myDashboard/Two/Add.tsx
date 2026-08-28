import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard_2, my_dashboard_all_users_1 } from "../../../api/config";
import { Typography, TextField, Button, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import ClearIcon from '@mui/icons-material/Clear';

interface FormData {
    name: string;
    img: FileList;
    optionType: "nested" | "specific";
    commonlink?: string;
    excelFile?: FileList;
}

interface NestedUser {
    id: string;
    email?: string;
    phone?: string;
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
    optionType: "nested" | "specific";
    commonlink?: string;
    allowUser?: NestedUser[];
    specifyLink?: SpecificUser[];
}

const Second_My_Dashboard_Add: React.FC = () => {
    const { root_Card_2 } = useParams<{ root_Card_2: string }>();
    const dashboardId = root_Card_2 || "default-dashboard-id";
    const navigate = useNavigate();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            optionType: "nested",
            commonlink: "",
        },
    });
    const [searchResults, setSearchResults] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [cards, setCards] = useState<DashboardCard[]>([]);
    const [allUsers, setAllUsers] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const optionType = watch("optionType");
    const commonlink = watch("commonlink");
    const selectedImg = watch("img");
    const location = useLocation();
    console.log("🚀 ~ Second_My_Dashboard_Add ~ location:", location)
    const nested_1 = location.state?.d1 || "";
    console.log("🚀 ~ Second_My_Dashboard_Add ~ nested_1:", nested_1)
    const nested_2 = location.state?.d2 || "";
    console.log("🚀 ~ Second_My_Dashboard_Add ~ nested_2:", nested_2)
    // Log dashboardId for debugging
    console.log("🚀 ~ First_My_Dashboard_Add ~ dashboardId:", dashboardId);

    // Fetch all available users on mount
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await axios.get(`${my_dashboard_all_users_1}/${dashboardId}`);
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


    // ✅ handleExcelUpload now uses allUsers from state
    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!allUsers || allUsers.length === 0) {
            toast.error("No users found in dashboard.");
            return;
        }

        let totalAdded = 0;
        let totalNotFound = 0;
        let totalDuplicates = 0;

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    const parsedData = XLSX.utils
                        .sheet_to_json<any>(sheet, {
                            header: optionType === "nested" ? ["email", "phone"] : ["email", "phone", "link"],
                            raw: false,
                            defval: "",
                            blankrows: false,
                        })
                        .map((row) => {
                            const obj: { email?: string; phone?: string; link?: string } = {};
                            Object.keys(row).forEach((k) => {
                                const key = k.toLowerCase();
                                if (key === "email") obj.email = row[k];
                                if (key === "phone") obj.phone = row[k];
                                if (key === "link" && optionType !== "nested") obj.link = row[k];
                            });
                            return obj;
                        });

                    let added = 0;
                    let notFound = 0;
                    let duplicates = 0;

                    const userList = parsedData
                        .map((u) => {
                            const matchedUser = allUsers.find(
                                (user: any) =>
                                    (u.email && user.email?.toLowerCase() === u.email.toLowerCase()) ||
                                    (u.phone && user.phone === u.phone)
                            );

                            if (!matchedUser) {
                                notFound++;
                                return null;
                            }

                            const isDuplicate =
                                optionType === "nested"
                                    ? nestedUsers.some((user) => user.id === matchedUser._id)
                                    : specificUsers.some((user) => user.id === matchedUser._id);

                            if (isDuplicate) {
                                duplicates++;
                                return null;
                            }

                            if (optionType === "nested") {
                                return { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone };
                            } else {
                                return {
                                    id: matchedUser._id,
                                    email: matchedUser.email,
                                    phone: matchedUser.phone,
                                    link: u.link || "", // optional
                                };
                            }
                        })
                        .filter(Boolean) as (NestedUser | SpecificUser)[];

                    if (optionType === "nested") {
                        setNestedUsers((prev) => [...prev, ...userList.filter((u) => !prev.some((p) => p.id === u.id))]);
                    } else {
                        setSpecificUsers((prev) => [...prev, ...userList.filter((u) => !prev.some((p) => p.id === u.id))]);
                    }

                    added = userList.length;
                    totalAdded += added;
                    totalNotFound += notFound;
                    totalDuplicates += duplicates;

                    setUploadMessage(
                        `From ${file.name}: Added ${added}, ${notFound} not found, ${duplicates} duplicates ignored.`
                    );
                } catch (error) {
                    console.error("Error parsing Excel:", error);
                    setUploadMessage(`Error parsing ${file.name}`);
                }
            };

            reader.readAsArrayBuffer(file);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";

        if (totalAdded || totalNotFound || totalDuplicates) {
            setUploadMessage(
                `Total: Added ${totalAdded}, ${totalNotFound} not found, ${totalDuplicates} duplicates ignored.`
            );
        }
    };

    // Add selected users
    const handleAddUsers = () => {
        const newUsers = searchResults.filter((u) => selectedUsers.includes(u._id));

        if (optionType === "nested") {
            setNestedUsers((prev) => [
                ...prev,
                ...newUsers
                    .map((u) => ({ id: u._id, email: u.email, phone: u.phone }))
                    .filter((u) => !prev.some((p) => p.id === u.id)),
            ]);
        } else {
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
        }

        setSelectedUsers([]);
    };

    // Update temporary link for a user
    const handleUserLinkChange = (userId: string, link: string) => {
        setUserLinks((prev) => ({ ...prev, [userId]: link }));
    };

    // Delete a user
    const handleDeleteUser = (index: number, type: "nested" | "specific") => {
        if (type === "nested") {
            setNestedUsers((prev) => prev.filter((_, i) => i !== index));
        } else {
            setSpecificUsers((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Modify a user's link (for specific users)
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

            formData.append("optionType", data.optionType);
            formData.append("commonlink", data.commonlink || "");

            // Always include nested users
            if (nestedUsers.length > 0) {
                const allowUserIds = nestedUsers.map((u) => u.id);
                formData.append("allowUser", JSON.stringify(allowUserIds));
            }

            // Always include specific users
            if (specificUsers.length > 0) {
                const specifyLink = specificUsers.map((u) => ({
                    id: u.id,
                    link: u.link || "",
                }));
                formData.append("specifyLink", JSON.stringify(specifyLink));
            }

            console.log("FormData being sent:", Object.fromEntries(formData));

            const response = await axios.post(
                `${my_dashboard_2}/${dashboardId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("Dashboard card added successfully!", {
                position: "top-right",
                autoClose: 3000,
                onClose: () => navigate(`/my_dashboard_2/${dashboardId}`),
            });
        } catch (error) {
            console.error("Error adding dashboard card:", error);
            toast.error("Failed to add dashboard card.", { autoClose: 5000 });
        }
    };

    return (
        <>
            <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
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
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                        Add
                    </button>
                </li>
            </ol >
            <ToastContainer />
            <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow">
                <div className="flex justify-between px-2">

                    <Typography variant="h5" className="mb-4 font-bold">Add Dashboard Card</Typography>
                    <ClearIcon
                        onClick={() =>
                            navigate(`/my_dashboard_2/${nested_2}`, { state: { d1: nested_1 } })
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                {...register("name", { required: "Name is required" })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.name ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register("img", { required: "Image is required" })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.img ? "border-red-500" : "border-gray-300"}`}
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
                    </div>
                    {/* </div> */}

                    {/* Section 2 - Card Type and User Selection */}
                    {/* <div className="border p-4 rounded"> */}
                    <h6 className="text-lg font-semibold mb-2 text-gray-800">
                        Card Type and Users
                    </h6>
                    <div className="space-y-3">
                        <TextField
                            fullWidth
                            select
                            label="Card Type"
                            {...register("optionType", { required: true })}
                            SelectProps={{ native: true }}
                        >
                            <option value="nested">Nested Dashboard</option>
                            <option value="specific">Specific Link</option>
                        </TextField>

                        {optionType === "specific" && (
                            <div className="w-full mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Common Link
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter common link"
                                    {...register("commonlink", {
                                        validate: (value) => {
                                            const link = value || "";
                                            if (optionType === "specific" && specificUsers.length > 0) {
                                                if (!link.trim()) {
                                                    return "Common link is required when adding specific users";
                                                }
                                                const httpsPattern = /^https:\/\/.+$/;
                                                if (!httpsPattern.test(link.trim())) {
                                                    return "Common link must start with https://";
                                                }
                                            }
                                            return true;
                                        },
                                    })}
                                    className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.commonlink ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.commonlink && (
                                    <p className="text-sm text-red-500 mt-1">{errors.commonlink.message}</p>
                                )}
                            </div>



                        )}

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
                                        {optionType === "specific" && selectedUsers.includes(user._id) && (
                                            <div className="w-full mt-2">
                                                <label
                                                    htmlFor={`customLink-${user._id}`}
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
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
                            <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                Upload Excel for Users
                            </h6>
                            {uploadMessage && <Typography className="text-sm text-gray-600 mb-2">{uploadMessage}</Typography>}
                            <div className="w-full mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Excel Files
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleExcelUpload}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm outline-none
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                />
                            </div>

                        </div>
                    </div>
                    {/* </div> */}

                    <p className="mb-2 text-gray-600 text-sm">
                        Nested Users: {nestedUsers.length} | Specific Users: {specificUsers.length} | Total: {nestedUsers.length + specificUsers.length}
                    </p>

                    {/* Section 3 - Added Users */}



                    {/* Nested Users List */}
                    {nestedUsers.length > 0 && (
                        <div className="border p-4 rounded">
                            <div className="mb-4">
                                <h6 className="text-base font-semibold mb-2 text-gray-800">Nested Users</h6>
                                {nestedUsers.map((user, index) => (
                                    <div key={index} className="flex items-center justify-between mb-1 p-2 border rounded-lg shadow-sm">
                                        <span className="text-gray-700">{user.email || user.phone || "Unknown"}</span>
                                        <IconButton onClick={() => handleDeleteUser(index, "nested")}> <CancelIcon color="error" /> </IconButton>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}




                    {/* Specific Users List */}
                    {specificUsers.length > 0 && (
                        <div className="border p-4 rounded">
                            <div>
                                <h6 className="text-base font-semibold mb-2 text-gray-800">
                                    Specific Users
                                </h6>

                                {specificUsers.map((user, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span>{user.email || user.phone || "Unknown"}</span>
                                        <div className="flex-1 mb-2">
                                            {/* <label
                                                htmlFor={`userLink-${index}`}
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Link
                                            </label> */}
                                            <input
                                                id={`userLink-${index}`}
                                                type="text"
                                                placeholder="Enter link"
                                                value={user.link || ""}
                                                onChange={(e) => handleModifyLink(index, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
      ${!!user.link && !/^https:\/\/.+/.test(user.link) ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {!!user.link && !/^https:\/\/.+/.test(user.link) && (
                                                <p className="text-sm text-red-500 mt-1">Link must start with https://</p>
                                            )}
                                        </div>

                                        <IconButton onClick={() => handleDeleteUser(index, "specific")}>
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
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        className="mt-4"
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
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </>
    );
};

export default Second_My_Dashboard_Add;
