import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button as MuiButton,
    IconButton,
    TextField,
    Checkbox,
    FormControlLabel,
    Box,
    Alert,
    FormGroup,
    CircularProgress,
} from "@mui/material";
import { Add, Delete, Person } from "@mui/icons-material";
import Button from "../../../components/button/Button";
import { eventPass_format, MamberAPI } from "../../../api/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FieldConfig {
    label: string;
    type: "text";
    required: boolean;
    placeholder?: string;
}

interface Member {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    typeName: string;
}

const DigitalPassFormAdd: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accessType, setAccessType] = useState<"public" | "private">("public");
    const [fields, setFields] = useState<FieldConfig[]>([
        // { label: "Address", type: "text", required: true, placeholder: "Enter full address" },
        { label: "Purpose of Visit", type: "text", required: false, placeholder: "e.g., Meeting with team" },
    ]);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [memberLoading, setMemberLoading] = useState(true);

    // Fetch Members — 100% Safe
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setMemberLoading(true);
                const res = await axios.get(MamberAPI);
                console.log("API Response:", res.data);
                let data: any[] = [];
                if (Array.isArray(res.data)) data = res.data;
                else if (res.data?.data && Array.isArray(res.data.data)) data = res.data.data;
                else if (res.data?.members && Array.isArray(res.data.members)) data = res.data.members;
                else if (res.data?.result && Array.isArray(res.data.result)) data = res.data.result;
                setMembers(data);
            } catch (err: any) {
                console.error("Failed to load members:", err);
                toast.error("Could not load members");
                setMembers([]);
            } finally {
                setMemberLoading(false);
            }
        };
        fetchMembers();
    }, []);

    // Reset selected members when access type changes
    useEffect(() => {
        if (accessType !== "private") {
            setSelectedMemberIds(new Set());
        }
    }, [accessType]);

    const toggleMember = (id: string) => {
        setSelectedMemberIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const clearAllPrivateUsers = () => {
        setSelectedMemberIds(new Set());
        toast.info("Cleared all users");
    };

    const validateForm = () => {
        if (!title.trim()) return "Title is required";
        if (accessType === "private" && selectedMemberIds.size === 0) return "Select at least one user";
        if (fields.some(f => !f.label.trim())) return "All field labels are required";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validateForm();
        if (error) return toast.error(error);
        const payload = {
            eventId,
            title: title.trim(),
            description: description.trim() || undefined,
            accessType,
            fields,
            ...(accessType === "private" && { privateUsers: Array.from(selectedMemberIds) }),
        };
        try {
            setLoading(true);
            await axios.post(eventPass_format, payload, {
                headers: { "Content-Type": "application/json" },
            });
            toast.success("Form created successfully!");
            navigate(`/digitalPass/form/view/${eventId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen  flex justify-center">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="bg-white rounded-3xl shadow-2xl p-10 md:max-w-[40rem]">
                <h2 className="text-4xl font-bold text-indigo-700 mb-4">Create Form Template</h2>
                {/* <p className="text-gray-600 mb-10">
                    Event ID: <code className="bg-gray-200 px-4 py-2 rounded-lg font-mono">{eventId}</code>
                </p> */}
                <form onSubmit={handleSubmit} className="space-y-10">
                    <TextField fullWidth label="Form Title *" value={title} onChange={e => setTitle(e.target.value)} />
                    <TextField fullWidth label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} multiline rows={3} />
                    <FormControl fullWidth>
                        <InputLabel>Access Type</InputLabel>
                        <Select value={accessType} onChange={e => setAccessType(e.target.value as any)}>
                            <MenuItem value="public">Public (Anyone)</MenuItem>
                            <MenuItem value="private">Private (Selected Users Only)</MenuItem>
                        </Select>
                    </FormControl>
                    {/* PRIVATE SECTION */}
                    {accessType === "private" && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border-4 border-purple-200 space-y-8">
                            {/* Registered Members */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
                                        <Person className="text-3xl" /> Registered Members
                                    </h3>
                                    {selectedMemberIds.size > 0 && (
                                        <MuiButton
                                            variant="outlined"
                                            color="error"
                                            onClick={clearAllPrivateUsers}
                                        >
                                            Clear All ({selectedMemberIds.size})
                                        </MuiButton>
                                    )}
                                </div>
                                {memberLoading ? (
                                    <div className="flex justify-center py-10">
                                        <CircularProgress />
                                    </div>
                                ) : members.length === 0 ? (
                                    <Alert severity="info">No registered members found</Alert>
                                ) : (
                                    <FormGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto bg-white rounded-xl p-5 shadow">
                                        {members.map(member => (
                                            <FormControlLabel
                                                key={member._id}
                                                control={
                                                    <Checkbox
                                                        checked={selectedMemberIds.has(member._id)}
                                                        onChange={() => toggleMember(member._id)}
                                                    />
                                                }
                                                label={
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-800 truncate">{member.name}</div>
                                                        <div className="text-sm text-gray-600 truncate">{member.typeName}</div>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </FormGroup>
                                )}
                                {selectedMemberIds.size > 0 && (
                                    <Alert severity="info" className="mt-4">
                                        Selected: {selectedMemberIds.size} user(s)
                                    </Alert>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Custom Fields */}
                    <div className="border-t-4 border-gray-300 pt-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-3xl font-bold text-gray-800">Custom Form Fields</h3>
                            <MuiButton
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setFields(prev => [...prev, { label: "", type: "text", required: false }])}
                            >
                                Add Field
                            </MuiButton>
                        </div>
                        {fields.map((field, i) => (
                            <Box key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-xl font-semibold">Field {i + 1}</h4>
                                    <IconButton color="error" onClick={() => setFields(prev => prev.filter((_, idx) => idx !== i))}>
                                        <Delete fontSize="large" />
                                    </IconButton>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <TextField
                                        label="Field Label *"
                                        value={field.label}
                                        onChange={e => setFields(prev => prev.map((f, idx) => idx === i ? { ...f, label: e.target.value } : f))}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Placeholder"
                                        value={field.placeholder || ""}
                                        onChange={e => setFields(prev => prev.map((f, idx) => idx === i ? { ...f, placeholder: e.target.value } : f))}
                                        fullWidth
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.required}
                                                onChange={e => setFields(prev => prev.map((f, idx) => idx === i ? { ...f, required: e.target.checked } : f))}
                                            />
                                        }
                                        label="Required Field"
                                    />
                                </div>
                            </Box>
                        ))}
                    </div>
                    <Button text="Create Form Template" loading={loading} />
                </form>
            </div>
        </div>
    );
};

export default DigitalPassFormAdd;