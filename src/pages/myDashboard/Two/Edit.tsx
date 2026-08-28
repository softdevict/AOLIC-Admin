import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard_2_mod, my_dashboard_2_user_card_details, my_dashboard_all_users_1 } from "../../../api/config";
import { Typography, TextField, Button, IconButton, CircularProgress, Alert, FormControl, InputLabel } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import ClearIcon from '@mui/icons-material/Clear';

interface FormData {
    name: string;
    img?: FileList;
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

interface User {
    _id: string;
    email?: string;
    phone?: string;
}

const Second_My_Dashboard_Edit: React.FC = () => {
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: { optionType: "nested", commonlink: "", name: "" },
    });
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const optionType = watch("optionType");
    const commonlink = watch("commonlink");
    const name = watch("name");
    const { id: paramId } = useParams<{ id: string; dashboardId_2: string }>();
    const location = useLocation();
    console.log("🚀 ~ Second_My_Dashboard_Edit ~ location:", location)
    const navigate = useNavigate();
    const editCardId = paramId || (location.state as { id?: string })?.id;
    const { dashboardId_2 } = useParams<{ dashboardId_2: string }>();

    if (process.env.NODE_ENV === "development") {
        console.log("🚀 ~ First_My_Dashboard_Edit ~ location:", location);
        console.log("🚀 ~ First_My_Dashboard_Edit ~ editCardId:", editCardId);
        console.log("🚀 ~ First_My_Dashboard_Edit ~ dashboardId_2:", dashboardId_2);
    }
    const nested_1 = location.state?.d1 || "";
    console.log("🚀 ~ Second_My_Dashboard_Add ~ nested_1:", nested_1)
    const nested_2 = location.state?.d2 || "";
    console.log("🚀 ~ Second_My_Dashboard_Add ~ nested_2:", nested_2)
    // Fetch all users and card data once
    useEffect(() => {
        if (!editCardId || !dashboardId_2) {
            setError("Missing card ID or dashboard ID.");
            setLoading(false);
            toast.error("Missing ID(s). Redirecting to dashboard.", { position: "top-right", autoClose: 3000 });
            setTimeout(() => navigate(`/my_dashboard_1/${editCardId}`), 3000);
            return;
        }

        const fetchData = async (retries = 3, delay = 1000): Promise<void> => {
            try {
                setLoading(true);

                // Fetch all users
                const usersRes = await axios.get(`${my_dashboard_all_users_1}/${editCardId}`);
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || usersRes.data.data || [];
                setAllUsers(usersData);

                // Fetch card data
                const cardRes = await axios.get(`${my_dashboard_2_user_card_details}/${dashboardId_2}`);
                if (process.env.NODE_ENV === "development") {
                    console.log("🚀 ~ fetchCardData ~ res:", cardRes.data);
                }
                const cardData = cardRes.data.data || cardRes.data;
                if (!cardData || !cardData._id) throw new Error("Invalid card data received.");

                setValue("name", cardData.name || "");
                setValue("optionType", cardData.optionType || "nested");
                setValue("commonlink", cardData.commonlink || "");
                setExistingImageUrl(cardData.img || null);

                setNestedUsers(
                    Array.from(new Map((cardData.allowUser || []).map((user: any) => [user._id, user])).values()).map(
                        (user: any) => ({ id: user._id, email: user.email, phone: user.phone })
                    )
                );

                setSpecificUsers(
                    Array.from(new Map((cardData.specifyLink || []).map((item: any) => [item.id._id, item])).values()).map(
                        (item: any) => ({ id: item.id._id, email: item.id.email, phone: item.id.phone, link: item.link || "" })
                    )
                );
            } catch (error: any) {
                if (retries > 0 && error.response?.status === 429) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return fetchData(retries - 1, delay * 2);
                }
                const errorMessage = error.response?.data?.message || error.message || "Failed to load data.";
                setError(errorMessage);
                toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [editCardId, dashboardId_2, setValue, navigate]);

    // Handle image preview
    useEffect(() => {
        const imgFiles = watch("img");
        if (imgFiles && imgFiles[0]) {
            const url = URL.createObjectURL(imgFiles[0]);
            setImagePreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setImagePreview(null);
    }, [watch]);

    // Search users (client-side filtering)
    const handleSearch = useCallback(
        (query: string) => {
            if (!query.trim() || !allUsers.length) {
                setSearchResults([]);
                return;
            }
            const param = /^\d+$/.test(query) ? "phone" : "email";
            const filtered = allUsers.filter((user) =>
                param === "phone"
                    ? user.phone?.includes(query)
                    : user.email?.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        },
        [allUsers]
    );

    // Fetch all users
    const handleShowAllUsers = useCallback(() => {
        if (!allUsers.length) {
            toast.error("No users available.", { position: "top-right", autoClose: 5000 });
            return;
        }
        setSearchResults(allUsers);
    }, [allUsers]);

    // Handle Excel upload
    const handleExcelUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            if (optionType === "specific" && !commonlink) {
                toast.error("Common link is required when adding specific users.", { position: "top-right", autoClose: 5000 });
                return;
            }

            if (!allUsers.length) {
                toast.error("No users available for matching.", { position: "top-right", autoClose: 5000 });
                return;
            }

            const maxFileSize = 5 * 1024 * 1024; // 5MB
            for (const file of Array.from(files)) {
                if (file.size > maxFileSize) {
                    toast.error(`File ${file.name} exceeds 5MB limit.`, { position: "top-right", autoClose: 5000 });
                    return;
                }
                if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
                    toast.error(`Invalid file type for ${file.name}. Use .xlsx or .xls.`, { position: "top-right", autoClose: 5000 });
                    return;
                }
            }

            try {
                setExcelLoading(true);
                let totalAdded = 0;
                let totalNotFound = 0;
                const unmatchedEntries: string[] = [];

                for (const file of Array.from(files)) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = new Uint8Array(event.target?.result as ArrayBuffer);
                            const workbook = XLSX.read(data, { type: "array" });
                            const sheet = workbook.Sheets[workbook.SheetNames[0]];
                            const parsedData = XLSX.utils.sheet_to_json<{ email?: string; phone?: string }>(sheet, {
                                header: ["email", "phone"],
                                raw: false,
                                defval: "",
                                blankrows: false,
                            });

                            if (!parsedData[0] || (!parsedData[0].email && !parsedData[0].phone)) {
                                toast.error(`Invalid headers in ${file.name}. Expected 'email' or 'phone'.`, {
                                    position: "top-right",
                                    autoClose: 5000,
                                });
                                return;
                            }

                            const userList = parsedData
                                .map((row) => {
                                    const matchedUser = allUsers.find(
                                        (user) =>
                                            (row.email && user.email?.toLowerCase() === row.email.toLowerCase()) ||
                                            (row.phone && user.phone === row.phone)
                                    );
                                    if (!matchedUser) {
                                        unmatchedEntries.push(row.email || row.phone || "Unknown");
                                        return null;
                                    }
                                    return optionType === "nested"
                                        ? { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone }
                                        : { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone, link: commonlink || "" };
                                })
                                .filter(Boolean) as (NestedUser | SpecificUser)[];

                            const newUsers = userList.filter((u) =>
                                optionType === "nested"
                                    ? !nestedUsers.some((p) => p.id === u.id)
                                    : !specificUsers.some((p) => p.id === u.id)
                            );

                            if (optionType === "nested") {
                                setNestedUsers((prev) => [...prev, ...newUsers] as NestedUser[]);
                            } else {
                                setSpecificUsers((prev) => [...prev, ...newUsers] as SpecificUser[]);
                            }

                            totalAdded += newUsers.length;
                            totalNotFound += parsedData.length - newUsers.length;

                            toast.success(`Added ${newUsers.length} users from ${file.name}.`, {
                                position: "top-right",
                                autoClose: 3000,
                            });
                        } catch (error) {
                            toast.error(`Error parsing ${file.name}.`, { position: "top-right", autoClose: 5000 });
                        }
                    };
                    reader.readAsArrayBuffer(file);
                }

                if (fileInputRef.current) fileInputRef.current.value = "";
                if (totalAdded > 0 || totalNotFound > 0) {
                    const summary = `Total: Added ${totalAdded} users, ${totalNotFound} not found.${unmatchedEntries.length > 0 ? ` Unmatched: ${unmatchedEntries.slice(0, 5).join(", ")}${unmatchedEntries.length > 5 ? "..." : ""}` : ""
                        }`;
                    toast.info(summary, { position: "top-right", autoClose: 5000 });

                    // Generate downloadable report for unmatched entries
                    if (unmatchedEntries.length > 0) {
                        const ws = XLSX.utils.json_to_sheet(unmatchedEntries.map((entry) => ({ Unmatched: entry })));
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Unmatched");
                        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                        XLSX.writeFile(wb, `unmatched_users_${timestamp}.xlsx`, { type: "binary", bookType: "xlsx" });
                    }
                }
            } catch (error) {
                toast.error("Failed to process Excel upload.", { position: "top-right", autoClose: 5000 });
            } finally {
                setExcelLoading(false);
            }
        },
        [optionType, commonlink, nestedUsers, specificUsers, allUsers]
    );

    // Add selected users
    const handleAddUsers = useCallback(() => {
        if (optionType === "specific" && !commonlink && specificUsers.length > 0) {
            toast.error("Common link is required when adding specific users.", { position: "top-right", autoClose: 5000 });
            return;
        }

        if (optionType === "nested") {
            const newUsers = searchResults
                .filter((user) => selectedUsers.includes(user._id))
                .map((user) => ({ id: user._id, email: user.email, phone: user.phone }));
            setNestedUsers((prev) => [...prev, ...newUsers.filter((u) => !prev.some((p) => p.id === u.id))]);
        } else {
            const newUsers = searchResults
                .filter((user) => selectedUsers.includes(user._id))
                .map((user) => ({
                    id: user._id,
                    email: user.email,
                    phone: user.phone,
                    link: userLinks[user._id] || "",
                }));
            setSpecificUsers((prev) => [...prev, ...newUsers.filter((u) => !prev.some((p) => p.id === u.id))]);
            setUserLinks({});
        }
        setSelectedUsers([]);
    }, [optionType, commonlink, searchResults, selectedUsers, userLinks, specificUsers]);

    // Update user link
    const handleUserLinkChange = useCallback((userId: string, link: string) => {
        setUserLinks((prev) => ({ ...prev, [userId]: link }));
    }, []);

    // Delete user
    const handleDeleteUser = useCallback((index: number, type: "nested" | "specific") => {
        if (type === "nested") {
            setNestedUsers((prev) => prev.filter((_, i) => i !== index));
        } else {
            setSpecificUsers((prev) => prev.filter((_, i) => i !== index));
        }
    }, []);

    // Clear all users
    const clearAllUsers = useCallback((type: "nested" | "specific") => {
        if (type === "nested") {
            setNestedUsers([]);
            toast.info("All nested users cleared.", { position: "top-right", autoClose: 3000 });
        } else {
            setSpecificUsers([]);
            setUserLinks({});
            toast.info("All specific users cleared.", { position: "top-right", autoClose: 3000 });
        }
    }, []);

    // Modify specific user link
    const handleModifyLink = useCallback((index: number, newLink: string) => {
        setSpecificUsers((prev) => {
            const newUsers = [...prev];
            newUsers[index] = { ...newUsers[index], link: newLink };
            return newUsers;
        });
    }, []);

    // Form submission
    const onSubmit = useCallback(
        async (data: FormData) => {
            if (!editCardId || !dashboardId_2) {
                toast.error("Missing card ID or dashboard ID.", { position: "top-right", autoClose: 5000 });
                return;
            }

            if (data.optionType === "specific" && specificUsers.length > 0 && !data.commonlink) {
                toast.error("Common link is required when specific users are added.", { position: "top-right", autoClose: 5000 });
                return;
            }

            try {
                const formData = new FormData();
                formData.append("name", data.name);
                if (data.img && data.img[0]) formData.append("img", data.img[0]);
                formData.append("optionType", data.optionType);
                // if (data.optionType === "specific") {
                formData.append("commonlink", data.commonlink || "");
                if (specificUsers.length > 0) {
                    formData.append(
                        "specifyLink",
                        JSON.stringify(specificUsers.map((user) => ({ id: user.id, link: user.link || "" })))
                    );
                }
                // } else if (nestedUsers.length > 0) {
                formData.append("allowUser", JSON.stringify(nestedUsers.map((user) => user.id)));
                // }

                await axios.patch(`${my_dashboard_2_mod}/${dashboardId_2}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                reset();
                setNestedUsers([]);
                setSpecificUsers([]);
                setSelectedUsers([]);
                setUserLinks({});
                setImagePreview(null);
                setExistingImageUrl(null);

                toast.success("Dashboard card updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    onClose: () =>
                        navigate(`/my_dashboard_2/${editCardId}`, { state: { d1: nested_1 } })
                });
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError && error.response
                        ? error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`
                        : "Failed to update dashboard card.";
                toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
            }
        },
        [editCardId, dashboardId_2, specificUsers, nestedUsers, navigate, reset]
    );


    return (
        <>
            <ToastContainer />

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
                        Edit
                    </button>
                </li>
            </ol>
            <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-lg">
                <div className="flex justify-between px-2">
                    <Typography variant="h5" className="mb-2 font-bold">Edit Dashboard Card</Typography>
                    <ClearIcon
                        onClick={() =>
                            navigate(`/my_dashboard_2/${nested_2}`, { state: { d1: nested_1 } })
                        }
                        style={{ cursor: "pointer" }}
                    />
                </div>


                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        {/* <Typography variant="h6" className="mb-3 font-semibold">Basic Info</Typography> */}
                        <FormControl fullWidth className="mb-4">


                            <div className="w-full mb-4">
                                <label className={`block text-sm font-medium mb-1 ${errors.name ? "text-red-500" : "text-gray-700"}`}>
                                    Card Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter card name"
                                    {...register("name", { required: "Card name is required" })}
                                    className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                        </FormControl>
                        <div className="w-full mb-4">
                            <label className={`block text-sm font-medium mb-1 ${errors.img ? "text-red-500" : "text-gray-700"}`}>
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register("img")}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.img ? "border-red-500" : "border-gray-300"}`}
                            />

                        </div>

                        {(imagePreview || existingImageUrl) && (
                            <div>
                                <p className="text-sm text-gray-600">
                                    Image Preview:
                                </p>
                                <img
                                    src={imagePreview || existingImageUrl || "/fallback-image.png"}
                                    alt="Card Preview"
                                    className="mt-2 w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h6 className="text-lg font-semibold mb-3 text-gray-800">
                            Card Type and Users
                        </h6>
                        <TextField
                            fullWidth
                            select
                            // label="Card Type"
                            {...register("optionType", { required: "Card type is required" })}
                            SelectProps={{ native: true }}
                            error={!!errors.optionType}
                            helperText={errors.optionType?.message}
                            className="mb-4"
                        >
                            <option value="nested">Nested Dashboard</option>
                            <option value="specific">Specific Link</option>
                        </TextField>
                        {optionType === "specific" && (
                            <div className="w-full mb-4">
                                <label className={`block text-sm font-medium mb-1 ${errors.commonlink ? "text-red-500" : "text-gray-700"}`}>
                                    Common Link
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter common link"
                                    {...register("commonlink", {
                                        required: specificUsers.length > 0 ? "Common link is required when specific users are added" : false,
                                    })}
                                    className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.commonlink ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.commonlink && (
                                    <p className="text-sm text-red-500 mt-1">{errors.commonlink.message}</p>
                                )}
                            </div>

                        )}
                        <h6 className="text-lg font-semibold mb-3 text-gray-800">
                            Select Users
                        </h6>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search by Email or Phone
                            </label>
                            <input
                                type="text"
                                placeholder="Enter email or phone"
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={allUsers.length === 0}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${allUsers.length === 0 ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"} transition text-gray-700`}
                            />
                        </div>

                        {searchResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto mb-4 p-2 border rounded-lg">
                                {searchResults.map((user) => (
                                    <div key={user._id} className="p-2 border-b last:border-b-0">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() =>
                                                    setSelectedUsers((prev) =>
                                                        prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id]
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                        </div>
                                        {optionType === "specific" && selectedUsers.includes(user._id) && (
                                            <TextField
                                                fullWidth
                                                label="Custom Link"
                                                placeholder="Enter link for this user"
                                                value={userLinks[user._id] || ""}
                                                onChange={(e) => handleUserLinkChange(user._id, e.target.value)}
                                                size="small"
                                                className="mt-2"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex space-x-3 mb-4">
                            <Button sx={{ Height: "1rem" }} variant="outlined" color="primary" onClick={handleShowAllUsers} disabled={!allUsers.length}>
                                Show All Users
                            </Button>
                            <button
                                onClick={handleAddUsers}
                                disabled={selectedUsers.length === 0}
                                className={` px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300
    ${selectedUsers.length === 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500"
                                    }`}
                            >
                                Add Selected Users
                            </button>

                        </div>
                        <h6 className="text-lg font-semibold mb-3 text-gray-800">
                            Upload Excel for Users
                        </h6>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Excel Files
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                multiple
                                ref={fileInputRef}
                                onChange={handleExcelUpload}
                                disabled={excelLoading || !allUsers.length}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${excelLoading || !allUsers.length
                                        ? "bg-gray-100 cursor-not-allowed border-gray-300"
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"} transition text-gray-700`}
                            />
                        </div>

                        {excelLoading && <CircularProgress size={24} className="mt-2" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Total Users: {nestedUsers.length + specificUsers.length} (Nested: {nestedUsers.length}, Specific: {specificUsers.length})
                    </p>

                    {nestedUsers.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                    Nested Dashboard Users ({nestedUsers.length})
                                </h6>
                                <button
                                    onClick={() => clearAllUsers("nested")}
                                    disabled={nestedUsers.length === 0}
                                    className="mt-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300 
             bg-gradient-to-r from-red-400 via-red-500 to-red-600 
             hover:from-red-500 hover:via-red-600 hover:to-red-700 
             hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    Clear Nested Users
                                </button>

                            </div>
                            <div className="space-y-2">
                                {nestedUsers.map((user, index) => (
                                    <div key={`nested-${user.id}`} className="flex items-center space-x-2">
                                        <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                        <IconButton onClick={() => handleDeleteUser(index, "nested")}>
                                            <CancelIcon color="error" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {specificUsers.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                    Specific Link Users ({specificUsers.length})
                                </h6>
                                <button
                                    onClick={() => clearAllUsers("specific")}
                                    disabled={specificUsers.length === 0}
                                    className="mt-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300 
             bg-gradient-to-r from-red-400 via-red-500 to-red-600 
             hover:from-red-500 hover:via-red-600 hover:to-red-700 
             hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    Clear Specific Users
                                </button>

                            </div>
                            <div className="space-y-2">
                                {specificUsers.map((user, index) => (
                                    <div key={`specific-${user.id}`} className="flex items-center space-x-2">
                                        <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                        <TextField
                                            label="Link"
                                            value={user.link || ""}
                                            onChange={(e) => handleModifyLink(index, e.target.value)}
                                            size="small"
                                            className="flex-1"
                                            error={!!user.link && !/^https:\/\/.+/.test(user.link)}
                                            helperText={
                                                !!user.link && !/^https:\/\/.+/.test(user.link)
                                                    ? "Link must start with https://"
                                                    : ""
                                            }
                                        />
                                        <IconButton onClick={() => handleDeleteUser(index, "specific")}>
                                            <CancelIcon color="error" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <Button
                            type="submit"
                            variant="contained"
                            // color="primary"
                            fullWidth
                            startIcon={<CheckCircleIcon />}
                            disabled={excelLoading}
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
                            Update
                        </Button>
                      
                    </div>
                </form>

            </div>
        </>
    );
};

export default Second_My_Dashboard_Edit;