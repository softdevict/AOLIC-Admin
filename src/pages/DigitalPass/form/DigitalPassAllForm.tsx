import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { digital_pass, eventPass_format } from "../../../api/config";
import {
    CircularProgress,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavButton from "../../../components/button/NavButton";

import {
    Link as LinkIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    ContentCopy as CopyIcon
} from "@mui/icons-material";

interface FormTemplate {
    _id: string;
    title: string;
    description?: string;
    accessType: "public" | "private";
    allowedUsers?: string[];
    privateUsers: string[];
    isActive: boolean;
    shareLink: string;
    createdAt: string;
    updatedAt: string;
    fieldsCount: number;
    event: {
        _id: string;
        name: string;
        title?: string;
    };
}

function DigitalPassAllForm() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ⭐ Notification loading state
    const [sendingId, setSendingId] = useState<string | null>(null);

    // ⭐ Modal states
    const [openModal, setOpenModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
    const [header, setHeader] = useState("");
    const [body, setBody] = useState("");
    const [includeLink, setIncludeLink] = useState(true);
    const [formLink, setFormLink] = useState("");

    const location = useLocation();
    let passName = location.state?.passName || "Event";

    // ================================
    // FETCH FORMS
    // ================================
    useEffect(() => {
        const fetchForms = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${eventPass_format}/${eventId}`);

                if (res.data?.success && Array.isArray(res.data.forms)) {
                    setForms(res.data.forms);
                } else {
                    toast.warning("No forms found for this event.");
                    setForms([]);
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Server error while fetching forms.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchForms();
    }, [eventId]);

    // ================================
    // OPEN FORM
    // ================================
    const handleOpenForm = (formId: string) => {
        window.open(`${window.location.origin}/digitalPass/form/link/${formId}`, '_blank');
    };

    // ================================
    // EDIT FORM
    // ================================
    const handleEditForm = (formId: string) => {
        navigate(`/digitalPass/form/edit/${formId}`, {
            state: { eventId }
        });
    };

    // ================================
    // DELETE FORM
    // ================================
    const handleDeleteForm = async (formId: string) => {
        if (!window.confirm("Are you sure you want to delete this form?")) return;

        try {
            setDeletingId(formId);
            await axios.delete(`${eventPass_format}/${formId}`);

            toast.success("Form deleted successfully!");
            setForms(prev => prev.filter(f => f._id !== formId));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete form.");
        } finally {
            setDeletingId(null);
        }
    };

    // ================================
    // COPY LINK
    // ================================
    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    // ================================
    // SEND NOTIFICATION - Open Modal
    // ================================
    const handleSendNotification = (form: FormTemplate) => {
        const fullLink = `${window.location.origin}/digitalPass/form/link/${form._id}`;

        setSelectedForm(form);
        setFormLink(fullLink);
        setHeader(`Event Pass for ${passName}`);
        setBody(`Please complete the form for ${form.title}.`);
        setIncludeLink(true);
        setOpenModal(true);
    };

    // ================================
    // SEND NOTIFICATION - Submit
    // ================================
    const handleSubmitNotification = async () => {
        if (!header.trim()) {
            return toast.error("Header is required");
        }
        if (!body.trim()) {
            return toast.error("Body is required");
        }

        if (!selectedForm) return;

        setOpenModal(false);

        try {
            setSendingId(selectedForm._id);
            const notifyEndpoint = `${digital_pass}/notify/${selectedForm.accessType}`;

            // Append link to body if includeLink is true
            const finalMessage = includeLink
                ? `${body.trim()}\n\nForm Link: ${formLink}`
                : body.trim();

            const payload = {
                formId: selectedForm._id,
                title: header.trim(),
                message: finalMessage,
                link: includeLink ? formLink : "",
                ...(selectedForm.accessType === "private" && { privateUsers: selectedForm.privateUsers })
            };

            const res = await axios.post(notifyEndpoint, payload);

            if (res.data.success) {
                toast.success("Notification sent successfully!");
            } else {
                toast.error(res.data.message || "Failed to send notification");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Notification failed");
        } finally {
            setSendingId(null);
        }
    };

    // ================================
    // CLOSE MODAL
    // ================================
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedForm(null);
        setHeader("");
        setBody("");
        setFormLink("");
        setIncludeLink(true);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />

            <h2 className="text-3xl font-bold mb-4 text-gray-800">
                All Forms for Event: {passName}
            </h2>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <CircularProgress />
                </div>
            )}

            {/* Create Form Button */}
            <div className="flex justify-end mb-4">
                <NavButton to={`/digitalPass/form/add/${eventId}`}>
                    Create Form Template
                </NavButton>
            </div>

            {/* ================================ */}
            {/* DISPLAY FORMS */}
            {/* ================================ */}
            {!loading && forms.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div
                            key={form._id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 p-5 transition-all duration-200"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {form.title}
                            </h3>

                            <p className="text-sm text-gray-500 mb-2">
                                {form.description || "No description"}
                            </p>

                            <div className="text-xs text-gray-600 mb-2">
                                Access:{" "}
                                <span
                                    className={`font-semibold ${form.accessType === "public"
                                        ? "text-green-600"
                                        : "text-purple-600"
                                        }`}
                                >
                                    {form.accessType.toUpperCase()}
                                </span>
                            </div>

                            <div className="text-xs mb-3 text-gray-500">
                                Fields: {form.fieldsCount} | Created:{" "}
                                {new Date(form.createdAt).toLocaleDateString()}
                            </div>

                            {/* Status */}
                            <div
                                className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${form.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {form.isActive ? "Active" : "Inactive"}
                            </div>

                            {/* Buttons */}
                            <div className="mt-4 flex space-x-1">
                                {/* Open */}
                                <Tooltip title="Open Form">
                                    <IconButton
                                        onClick={() => handleOpenForm(form._id)}
                                        size="small"
                                        color="success"
                                    >
                                        <LinkIcon />
                                    </IconButton>
                                </Tooltip>

                                {/* Copy Link */}
                                <Tooltip title="Copy Link">
                                    <IconButton
                                        onClick={() => handleCopyLink(`${window.location.origin}/digitalPass/form/link/${form._id}`)}
                                        size="small"
                                        color="info"
                                    >
                                        <CopyIcon />
                                    </IconButton>
                                </Tooltip>

                                {/* Edit */}
                                <Tooltip title="Edit Form">
                                    <IconButton
                                        onClick={() => handleEditForm(form._id)}
                                        size="small"
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

                                {/* Delete */}
                                <Tooltip title="Delete Form">
                                    <IconButton
                                        onClick={() => handleDeleteForm(form._id)}
                                        disabled={deletingId === form._id}
                                        size="small"
                                        color="error"
                                    >
                                        {deletingId === form._id ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <DeleteIcon />
                                        )}
                                    </IconButton>
                                </Tooltip>

                                {/* Send Notification */}
                                <Tooltip title="Send Notification">
                                    <IconButton
                                        onClick={() => handleSendNotification(form)}
                                        disabled={sendingId === form._id}
                                        size="small"
                                        color="primary"
                                    >
                                        {sendingId === form._id ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <SendIcon />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EMPTY */}
            {!loading && forms.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <h3 className="text-2xl font-semibold mb-2">No Forms Found</h3>
                    <p>This event doesn't have any form templates yet.</p>
                </div>
            )}

            {/* Notification Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle className="border-b">
                    Send Notification
                </DialogTitle>
                <DialogContent className="pt-4">
                    <TextField
                        fullWidth
                        label="Header *"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        placeholder="Enter the notification header..."
                        variant="outlined"
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Body *"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Enter the notification body..."
                        variant="outlined"
                        margin="dense"
                    />

                    {/* Include Link Toggle */}
                    <div className="mt-3 mb-2">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={includeLink}
                                    onChange={(e) => setIncludeLink(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Include form link in notification"
                        />
                    </div>

                    {/* Display Link Preview */}
                    {includeLink && formLink && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                                Form Link (will be included):
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-blue-600 break-all flex-1">
                                    {formLink}
                                </p>
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopyLink(formLink)}
                                    title="Copy Link"
                                >
                                    <CopyIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="border-t px-6 py-3">
                    <Button onClick={handleCloseModal} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitNotification}
                        variant="contained"
                        disabled={!header.trim() || !body.trim()}
                        startIcon={<SendIcon />}
                    >
                        Send Notification
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DigitalPassAllForm;