import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard, searchUser_email_phone, displayAllUSer_email_phone, my_dashboard_user_card_details } from "../../../api/config";
import { Typography, TextField, Button, IconButton, CircularProgress, Alert, InputLabel, FormControl } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";
import ClearIcon from '@mui/icons-material/Clear';
import { Height } from "@mui/icons-material";

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

const Zero_My_Dashboard_Edit: React.FC = () => {
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: { optionType: "nested", commonlink: "", name: "" },
    });
    const [searchResults, setSearchResults] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const optionType = watch("optionType");
    const commonlink = watch("commonlink");
    const name = watch("name");
    const { id: paramId } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const editCardId = paramId || (location.state as { id?: string })?.id;

    // Fetch card data
    useEffect(() => {
        if (!editCardId) {
            setError("No card ID provided for editing.");
            setLoading(false);
            return;
        }

        const fetchCardData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${my_dashboard_user_card_details}/${editCardId}`);
                const data = res.data.data;
                if (!data || !data._id) throw new Error("Invalid card data received.");

                setValue("name", data.name || "");
                setValue("optionType", data.optionType || "nested");
                setValue("commonlink", data.commonlink || "");
                setExistingImageUrl(data.img || null);

                setNestedUsers(
                    Array.from(new Map((data.allowUser || []).map((user: any) => [user._id, user])).values()).map(
                        (user: any) => ({ id: user._id, email: user.email, phone: user.phone })
                    )
                );

                setSpecificUsers(
                    Array.from(new Map((data.specifyLink || []).map((item: any) => [item.id._id, item])).values()).map(
                        (item: any) => ({ id: item.id._id, email: item.id.email, phone: item.id.phone, link: item.link || "" })
                    )
                );
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || "Failed to load card data.";
                setError(errorMessage);
                toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
            } finally {
                setLoading(false);
            }
        };

        fetchCardData();
    }, [editCardId, setValue]);

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

    // Search users
    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const param = /^\d+$/.test(query) ? "phone" : "email";
            const res = await axios.get(`${searchUser_email_phone}?${param}=${query}`);
            setSearchResults(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (error) {
            setSearchResults([]);
            toast.error("Failed to search users.", { position: "top-right", autoClose: 5000 });
        }
    }, []);

    // Fetch all users
    const handleShowAllUsers = useCallback(async () => {
        try {
            const res = await axios.get(displayAllUSer_email_phone);
            setSearchResults(Array.isArray(res.data) ? res.data : res.data.users || res.data.data || []);
        } catch (error) {
            setSearchResults([]);
            toast.error("Failed to load all users.", { position: "top-right", autoClose: 5000 });
        }
    }, []);

    const handleExcelUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            try {
                const allUsersResponse = await axios.get(displayAllUSer_email_phone);
                const allUsers = Array.isArray(allUsersResponse.data)
                    ? allUsersResponse.data
                    : allUsersResponse.data.users || allUsersResponse.data.data || [];

                let totalAdded = 0;
                let totalNotFound = 0;

                for (const file of Array.from(files)) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = new Uint8Array(event.target?.result as ArrayBuffer);
                            const workbook = XLSX.read(data, { type: "array" });
                            const sheet = workbook.Sheets[workbook.SheetNames[0]];

                            // Header changes based on optionType
                            const header = optionType === "nested" ? ["email", "phone"] : ["email", "phone", "link"];

                            const parsedData = XLSX.utils.sheet_to_json<{ email?: string; phone?: string; link?: string }>(sheet, {
                                header,
                                raw: false,
                                defval: "",
                                blankrows: false,
                            });

                            const userList = parsedData
                                .map((row) => {
                                    const matchedUser = allUsers.find(
                                        (user: any) =>
                                            (row.email && user.email?.toLowerCase() === row.email.toLowerCase()) ||
                                            (row.phone && user.phone === row.phone)
                                    );
                                    if (!matchedUser) return null;

                                    // Check duplicates
                                    const isDuplicate =
                                        optionType === "nested"
                                            ? nestedUsers.some((u) => u.id === matchedUser._id)
                                            : specificUsers.some((u) => u.id === matchedUser._id);
                                    if (isDuplicate) return null;

                                    return optionType === "nested"
                                        ? { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone }
                                        : { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone, link: row.link || "" };
                                })
                                .filter(Boolean) as (NestedUser | SpecificUser)[];

                            if (optionType === "nested") {
                                setNestedUsers((prev) => [...prev, ...userList] as NestedUser[]);
                            } else {
                                setSpecificUsers((prev) => [...prev, ...userList] as SpecificUser[]);
                            }

                            totalAdded += userList.length;
                            totalNotFound += parsedData.length - userList.length;

                            toast.success(`Added ${userList.length} users from ${file.name}.`, {
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
                    toast.info(`Total: Added ${totalAdded} users, ${totalNotFound} not found.`, {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } catch (error) {
                toast.error("Failed to process Excel file.", { position: "top-right", autoClose: 5000 });
            }
        },
        [optionType, commonlink, nestedUsers, specificUsers]
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
            if (!editCardId) {
                toast.error("No card ID provided.", { position: "top-right", autoClose: 5000 });
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

                await axios.patch(`${my_dashboard}/${editCardId}`, formData, {
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
                    onClose: () => navigate("/my_dashboard"),
                });
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError && error.response
                        ? error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`
                        : "Failed to update dashboard card.";
                toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
            }
        },
        [editCardId, specificUsers, nestedUsers, navigate, reset]
    );


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
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                        Edit
                    </button>
                </li>
            </ol>
            <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg">
                <div className="flex justify-between p-2">
                    <Typography variant="h5" className="mb-2 font-bold">Edit Dashboard Card</Typography>
                    <ClearIcon
                        onClick={() => navigate("/my_dashboard")}
                        style={{ cursor: "pointer" }}
                    />
                </div>
                <ToastContainer />

                {/* {loading && <CircularProgress className="mx-auto my-4" />}
                {error && <Alert severity="error" className="mb-4">{error}</Alert>}

                {!loading && !error && ( */}
                <div className="space-y-6">
                    {/* <div className="p-4 border rounded-lg"> */}
                    {/* <Typography variant="h6" className="mb-3 font-semibold">Basic Info</Typography> */}
                    <FormControl fullWidth className="mb-4">
                        <label
                            htmlFor="cardName"
                            className={`block text-sm font-medium mb-1 transition-all duration-200
     text-gray-700
    ${errors.name ? "text-red-500" : ""}`}
                        >
                            Card Name
                        </label>

                        <div className="w-full mb-4">
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
                    <TextField
                        fullWidth
                        type="file"
                        inputProps={{ accept: "image/*" }}
                        {...register("img")}
                        helperText={errors.img?.message || "Upload a new image (optional)"}
                        className="mb-4"
                    />
                    {(imagePreview || existingImageUrl) && (
                        <div>
                            <Typography variant="body2" className="text-gray-600">Image Preview:</Typography>
                            <img
                                src={imagePreview || existingImageUrl || "/fallback-image.png"}
                                alt="Card Preview"
                                className="mt-2 w-24 h-24 object-cover rounded-lg"
                                onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                            />
                        </div>
                    )}



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
                            <label
                                htmlFor="commonLink"
                                className={`block text-sm font-medium mb-1 transition-all duration-200
      ${errors.commonlink ? "text-red-500" : "text-gray-700"}`}
                            >
                                Common Link
                            </label>
                            <input
                                id="commonLink"
                                type="text"
                                placeholder="Enter common link"
                                {...register("commonlink", {
                                    required: specificUsers.length > 0 ? "Common link is required when specific users are added" : false,
                                    pattern: {
                                        value: /^https:\/\/[^\s$.?#].[^\s]*$/,
                                        message: "Please enter a valid HTTPS URL",
                                    },
                                })}
                                className={`w-full px-3 py-2 rounded-lg border shadow-sm outline-none transition-all duration-200
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
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
                        <label
                            htmlFor="searchUser"
                            className="block text-sm font-medium mb-1 text-gray-700"
                        >
                            Search by Email or Phone
                        </label>
                        <input
                            id="searchUser"
                            type="text"
                            placeholder="Enter email or phone"
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                        />
                    </div>

                    {searchResults.length > 0 && (
                        <div className="max-h-48 overflow-y-auto mb-4 p-2 border rounded-lg">
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
                                        <div className="w-full mt-2">
                                            <label
                                                htmlFor={`customLink-${user._id}`}
                                                className="block text-sm font-medium mb-1 text-gray-700"
                                            >
                                                Custom Link
                                            </label>
                                            <input
                                                id={`customLink-${user._id}`}
                                                type="text"
                                                placeholder="Enter link for this user"
                                                value={userLinks[user._id] || ""}
                                                onChange={(e) => handleUserLinkChange(user._id, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                            />
                                        </div>

                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex space-x-3 mb-4">
                        <Button sx={{ Height: "1rem" }} variant="outlined" color="primary" onClick={handleShowAllUsers}> Show All Users </Button>

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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm outline-none
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                        />
                    </div>



                    <p className="text-sm mb-4 text-gray-600">
                        Total Users: {nestedUsers.length + specificUsers.length} (Nested: {nestedUsers.length}, Specific: {specificUsers.length})
                    </p>


                    {nestedUsers.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="text-lg font-semibold text-gray-800">
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
                                <h6 className="text-lg font-semibold text-gray-800">
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

                                        <div className="flex-1">
                                            {/* <label
                                                htmlFor={`userLink-${index}`}
                                                className="block text-sm font-medium mb-1 text-gray-700"
                                            >
                                                Link
                                            </label> */}
                                            <input
                                                id={`userLink-${index}`}
                                                type="text"
                                                placeholder="Enter link"
                                                value={user.link || ""}
                                                onChange={(e) => handleModifyLink(index, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700
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

                    <div className="flex space-x-4">
                        <Button
                            type="submit"
                            variant="contained"
                            // color="primary"
                            fullWidth
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
                            startIcon={<CheckCircleIcon />}
                            onClick={handleSubmit(onSubmit)}
                        >
                            Update
                        </Button>
                      
                    </div>
                </div>
                {/* )} */}
            </div >
        </>
    );
};

export default Zero_My_Dashboard_Edit;