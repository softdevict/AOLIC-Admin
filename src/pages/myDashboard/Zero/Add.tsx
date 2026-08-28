import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosError } from "axios";
import { my_dashboard, searchUser_email_phone, displayAllUSer_email_phone } from "../../../api/config";
import { Typography, TextField, Button, IconButton } from "@mui/material";
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
    allowUser?: string[];
    specifyLink?: { id: string; link: string }[];
}

const Zero_My_Dashboard_Add: React.FC = () => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            optionType: "nested",
            commonlink: "",
        },
    });
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<{ _id: string; email?: string; phone?: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userLinks, setUserLinks] = useState<{ [key: string]: string }>({});
    const [nestedUsers, setNestedUsers] = useState<NestedUser[]>([]);
    const [specificUsers, setSpecificUsers] = useState<SpecificUser[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const optionType = watch("optionType");
    const commonlink = watch("commonlink");
    const selectedImg = watch("img");

    // Handle image preview
    React.useEffect(() => {
        if (selectedImg && selectedImg[0]) {
            const previewUrl = URL.createObjectURL(selectedImg[0]);
            setImagePreview(previewUrl);

            // Cleanup previous preview URL
            return () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            };
        } else {
            setImagePreview(null);
        }
    }, [selectedImg]);

    // Clear nested users
    const handleClearNestedUsers = () => {
        setNestedUsers([]);
        setSelectedUsers([]);
        setUploadMessage("");
    };

    // Clear specific users
    const handleClearSpecificUsers = () => {
        setSpecificUsers([]);
        setSelectedUsers([]);
        setUserLinks({});
        setUploadMessage("");
    };

    // Search users by email or phone
    const handleSearch = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        const param = /^\d+$/.test(query) ? "phone" : "email";
        try {
            const res = await axios.get(`${searchUser_email_phone}?${param}=${query}`);
            const results = Array.isArray(res.data) ? res.data : Array.isArray(res.data.data) ? res.data.data : [];
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            const allUsersResponse = await axios.get(displayAllUSer_email_phone);
            let allUsers: any[] = [];
            if (Array.isArray(allUsersResponse.data)) allUsers = allUsersResponse.data;
            else if (Array.isArray(allUsersResponse.data.users)) allUsers = allUsersResponse.data.users;
            else if (Array.isArray(allUsersResponse.data.data)) allUsers = allUsersResponse.data.data;
            else {
                toast.error("Failed to load users from server.");
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

                        interface ExcelRow {
                            [key: string]: string | undefined;
                            email?: string;
                            phone?: string;
                            link?: string;
                        }

                        const parsedData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
                            header: optionType === "nested" ? ["email", "phone"] : ["email", "phone", "link"],
                            raw: false,
                            defval: "",
                            blankrows: false,
                        }).map((row) => {
                            const normalizedRow: { email?: string; phone?: string; link?: string } = {};
                            Object.keys(row).forEach((key) => {
                                const lowerKey = key.toLowerCase();
                                if (lowerKey === "email") normalizedRow.email = row[key];
                                else if (lowerKey === "phone") normalizedRow.phone = row[key];
                                else if (lowerKey === "link" && optionType !== "nested") normalizedRow.link = row[key]; // optional
                            });
                            return normalizedRow;
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

                                // Build user object based on type
                                if (optionType === "nested") {
                                    return { id: matchedUser._id, email: matchedUser.email, phone: matchedUser.phone };
                                } else {
                                    return {
                                        id: matchedUser._id,
                                        email: matchedUser.email,
                                        phone: matchedUser.phone,
                                        link: u.link || "", // optional link
                                    };
                                }
                            })
                            .filter(Boolean) as (NestedUser | SpecificUser)[];

                        if (optionType === "nested") {
                            setNestedUsers((prev) => [...prev, ...userList.filter((u) => !prev.some((p) => p.id === u.id))]);
                            added = userList.length;
                        } else {
                            setSpecificUsers((prev) => [...prev, ...userList.filter((u) => !prev.some((p) => p.id === u.id))]);
                            added = userList.length;
                        }

                        totalAdded += added;
                        totalNotFound += notFound;
                        totalDuplicates += duplicates;

                        if (added > 0 || notFound > 0 || duplicates > 0) {
                            setUploadMessage(
                                `From ${file.name}: Added ${added} users, ${notFound} not found, ${duplicates} duplicates ignored.`
                            );
                        }
                    } catch (error) {
                        console.error("Error parsing Excel:", error);
                        setUploadMessage(`Error parsing ${file.name}`);
                    }
                };

                reader.readAsArrayBuffer(file);
            }

            if (fileInputRef.current) fileInputRef.current.value = "";

            if (totalAdded > 0 || totalNotFound > 0 || totalDuplicates > 0) {
                setUploadMessage(
                    `${uploadMessage ? uploadMessage + " " : ""}Total: Added ${totalAdded} users, ${totalNotFound} not found, ${totalDuplicates} duplicates ignored.`
                );
            }
        } catch (error) {
            console.error("Excel verification error:", error);
            toast.error("Failed to process Excel file. Please check the file format and try again.");
        }
    };


    // Add selected users
    const handleAddUsers = () => {
        if (optionType === "nested") {
            const newUsers = searchResults
                .filter((user) => selectedUsers.includes(user._id) && !nestedUsers.some((u) => u.id === user._id))
                .map((user) => ({ id: user._id, email: user.email, phone: user.phone }));
            setNestedUsers((prev) => [...prev, ...newUsers]);
        } else {
            const newUsers = searchResults
                .filter((user) => selectedUsers.includes(user._id) && !specificUsers.some((u) => u.id === user._id))
                .map((user) => ({
                    id: user._id,
                    email: user.email,
                    phone: user.phone,
                    link: userLinks[user._id] || "",
                }));
            setSpecificUsers((prev) => [...prev, ...newUsers]);
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
            formData.append("img", data.img[0]);
            formData.append("optionType", data.optionType);


            formData.append("commonlink", data.commonlink || "");

            const specifyLink = specificUsers.map(user => ({
                id: user.id,
                link: user.link || "" // Ensure empty link is sent as ""
            }));
            formData.append("specifyLink", JSON.stringify(specifyLink));

            if (nestedUsers.length > 0) {
                formData.append("allowUser", JSON.stringify(nestedUsers.map(user => user.id)));
            }


            // Log FormData for debugging
            const formDataEntries: { [key: string]: any } = {};
            formData.forEach((value, key) => {
                formDataEntries[key] = value;
            });
            console.log("FormData being sent:", formDataEntries);

            const response = await axios.post(my_dashboard, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            reset();
            setNestedUsers([]);
            setSpecificUsers([]);
            setSelectedUsers([]);
            setUserLinks({});
            setUploadMessage("");

            toast.success("Dashboard card added successfully!", {
                position: "top-right",
                autoClose: 3000,
                onClose: () => navigate("/my_dashboard"),
            });
        } catch (error) {
            console.error("Error adding dashboard card:", error);
            let errorMessage = "Failed to add dashboard card.";
            if (error instanceof AxiosError && error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
                console.log("Server error response:", error.response.data);
            }
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
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
                            Add
                        </button>
                    </li>
                </ol>
            )}
            <ToastContainer />
            <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow">
                <div className="flex justify-between px-2" >
                    <h2 className="text-xl font-bold mb-4">Add Dashboard Card</h2>
                    {adminType === "super admin" && (
                        <ClearIcon
                            onClick={() => navigate("/my_dashboard")}
                            style={{ cursor: "pointer" }}
                        />
                    )}

                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Section 1 - Basic Info */}
                    {/* <div className="border p-4 rounded"> */}
                    {/* <h3 className="text-lg font-semibold mb-2">Basic Info</h3> */}
                    <div className="space-y-3">
                        <div className="w-full">
                            <label
                                htmlFor="cardName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Card Name
                            </label>
                            <input
                                id="cardName"
                                type="text"
                                placeholder="Enter name"
                                {...register("name", { required: "Name is required" })}
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.name ? "border-red-500" : ""
                                    }`}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>


                        {/* ========================= */}
                        <div className="w-full">
                            <label
                                htmlFor="imgUpload"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Upload Image
                            </label>
                            <input
                                id="imgUpload"
                                type="file"
                                accept="image/*"
                                {...register("img", { required: "Image is required" })}
                                className={`block w-full text-sm text-gray-700 border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 ${errors.img ? "border-red-500" : ""
                                    }`}
                            />
                            {errors.img && (
                                <p className="text-sm text-red-500 mt-1">{errors.img.message}</p>
                            )}

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mt-3 w-32 h-32 object-cover rounded-lg shadow-md border"
                                />
                            )}
                        </div>


                        {/* ====================== */}
                    </div>
                    {/* </div> */}

                    {/* Section 2 - Card Type and User Selection */}
                    {/* <div className="border p-4 rounded"> */}
                    <h3 className="text-lg font-semibold mb-2">Card Type and Users</h3>
                    <div className="space-y-3">
                        <TextField
                            fullWidth
                            select
                            // label="Card Type"
                            {...register("optionType", { required: true })}
                            SelectProps={{ native: true }}
                        >
                            <option value="nested">Nested Dashboard</option>
                            <option value="specific">Specific Link</option>
                        </TextField>

                        {optionType === "specific" && (
                            <div className="w-full">
                                <label
                                    htmlFor="commonLink"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Common Link
                                </label>
                                <input
                                    id="commonLink"
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
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.commonlink ? "border-red-500" : ""
                                        }`}
                                />
                                {errors.commonlink && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.commonlink.message}
                                    </p>
                                )}
                            </div>



                        )}

                        <div>
                            <div className="w-full">
                                <h6 className="text-lg font-semibold mb-2 text-gray-800">
                                    Select Users
                                </h6>
                                <input
                                    type="text"
                                    placeholder="Enter email or phone"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
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
                                                        prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id]
                                                    );
                                                }}
                                                disabled={
                                                    optionType === "nested"
                                                        ? nestedUsers.some((u) => u.id === user._id)
                                                        : specificUsers.some((u) => u.id === user._id)
                                                }
                                            />
                                            <span className="ml-2 flex-1">{user.email || user.phone || "Unknown"}</span>
                                        </div>
                                        {optionType === "specific" && selectedUsers.includes(user._id) && (
                                            <div className="w-full mt-2">
                                                {/* <label
                                                        htmlFor={`customLink-${user._id}`}
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Custom Link
                                                    </label> */}
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
                            <h4 className="font-medium mb-2">Upload Excel for Users</h4>
                            {uploadMessage && <p className="text-sm text-gray-600 mb-2">{uploadMessage}</p>}
                            <div className="w-full">
                                {/* <label
                                        htmlFor="excelUpload"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Upload Excel Files
                                    </label> */}
                                <input
                                    id="excelUpload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleExcelUpload}
                                    className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>

                        </div>
                    </div>
                    {/* </div> */}

                    {/* Section 3 - Added Nested Users */}
                    {nestedUsers.length > 0 && (
                        <div className="border p-4 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">
                                    Added Nested Users ({nestedUsers.length})
                                </h3>
                                <button
                                    onClick={handleClearNestedUsers}
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
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                        <IconButton onClick={() => handleDeleteUser(index, "nested")}>
                                            <CancelIcon color="error" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 4 - Added Specific Users */}
                    {specificUsers.length > 0 && (
                        <div className="border p-4 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">
                                    Added Specific Users ({specificUsers.length})
                                </h3>
                                <button
                                    onClick={handleClearSpecificUsers}
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
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="flex-1">{user.email || user.phone || "Unknown"}</span>
                                   
                                        <div className="flex-1">
                                            
                                            <input
                                                id={`userLink-${index}`}
                                                type="text"
                                                placeholder="Enter link"
                                                value={user.link || ""}
                                                onChange={(e) => handleModifyLink(index, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700 ${!!user.link && !/^https:\/\/.+/.test(user.link) ? "border-red-500" : "border-gray-300"
                                                    }`}
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

export default Zero_My_Dashboard_Add;