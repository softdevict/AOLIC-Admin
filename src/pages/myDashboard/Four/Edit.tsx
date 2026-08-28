import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard_4_mod, my_dashboard_4_user_card_details, my_dashboard_all_users_3 } from "../../../api/config";
import { Typography, TextField, Button, IconButton, CircularProgress, Alert, FormControl, InputLabel } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import ClearIcon from '@mui/icons-material/Clear';

interface FormData {
    name: string;
    img?: FileList;
    commonlink: string;
    excelFile?: FileList;
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

const First_My_Dashboard_Edit: React.FC = () => {
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: { commonlink: "", name: "" },
    });
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const commonlink = watch("commonlink");
    const name = watch("name");
    const { id: paramId, dashboardId_4 } = useParams<{ id: string; dashboardId_4: string }>();
    const location = useLocation();
    console.log("🚀 ~ First_My_Dashboard_Edit ~ location:", location)
    const navigate = useNavigate();
    const editCardId = paramId || (location.state as { id?: string })?.id;

    if (process.env.NODE_ENV === "development") {
        console.log("🚀 ~ First_My_Dashboard_Edit ~ location:", location);
        console.log("🚀 ~ First_My_Dashboard_Edit ~ editCardId:", editCardId);
        console.log("🚀 ~ First_My_Dashboard_Edit ~ dashboardId_4:", dashboardId_4);
    }

    const nested_1 = location.state?.d1 || "";
    const nested_2 = location.state?.d2 || "";
    const nested_3 = location.state?.d3 || "";
    const nested_4 = location.state?.d4 || "";

    // Fetch all users and card data once
    useEffect(() => {
        if (!editCardId || !dashboardId_4) {
            setError("Missing card ID or dashboard ID.");
            setLoading(false);
            toast.error("Missing ID(s). Redirecting to dashboard.", { position: "top-right", autoClose: 3000 });
            setTimeout(() => navigate("/my_dashboard"), 3000);
            return;
        }

        const fetchData = async (retries = 3, delay = 1000): Promise<void> => {
            try {
                setLoading(true);

                // Fetch all users
                const usersRes = await axios.get(`${my_dashboard_all_users_3}/${editCardId}`);
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || usersRes.data.data || [];
                setAllUsers(usersData);

                // Fetch card data
                const cardRes = await axios.get(`${my_dashboard_4_user_card_details}/${dashboardId_4}`);
                if (process.env.NODE_ENV === "development") {
                    console.log("🚀 ~ fetchData ~ cardRes:", cardRes.data);
                }
                const cardData = cardRes.data.data || cardRes.data;
                if (!cardData || !cardData._id) throw new Error("Invalid card data received.");

                setValue("name", cardData.name || "");
                setValue("commonlink", cardData.commonlink || "");
                setExistingImageUrl(cardData.img || null);

                // Map specifyLink to specificUsers
                const specificUsersData = (cardData.specifyLink || []).map((item: any) => ({
                    id: item._id,
                    email: item.email || "",
                    phone: item.phone || "",
                    link: item.link || "",
                })).filter((user: SpecificUser) => user.id); // Ensure id exists

                setSpecificUsers(specificUsersData);
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
    }, [editCardId, dashboardId_4, setValue, navigate]);

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

    // Show all users
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
                    const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
                        reader.onerror = () => reject(`Failed to read ${file.name}`);
                        reader.readAsArrayBuffer(file);
                    });

                    const workbook = XLSX.read(new Uint8Array(fileData), { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    const parsedData = XLSX.utils.sheet_to_json<{ email?: string; phone?: string; link?: string }>(sheet, {
                        header: ["email", "phone", "link"],
                        raw: false,
                        defval: "",
                        blankrows: false,
                    });

                    if (!parsedData[0] || (!parsedData[0].email && !parsedData[0].phone)) {
                        toast.error(`Invalid headers in ${file.name}. Expected 'email' or 'phone'.`, {
                            position: "top-right",
                            autoClose: 5000,
                        });
                        continue;
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

                            return {
                                id: matchedUser._id,
                                email: matchedUser.email,
                                phone: matchedUser.phone,
                                ...(row.link?.trim() ? { link: row.link } : {}), // ✅ include link only if provided
                            };
                        })
                        .filter(Boolean) as SpecificUser[];

                    const newUsers = userList.filter((u) => !specificUsers.some((p) => p.id === u.id));

                    setSpecificUsers((prev) => [...prev, ...newUsers]);

                    totalAdded += newUsers.length;
                    totalNotFound += parsedData.length - newUsers.length;

                    toast.success(`Added ${newUsers.length} users from ${file.name}.`, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }

                if (fileInputRef.current) fileInputRef.current.value = "";

                if (totalAdded > 0 || totalNotFound > 0) {
                    const summary = `Total: Added ${totalAdded} users, ${totalNotFound} not found.${unmatchedEntries.length > 0
                        ? ` Unmatched: ${unmatchedEntries.slice(0, 5).join(", ")}${unmatchedEntries.length > 5 ? "..." : ""
                        }`
                        : ""
                        }`;
                    toast.info(summary, { position: "top-right", autoClose: 5000 });

                    // if (unmatchedEntries.length > 0) {
                    //     const ws = XLSX.utils.json_to_sheet(unmatchedEntries.map((entry) => ({ Unmatched: entry })));
                    //     const wb = XLSX.utils.book_new();
                    //     XLSX.utils.book_append_sheet(wb, ws, "Unmatched");
                    //     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                    //     XLSX.writeFile(wb, `unmatched_users_${timestamp}.xlsx`, { type: "binary", bookType: "xlsx" });
                    // }
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to process Excel upload.", { position: "top-right", autoClose: 5000 });
            } finally {
                setExcelLoading(false);
            }
        },
        [specificUsers, allUsers]
    );


    // Add selected users
    const handleAddUsers = useCallback(() => {
        if (!commonlink && specificUsers.length > 0) {
            toast.error("Common link is required for adding users.", { position: "top-right", autoClose: 5000 });
            return;
        }

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
        setSelectedUsers([]);
    }, [commonlink, searchResults, selectedUsers, userLinks, specificUsers]);

    // Update user link
    const handleUserLinkChange = useCallback((userId: string, link: string) => {
        setUserLinks((prev) => ({ ...prev, [userId]: link }));
    }, []);

    // Delete user
    const handleDeleteUser = useCallback((index: number) => {
        setSpecificUsers((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Clear all users
    const clearAllUsers = useCallback(() => {
        setSpecificUsers([]);
        setUserLinks({});
        toast.info("All users cleared.", { position: "top-right", autoClose: 3000 });
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
            if (!editCardId || !dashboardId_4) {
                toast.error("Missing card ID or dashboard ID.", { position: "top-right", autoClose: 5000 });
                return;
            }

            if (specificUsers.length > 0 && !data.commonlink) {
                toast.error("Common link is required when users are added.", { position: "top-right", autoClose: 5000 });
                return;
            }

            try {
                const formData = new FormData();
                formData.append("name", data.name);
                if (data.img && data.img[0]) formData.append("img", data.img[0]);
                formData.append("optionType", "specific");
                formData.append("commonlink", data.commonlink || "");
                if (specificUsers.length > 0) {
                    formData.append(
                        "specifyLink",
                        JSON.stringify(specificUsers.map((user) => ({ id: user.id, link: user.link || "" })))
                    );
                }

                await axios.patch(`${my_dashboard_4_mod}/${dashboardId_4}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                reset();
                setSpecificUsers([]);
                setSelectedUsers([]);
                setUserLinks({});
                setImagePreview(null);
                setExistingImageUrl(null);

                toast.success("Dashboard card updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    onClose: () => navigate(`/my_dashboard_4/${nested_4}`),
                });
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError && error.response
                        ? error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`
                        : "Failed to update dashboard card.";
                toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
            }
        },
        [editCardId, dashboardId_4, specificUsers, navigate, reset]
    );

    // Cancel editing
    const handleCancel = useCallback(() => {
        navigate(`/my_dashboard_4/${nested_4}`);
    }, [navigate]);

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
                        Edit
                    </button>
                </li>
            </ol>
            <ToastContainer />
            <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-lg">
                <div className="flex justify-between px-2">

                    <h5 className="text-xl font-bold mb-2 text-gray-800">
                        Edit Dashboard Card
                    </h5>
                    <ClearIcon
                        onClick={() =>
                            navigate(`/my_dashboard_4/${nested_4}`, { state: { d1: nested_1, d2: nested_2, d3: nested_3 } })
                        }
                        style={{ cursor: "pointer" }}
                    />
                </div>
                {/* <Typography variant="subtitle1" className="mb-4 text-gray-600">
                    Total Users: {specificUsers.length}
                </Typography> */}


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
      ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
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
      ${errors.img ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                            />
                            {/* <p className="text-sm text-gray-600 mt-1">
                                {errors.img?.message || "Upload a new image (optional)"}
                            </p> */}
                        </div>

                        {(imagePreview || existingImageUrl) && (
                            <div>
                                {/* <Typography variant="body2" className="text-gray-600">Image Preview:</Typography> */}
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
                            Users and Links
                        </h6>
                        <div className="w-full mb-4">
                            <label className={`block text-sm font-medium mb-1 ${errors.commonlink ? "text-red-500" : "text-gray-700"}`}>
                                Common Link
                            </label>
                            <input
                                type="text"
                                placeholder="Enter common link"
                                {...register("commonlink", {
                                    required: specificUsers.length > 0 ? "Common link is required when users are added" : false,
                                })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${errors.commonlink ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                            />
                            {errors.commonlink && (
                                <p className="text-sm text-red-500 mt-1">{errors.commonlink.message}</p>
                            )}
                        </div>

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
      ${allUsers.length === 0 ? "bg-gray-100 cursor-not-allowed" : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
      text-gray-700 transition`}
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
                        )}
                        <div className="flex space-x-3 mb-4">
                            <Button variant="outlined" color="primary" onClick={handleShowAllUsers} disabled={!allUsers.length}>
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
                                Upload Excel
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
                                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    }
      text-gray-700 transition`}
                            />
                        </div>

                        {excelLoading && <CircularProgress size={24} className="mt-2" />}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Total Users: {specificUsers.length}
                    </p>


                    {specificUsers.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="text-lg font-semibold text-gray-800">
                                    Users ({specificUsers.length})
                                </h6>
                                <button
                                    onClick={clearAllUsers}
                                    disabled={specificUsers.length === 0}
                                    className="mt-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300 
             bg-gradient-to-r from-red-400 via-red-500 to-red-600 
             hover:from-red-500 hover:via-red-600 hover:to-red-700 
             hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    Clear All
                                </button>

                            </div>
                            <div className="space-y-2">
                                {specificUsers.map((user, index) => (
                                    <div key={`specific-${user.id}`} className="flex items-center space-x-2">
                                        <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                        <div className="flex-1 mb-2">
                                            {/* <label className={`block text-sm font-medium mb-1 ${user.link && !/^https:\/\/.+/.test(user.link) ? "text-red-500" : "text-gray-700"}`}>
                                                Link
                                            </label> */}
                                            <input
                                                type="text"
                                                value={user.link || ""}
                                                onChange={(e) => handleModifyLink(index, e.target.value)}
                                                placeholder="Enter link"
                                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none
      ${user.link && !/^https:\/\/.+/.test(user.link) ? "border-red-500" : "border-gray-300"}
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700`}
                                            />
                                            {user.link && !/^https:\/\/.+/.test(user.link) && (
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

                    <div className="flex space-x-4">
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
                            disabled={excelLoading}
                        >
                            Update
                        </Button>
               
                    </div>
                </form>

            </div>
        </>
    );
};

export default First_My_Dashboard_Edit;