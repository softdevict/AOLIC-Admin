import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Card,
    Chip,
    Avatar,
    IconButton,
    Paper,
    Alert,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Autocomplete,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    CloudUpload as CloudUploadIcon,
    Person as PersonIcon,
    ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { nested_my_dashboard_api, my_dashboard_user, display_details_nestedCard } from '../../api/config';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AssignedUser {
    id: string;
    link: string;
}

interface Props { }

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const EditNestedDashboard: React.FC<Props> = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const dashboardCardId = location.state?.id || dashboardId;

    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [commonLink, setCommonLink] = useState('');
    const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    // Validate URL format
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return url.startsWith('https://');
        } catch {
            return false;
        }
    };

    // Load card details
    useEffect(() => {
        if (!dashboardId) {
            setMessage({ type: 'error', text: 'Invalid dashboard ID.' });
            return;
        }
        const fetchData = async () => {
            try {
                const res = await axios.get(`${display_details_nestedCard}/${dashboardId}`);
                const card = res.data.data;
                setName(card.name || '');
                setCommonLink(card.commonlink || '');
                setAssignedUsers(
                    card.specifyLink?.map((u: any) => ({
                        id: typeof u.id === 'string' ? u.id : u.id._id,
                        link: u.link || '',
                    })) || []
                );
                setImages(card.img ? [card.img] : []);
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to fetch card details.' });
            }
        };
        fetchData();
    }, [dashboardId]);

    // Load all users
    useEffect(() => {
        if (!dashboardCardId) {
            setMessage({ type: 'error', text: 'Invalid dashboard card ID.' });
            return;
        }
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${my_dashboard_user}/${dashboardCardId}`);
                const fetchedUsers = Array.isArray(res.data.data)
                    ? res.data.data.map((u: any) => ({
                        _id: String(u._id),
                        name: String(u.name),
                        email: String(u.email),
                    }))
                    : [];
                setUsers(fetchedUsers);
            } catch (err) {
                console.error(err);
                setUsers([]);
                setMessage({ type: 'error', text: 'Failed to fetch users.' });
            }
        };
        fetchUsers();
    }, [dashboardCardId]);

    // Handle Excel file upload
    const handleExcelChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setMessage({ type: 'error', text: 'No file selected.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    setMessage({ type: 'error', text: 'Excel file is empty.' });
                    return;
                }
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

                if (jsonData.length === 0) {
                    setMessage({ type: 'error', text: 'Excel file contains no data.' });
                    return;
                }

                const headers = (jsonData[0] as string[]).map((header) => header?.toString().toLowerCase());
                const emailCol = headers.find((h) => h === 'email' || h === 'Email');
                const linkCol = headers.find((h) => h === 'link' || h === 'Link');

                if (!emailCol) {
                    setMessage({
                        type: 'error',
                        text: 'Excel file must contain an "Email" column (case-insensitive).',
                    });
                    return;
                }

                const newUsers: AssignedUser[] = [];
                const errors: string[] = [];

                jsonData.slice(1).forEach((row, index) => {
                    const rowData = row as any[];
                    const email = rowData[headers.indexOf(emailCol)]?.toString().trim();
                    const link = linkCol ? rowData[headers.indexOf(linkCol)]?.toString().trim() || '' : '';

                    if (!email) {
                        errors.push(`Row ${index + 2}: Missing Email.`);
                        return;
                    }

                    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
                    if (!user) {
                        errors.push(`Row ${index + 2}: Email ${email} not found in users.`);
                        return;
                    }

                    if (link && !isValidUrl(link)) {
                        errors.push(`Row ${index + 2}: Invalid link format for ${email}. Must start with https://.`);
                        return;
                    }

                    if (!newUsers.some((u) => u.id === user._id) && !assignedUsers.some((u) => u.id === user._id)) {
                        newUsers.push({ id: user._id, link });
                    }
                });

                if (errors.length > 0) {
                    setMessage({ type: 'error', text: errors.join('\n') });
                    return;
                }

                setAssignedUsers((prev) => [
                    ...prev,
                    ...newUsers.filter((nu) => !prev.some((p) => p.id === nu.id)),
                ]);
                setMessage({
                    type: 'success',
                    text: `Successfully added ${newUsers.length} users from Excel.`,
                });
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to process Excel file.' });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAddUser = () => {
        if (!selectedUserId) {
            setMessage({ type: 'error', text: 'Please select an Email.' });
            return;
        }

        if (!assignedUsers.some((u) => u.id === selectedUserId)) {
            setAssignedUsers([...assignedUsers, { id: selectedUserId, link: '' }]);
            setMessage({ type: 'success', text: 'User added successfully.' });
        } else {
            setMessage({ type: 'error', text: 'This user is already assigned.' });
        }

        setSelectedUserId('');
    };

    const handleRemoveUser = (userId: string) => {
        setAssignedUsers(assignedUsers.filter((u) => u.id !== userId));
        setMessage(null);
    };

    const handleUserLinkChange = (userId: string, link: string) => {
        setAssignedUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, link } : u)));
        setMessage(null);
    };

    const handleClearAssignedUsers = () => {
        setAssignedUsers([]);
        setMessage({ type: 'success', text: 'All assigned users cleared.' });
        setOpenClearDialog(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const trimmedName = name.trim();
        const trimmedCommonLink = commonLink.trim();

        if (!trimmedName) {
            setMessage({ type: 'error', text: 'Name is required.' });
            return;
        }

        if (!trimmedCommonLink) {
            setMessage({ type: 'error', text: 'Common Link is required.' });
            return;
        }

        if (!isValidUrl(trimmedCommonLink)) {
            setMessage({ type: 'error', text: 'Common Link must be a valid URL starting with https://.' });
            return;
        }

        for (const user of assignedUsers) {
            if (user.link && !isValidUrl(user.link)) {
                const userData = users.find((u) => u._id === user.id);
                setMessage({
                    type: 'error',
                    text: `Invalid link for ${userData?.email || user.id}. Must start with https://.`,
                });
                return;
            }
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('commonLink', trimmedCommonLink);
            formData.append('specifyLink', JSON.stringify(assignedUsers));
            selectedFiles.forEach((file) => formData.append('img', file));

            const res = await axios.patch(`${nested_my_dashboard_api}/${dashboardId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage({ type: 'success', text: res.data.message });
            toast.success('Edited successfully!');

            setTimeout(() => {
                setTimeout(() => navigate('/my_dashboard/nested', { state: { id: dashboardCardId } }), 1000);
            }, 2000)
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update card. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <Card
                elevation={3}
                sx={{
                    maxWidth: '800px',
                    mx: 'auto',
                    mt: 5,
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight={700} // bolder
                            color="#0D1B2A" // blackish-blue
                            sx={{
                                letterSpacing: '0.5px',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                            }}
                        >
                            Edit Dashboard Card
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            mr: 1,
                            color: '#0D1B2A', // same blackish-blue
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.2)', color: '#1B2A3D' },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Box>


                <Divider sx={{ mb: 3 }} />

                {images.length > 0 && (
                    <Box mb={3}>
                        <Typography variant="h6" fontWeight="500" mb={1}>
                            Current Image
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            {images.map((imgUrl, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        position: 'relative',
                                    }}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`Card ${idx}`}
                                        style={{ width: 200, height: 150, objectFit: 'cover' }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                <Box mb={3}>
                    <Typography variant="h6" fontWeight="500" mb={1}>
                        Update Image
                    </Typography>
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Select New Images
                        <VisuallyHiddenInput
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                    setSelectedFiles(files);
                                    setMessage(null);
                                }
                            }}
                        />
                    </Button>
                    {selectedFiles.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {selectedFiles.map((file, idx) => (
                                <Chip
                                    key={idx}
                                    label={file.name}
                                    variant="filled"
                                    color="primary"
                                    size="small"
                                    onDelete={() =>
                                        setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
                                    }
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            margin="normal"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setMessage(null);
                            }}
                            error={!!message && message.type === 'error' && message.text.includes('Name')}
                            helperText={
                                !!message && message.type === 'error' && message.text.includes('Name')
                                    ? message.text
                                    : ''
                            }
                            variant="outlined"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                flex: { md: 1 },
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Common Link"
                            margin="normal"
                            value={commonLink}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                setCommonLink(value);
                                setMessage(null);
                            }}
                            error={!!commonLink && !commonLink.startsWith('https://')}
                            helperText={
                                !!commonLink && !commonLink.startsWith('https://')
                                    ? 'Common Link must start with https://'
                                    : ''
                            }
                            variant="outlined"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                flex: { md: 1 },
                            }}
                        />
                    </Box>

                    <Box mt={3} mb={2}>
                        <Typography variant="h6" fontWeight="500" mb={1}>
                            User Assignment
                        </Typography>
                        <Autocomplete
                            fullWidth
                            options={users}
                            getOptionLabel={(option) => option.email}
                            renderOption={(props, option) => (
                                <li {...props} key={option._id}>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                                            <PersonIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        {option.email}
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Email"
                                    variant="outlined"
                                    sx={{
                                        backgroundColor: 'white',
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    }}
                                />
                            )}
                            value={users.find((u) => u._id === selectedUserId) || null}
                            onChange={(event, newValue) => {
                                setSelectedUserId(newValue?._id || '');
                            }}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            noOptionsText="No users found"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleAddUser}
                            sx={{ mt: 2, borderRadius: 2 }}
                        >
                            Add User
                        </Button>
                    </Box>

                    <Box mb={3}>
                        <Typography variant="subtitle1" mb={1}>
                            Bulk Upload from Excel (Columns: Email - required; Link - optional)
                        </Typography>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Upload Excel
                            <VisuallyHiddenInput
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleExcelChange}
                            />
                        </Button>
                    </Box>

                    {assignedUsers.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight="500">
                                    Assigned Users ({assignedUsers.length})
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<ClearAllIcon />}
                                    onClick={() => setOpenClearDialog(true)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                            {assignedUsers.map((user) => {
                                const userData = users.find((u) => u._id === user.id);
                                return (
                                    <Paper
                                        key={`${user.id}-${user.link}`}
                                        elevation={1}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            mt: 2,
                                            p: 2,
                                            borderRadius: 2,
                                            gap: 2,
                                            bgcolor: 'grey.100',
                                        }}
                                    >
                                        <Chip
                                            avatar={
                                                <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                                    {userData?.email?.charAt(0).toUpperCase() || 'U'}
                                                </Avatar>
                                            }
                                            label={userData?.email || user.id}
                                            variant="outlined"
                                            sx={{
                                                width: '100%',
                                                fontWeight: 500,
                                                fontSize: '1rem',
                                                padding: '1.5rem .5rem',
                                                boxSizing: 'border-box',
                                                justifyContent: 'flex-start',
                                                '& .MuiChip-label': {
                                                    justifyContent: 'flex-start',
                                                    width: '100%',
                                                },
                                            }}
                                        />
                                        <TextField
                                            label="User-specific Link (Optional)"
                                            value={user.link}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value && !value.startsWith('https://')) {
                                                    setMessage({
                                                        type: 'error',
                                                        text: `${userData?.email || user.id} link must start with https://`,
                                                    });
                                                } else {
                                                    setMessage(null);
                                                }
                                                handleUserLinkChange(user.id, value);
                                            }}
                                            size="small"
                                            error={!!user.link && !user.link.startsWith('https://')}
                                            helperText={!!user.link && !user.link.startsWith('https://') ? 'Link must start with https://' : ''}
                                            fullWidth
                                            sx={{ backgroundColor: 'white' }}
                                        />
                                        <Box sx={{ alignSelf: 'flex-end' }}>
                                            <IconButton
                                                onClick={() => handleRemoveUser(user.id)}
                                                color="error"
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Paper>
                    )}

                    <Box mt={4} display="flex" justifyContent="center">
                        {/* <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: '600',
                            }}
                        >
                            {loading ? 'Updating...' : 'Update Card'}
                        </Button> */}
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}

                            sx={{
                                width: "100%",
                                borderRadius: 1,
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: loading
                                    ? '#9CA3AF' // Matches Tailwind's bg-gray-400 for disabled/loading state
                                    : 'linear-gradient(to bottom right, #27ae60, #27ae93)', // Gradient from #27ae60 to #27ae93
                                color: 'white', // Matches text-white
                                transition: 'all 0.3s ease', // Matches Tailwind's transition-all
                                '&:hover': {
                                    background: loading
                                        ? '#9CA3AF' // Keep disabled background on hover
                                        : 'linear-gradient(to bottom right, #2ecc71, #2ea4a1)', // Slightly lighter gradient for hover
                                    // Only apply shadow and transform if not loading
                                    ...(loading
                                        ? {}
                                        : {
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Matches hover:shadow-lg
                                            transform: 'translateY(-0.125rem)', // Matches hover:-translate-y-0.5
                                        }),
                                },
                                '&.Mui-disabled': {
                                    color: 'white', // Ensure text remains white when disabled
                                    opacity: 0.7, // Slightly reduce opacity for disabled state
                                },
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>

                    {message && (
                        <Alert
                            severity={message.type}
                            sx={{ mt: 3, borderRadius: 2 }}
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    )}
                </form>

                <Dialog
                    open={openClearDialog}
                    onClose={() => setOpenClearDialog(false)}
                    aria-labelledby="clear-dialog-title"
                >
                    <DialogTitle id="clear-dialog-title">Clear Assigned Users</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to clear all assigned users? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenClearDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleClearAssignedUsers} color="error" autoFocus>
                            Clear
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>
        </>
    );
};

export default EditNestedDashboard;