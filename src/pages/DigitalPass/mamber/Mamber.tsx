import React, { useEffect, useState } from "react";
import axios from "axios";
import { MamberAPI } from "../../../api/config";
import {
    Alert,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GradientNavButton from "../../../components/button/NavButton";
import { useNavigate } from "react-router-dom";

interface User {
    name?: string;
    email?: string;
    phone?: string;
}

interface MemberGroup {
    _id: string;
    typeName: string;
    users: User[];
}

function Mamber() {
    const [members, setMembers] = useState<MemberGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Popup State
    const [openPopup, setOpenPopup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    // ------------------ FETCH MEMBERS ------------------
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(MamberAPI);
            if (res.data.success) setMembers(res.data.members);
        } catch {
            toast.error("Failed to load member groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // ------------------ DELETE GROUP ------------------
    const deleteMember = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        try {
            const res = await axios.delete(`${MamberAPI}/${id}`);
            if (res.data.success) {
                toast.success("Group deleted");
                fetchMembers();
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    // ------------------ OPEN USER POPUP ------------------
    const viewUsers = (group: MemberGroup) => {
        setSelectedGroup(group.typeName);
        setSelectedUsers(group.users);
        setOpenPopup(true);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <ToastContainer />

            {/* Header Buttons */}
            <div className="flex justify-end mb-4 gap-3">
                <GradientNavButton to="/my_dashboard/mamber/add">
                    Add Department  Group
                </GradientNavButton>

                <GradientNavButton to="/my_dashboard/supervisor">
                    Department Name
                </GradientNavButton>
            </div>

            <h2 className="text-3xl font-bold text-blue-700 mb-8">
                Department  Groups
            </h2>

            {loading && <p className="text-gray-600">Loading...</p>}

            {!loading && members.length === 0 && (
                <Alert severity="info">No groups available.</Alert>
            )}

            {/* TABLE VIEW */}
            {!loading && members.length > 0 && (
                <div className="overflow-x-auto rounded-xl border shadow-md bg-white">
                    <Table>
                        <TableHead sx={{ background: "#f1f5f9" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>No.</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Department Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Total Users</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {members.map((group, index) => (
                                <TableRow key={group._id}>
                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>{group.typeName}</TableCell>

                                    <TableCell>{group.users.length}</TableCell>

                                    <TableCell align="center">
                                        {/* View Users */}
                                        <IconButton
                                            color="secondary"
                                            onClick={() => viewUsers(group)}
                                        >
                                            <Visibility />
                                        </IconButton>

                                        {/* Edit */}
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                navigate(`/my_dashboard/mamber/edit/${group._id}`)
                                            }
                                        >
                                            <Edit />
                                        </IconButton>

                                        {/* Delete */}
                                        <IconButton
                                            color="error"
                                            onClick={() => deleteMember(group._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* POPUP FOR USERS */}
            <Dialog open={openPopup} onClose={() => setOpenPopup(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Users in <strong>{selectedGroup}</strong>
                </DialogTitle>

                <DialogContent dividers>
                    {selectedUsers.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div className="space-y-3">
                            {selectedUsers.map((u, i) => (
                                <div
                                    key={i}
                                    className="border p-3 rounded-md bg-gray-50 shadow-sm"
                                >
                                    <p><strong>Name:</strong> {u.name || "-"}</p>
                                    <p><strong>Email:</strong> {u.email || "-"}</p>
                                    <p><strong>Phone:</strong> {u.phone || "-"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>

                <Button onClick={() => setOpenPopup(false)} sx={{ m: 2 }} variant="contained">
                    Close
                </Button>
            </Dialog>
        </div>
    );
}

export default Mamber;
