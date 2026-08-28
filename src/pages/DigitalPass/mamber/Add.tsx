import React, { useState, useRef, useMemo } from "react";
import axios from "axios";
import { MamberAPI } from "../../../api/config";
import * as XLSX from "xlsx";
import {
    TextField,
    Button,
    IconButton,
    Box,
    Typography,
    Paper,
    Checkbox,
    FormControlLabel,
    Input
} from "@mui/material";
import { Add, Delete, Clear, UploadFile, Download, Save } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

interface User {
    name: string;
    email: string;
    phone: string;
}

function AddMamber() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [groupData, setGroupData] = useState({
        typeName: "",
        users: [{ name: "", email: "", phone: "" }],
    });

    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    const { duplicateNames, duplicateEmails, duplicatePhones } = useMemo(() => {
        const nameMap = new Map<string, number>();
        const emailMap = new Map<string, number>();
        const phoneMap = new Map<string, number>();

        groupData.users.forEach((user) => {
            const n = user.name.trim();
            if (n) nameMap.set(n, (nameMap.get(n) || 0) + 1);

            const e = user.email.trim();
            if (e) emailMap.set(e, (emailMap.get(e) || 0) + 1);

            const p = user.phone.trim();
            if (p) phoneMap.set(p, (phoneMap.get(p) || 0) + 1);
        });

        return {
            duplicateNames: new Set([...nameMap.entries()].filter(([, count]) => count > 1).map(([key]) => key)),
            duplicateEmails: new Set([...emailMap.entries()].filter(([, count]) => count > 1).map(([key]) => key)),
            duplicatePhones: new Set([...phoneMap.entries()].filter(([, count]) => count > 1).map(([key]) => key)),
        };
    }, [groupData.users]);

    // Add User Row
    const addUserRow = () => {
        setGroupData((prev) => ({
            ...prev,
            users: [...prev.users, { name: "", email: "", phone: "" }],
        }));
        // Clear selection when adding new
        setSelectedUsers(new Set());
    };

    // Remove User Row
    const removeUserRow = (index: number) => {
        if (groupData.users.length === 1) return;
        setGroupData((prev) => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== index),
        }));
        // Remove from selection
        setSelectedUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    };

    // Remove All Users (reset to one empty)
    const removeAllUsers = () => {
        setGroupData((prev) => ({
            ...prev,
            users: [{ name: "", email: "", phone: "" }],
        }));
        setSelectedUsers(new Set());
        toast.info("All users removed");
    };

    // Toggle User Selection
    const toggleUserSelection = (index: number) => {
        setSelectedUsers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Remove Selected Users
    const removeSelectedUsers = () => {
        if (selectedUsers.size === 0) {
            toast.warning("No users selected");
            return;
        }
        if (groupData.users.length - selectedUsers.size < 1) {
            // If removing would leave less than 1, reset to one empty
            removeAllUsers();
            return;
        }
        setGroupData((prev) => ({
            ...prev,
            users: prev.users.filter((_, i) => !selectedUsers.has(i)),
        }));
        setSelectedUsers(new Set());
        toast.success(`${selectedUsers.size} user(s) removed`);
    };

    // Update User Data
    const updateUser = (index: number, field: keyof User, value: string) => {
        const updatedUsers = [...groupData.users];
        updatedUsers[index][field] = value;
        setGroupData({ ...groupData, users: updatedUsers });
    };

    // Load Users for the entered Group Name and Add to Existing
    const loadGroupUsers = async () => {
        const groupName = groupData.typeName.trim();
        if (!groupName) {
            toast.error("Please enter a group name first");
            return;
        }

        try {
            const res = await axios.get(`${MamberAPI}/users/${groupName}`);
            if (res.data && Array.isArray(res.data.users) && res.data.users.length > 0) {
                // Assuming API returns { users: [{ name, email, phone }, ...] }
                const newUsers = res.data.users.map((u: User) => ({
                    name: u.name || "",
                    email: u.email || "",
                    phone: u.phone || ""
                }));
                setGroupData((prev) => ({
                    ...prev,
                    users: [...prev.users, ...newUsers],
                }));
                setSelectedUsers(new Set()); // Clear selection after load
                toast.success(`${groupName} users added successfully! (${newUsers.length} users)`);
            } else {
                toast.error("No users found or invalid response");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Failed to fetch ${groupName} users`);
        }
    };

    // Helper to find column name based on keywords
    const findColumn = (headers: string[], keywords: string[]): string => {
        return headers.find(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))) || '';
    };

    // Handle Excel File Upload
    const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

                if (jsonData.length === 0) {
                    toast.error("No data found in the Excel file");
                    return;
                }

                const headers = Object.keys(jsonData[0]);
                const nameCol = findColumn(headers, ['name', 'employee']);
                const emailCol = findColumn(headers, ['email']);
                const phoneCol = findColumn(headers, ['phone']);

                if (!nameCol || !emailCol || !phoneCol) {
                    toast.error("Required columns not found: Employee Name/Name, Email, Phone");
                    return;
                }

                const newUsers: User[] = jsonData
                    .map((row) => ({
                        name: (row[nameCol] || '').toString().trim(),
                        email: (row[emailCol] || '').toString().trim(),
                        phone: (row[phoneCol] || '').toString().trim(),
                    }))
                    .filter((user) => user.name || user.email || user.phone);

                if (newUsers.length === 0) {
                    toast.error("No valid users found in the Excel file");
                    return;
                }

                setGroupData((prev) => ({
                    ...prev,
                    users: [...prev.users, ...newUsers],
                }));
                setSelectedUsers(new Set()); // Clear selection after load
                toast.success(`Excel users added successfully! (${newUsers.length} users)`);
            } catch (error) {
                toast.error("Failed to parse Excel file");
            }
        };
        reader.readAsBinaryString(file);
        // Reset file input
        event.target.value = "";
    };

    // Trigger file input
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    // Download Demo Excel
    const downloadDemoExcel = () => {
        const sampleData = [
            { Name: "John Doe", Email: "john.doe@example.com", Phone: "+1234567890" },
            { Name: "Jane Smith", Email: "jane.smith@example.com", Phone: "+1234567891" },
            { Name: "Bob Johnson", Email: "bob.johnson@example.com", Phone: "+1234567892" },
            { Name: "Alice Brown", Email: "alice.brown@example.com", Phone: "+1234567893" },
            { Name: "Charlie Davis", Email: "charlie.davis@example.com", Phone: "+1234567894" }
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Demo Users");
        XLSX.writeFile(wb, "demo_users.xlsx");
        toast.success("Demo Excel downloaded for reference!");
    };

    // Submit Group
    const handleSubmit = async () => {
        if (!groupData.typeName.trim()) {
            toast.error("Group name is required");
            return;
        }

        const filteredUsers = groupData.users.filter(user =>
            user.name.trim() || user.email.trim() || user.phone.trim()
        );

        if (filteredUsers.length === 0) {
            toast.error("At least one user with data is required");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(MamberAPI, {
                typeName: groupData.typeName,
                users: filteredUsers
            });
            if (res.data.success) {
                toast.success("Member group added!");

                setTimeout(() => {
                    navigate("/my_dashboard/mamber");
                }, 1200);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ToastContainer />

            <Paper elevation={4} className="p-8 rounded-xl">
                <Typography variant="h4" fontWeight="bold" className="mb-6 text-blue-700">
                    Add Member Group
                </Typography>

                {/* Group Name */}
                <TextField
                    fullWidth
                    label="Group Name *"
                    value={groupData.typeName}
                    onChange={(e) => setGroupData({ ...groupData, typeName: e.target.value })}
                    sx={{ mb: 4 }}
                />

                <Typography variant="h6" className="mb-2">
                    Users
                </Typography>

                {groupData.users.map((user, i) => {
                    const nameError = duplicateNames.has(user.name.trim());
                    const emailError = duplicateEmails.has(user.email.trim());
                    const phoneError = duplicatePhones.has(user.phone.trim());

                    return (
                        <Box key={i} className="grid md:grid-cols-5 gap-3 mb-3 items-center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedUsers.has(i)}
                                        onChange={() => toggleUserSelection(i)}
                                    />
                                }
                                label=""
                                sx={{ justifyContent: "center", m: 0 }}
                            />
                            <TextField
                                label="Name"
                                value={user.name}
                                onChange={(e) => updateUser(i, "name", e.target.value)}
                                error={nameError}
                                helperText={nameError ? "Duplicate name" : ""}
                            />
                            <TextField
                                label="Email"
                                value={user.email}
                                onChange={(e) => updateUser(i, "email", e.target.value)}
                                error={emailError}
                                helperText={emailError ? "Duplicate email" : ""}
                            />
                            <TextField
                                label="Phone"
                                value={user.phone}
                                onChange={(e) => updateUser(i, "phone", e.target.value)}
                                error={phoneError}
                                helperText={phoneError ? "Duplicate phone" : ""}
                            />

                            <IconButton
                                color="error"
                                onClick={() => removeUserRow(i)}
                                disabled={groupData.users.length === 1}
                            >
                                <Delete />
                            </IconButton>
                        </Box>
                    );
                })}

                {/* Action Buttons */}
                <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={addUserRow}
                    >
                        Add User
                    </Button>

                    <Button
                        startIcon={<Clear />}
                        variant="outlined"
                        color="error"
                        onClick={removeAllUsers}
                        disabled={groupData.users.length === 1}
                    >
                        Remove All Users
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={removeSelectedUsers}
                        disabled={selectedUsers.size === 0}
                    >
                        Remove Selected ({selectedUsers.size})
                    </Button>

                    <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{ flexGrow: 1 }}
                        onClick={loadGroupUsers}
                    >
                        Load Users for Group
                    </Button>

                    {/* Excel Upload Button */}
                    <Button
                        startIcon={<UploadFile />}
                        variant="outlined"
                        color="info"
                        onClick={triggerFileUpload}
                    >
                        Import from Excel
                    </Button>

                    {/* Demo Excel Download Button */}
                    <Button
                        startIcon={<Download />}
                        variant="outlined"
                        color="primary"
                        onClick={downloadDemoExcel}
                    >
                        Download Demo Excel
                    </Button>

                    {/* Hidden File Input */}
                    <Input
                        type="file"
                        inputProps={{ accept: ".xlsx, .xls" }}
                        inputRef={fileInputRef}
                        onChange={handleExcelUpload}
                        style={{ display: "none" }}
                    />
                </Box>

                {/* Save Button */}
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    color="success"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Group"}
                </Button>
            </Paper>
        </div>
    );
}

export default AddMamber;