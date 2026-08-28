import React, { useEffect, useState } from "react";
import axios from "axios";
import { SupervisorAPI } from "../../../../api/config";
import {
    Box,
    Button,
    TextField,
    IconButton,
    Collapse,
    Alert,
    CircularProgress,
} from "@mui/material";
import { Add, Delete, Edit, Save, Cancel, ExpandLess, ExpandMore } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SupervisorType {
    _id: string;
    name: string;
}

function Supervisor() {
    const [supervisors, setSupervisors] = useState<SupervisorType[]>([]);
    const [loading, setLoading] = useState(false);
    const [openFormId, setOpenFormId] = useState<string | "new" | null>(null);

    const [newSupervisor, setNewSupervisor] = useState({ name: "" });
    const [editSupervisor, setEditSupervisor] = useState({ name: "" });

    // ============================
    // Fetch All Supervisors
    // ============================
    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const res = await axios.get(SupervisorAPI);
            if (res.data.success) setSupervisors(res.data.supervisors || []);
        } catch (err) {
            toast.error("Failed to load supervisors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupervisors();
    }, []);

    // ============================
    // Toggle Create Form
    // ============================
    const toggleCreate = () => {
        setOpenFormId(openFormId === "new" ? null : "new");
        setNewSupervisor({ name: "" });
    };

    // ============================
    // Toggle Edit Form
    // ============================
    const toggleEdit = (sup: SupervisorType) => {
        if (openFormId === sup._id) setOpenFormId(null);
        else {
            setOpenFormId(sup._id);
            setEditSupervisor({ name: sup.name });
        }
    };

    // ============================
    // Create Supervisor
    // ============================
    const handleCreate = async () => {
        if (!newSupervisor.name.trim()) return toast.error("Name is required");

        try {
            const res = await axios.post(SupervisorAPI, {
                name: newSupervisor.name.trim(),
            });

            if (res.data.success) {
                toast.success("Supervisor created!");
                fetchSupervisors();
                setOpenFormId(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Create failed");
        }
    };

    // ============================
    // Update Supervisor
    // ============================
    const handleUpdate = async (id: string) => {
        if (!editSupervisor.name.trim()) return toast.error("Name is required");

        try {
            const res = await axios.patch(`${SupervisorAPI}/${id}`, {
                name: editSupervisor.name.trim(),
            });

            if (res.data.success) {
                toast.success("Supervisor updated");
                fetchSupervisors();
                setOpenFormId(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    // ============================
    // Delete Supervisor
    // ============================
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            const res = await axios.delete(`${SupervisorAPI}/${id}`);
            if (res.data.success) {
                toast.success("Supervisor deleted");
                fetchSupervisors();
                if (openFormId === id) setOpenFormId(null);
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ToastContainer />

            <h2 className="text-3xl font-bold text-blue-700 mb-6">Department Name</h2>

            {/* Create Button */}
            <Button
                variant="contained"
                startIcon={openFormId === "new" ? <ExpandLess /> : <Add />}
                onClick={toggleCreate}
                sx={{ mb: 4 }}
            >
                {openFormId === "new" ? "Close Form" : "Create Department Name"}
            </Button>

            {/* Create Form */}
            <Collapse in={openFormId === "new"}>
                <Box className="p-5 bg-blue-50 border rounded-xl shadow-md mb-6">
                    <TextField
                        fullWidth
                        label="Supervisor Name *"
                        value={newSupervisor.name}
                        onChange={(e) => setNewSupervisor({ name: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <Button variant="outlined" sx={{ mr: 2 }} onClick={toggleCreate}>
                        Cancel
                    </Button>

                    <Button variant="contained" color="success" onClick={handleCreate}>
                        Save
                    </Button>
                </Box>
            </Collapse>

            {/* Supervisor List */}
            {loading ? (
                <Box className="flex justify-center py-10">
                    <CircularProgress />
                </Box>
            ) : supervisors.length === 0 ? (
                <Alert severity="info">No Supervisors Found</Alert>
            ) : (
                supervisors.map((sup) => (
                    <div key={sup._id} className="bg-white border rounded-xl shadow-md mb-4">
                        <div
                            className="p-5 bg-gray-100 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleEdit(sup)}
                        >
                            <div className="flex items-center gap-3">
                                {openFormId === sup._id ? <ExpandLess /> : <ExpandMore />}
                                <h3 className="text-xl font-semibold">{sup.name}</h3>
                            </div>

                            <IconButton
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(sup._id);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </div>

                        {/* Edit Form */}
                        <Collapse in={openFormId === sup._id}>
                            <Box className="p-5 bg-gray-50">
                                <TextField
                                    fullWidth
                                    label="Edit Name"
                                    value={editSupervisor.name}
                                    onChange={(e) => setEditSupervisor({ name: e.target.value })}
                                    sx={{ mb: 3 }}
                                />

                                <div className="flex gap-3">
                                    <Button startIcon={<Save />} variant="contained" color="success" onClick={() => handleUpdate(sup._id)}>
                                        Save Changes
                                    </Button>

                                    <Button startIcon={<Cancel />} variant="outlined" onClick={() => setOpenFormId(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </Box>
                        </Collapse>
                    </div>
                ))
            )}
        </div>
    );
}

export default Supervisor;
