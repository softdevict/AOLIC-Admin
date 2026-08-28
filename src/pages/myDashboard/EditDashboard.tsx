import React, { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Autocomplete,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon,
    Person as PersonIcon,
    ClearAll as ClearAllIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { my_dashboard_api_allDetails, displayAllUSer_email_phone, my_dashboard_api, searchUser_email_phone } from '../../api/config';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';

// TypeScript Interfaces
interface User {
    _id: string;
    name?: string; // Optional to handle undefined/null cases
    email: string;
    phone: string;
}

interface AllowUserFromAPI {
    _id: string;
    name?: string;
    email: string;
    phone: string;
}

interface SpecifyLinkFromAPI {
    id: string | { _id: string; email: string; phone: string }; // Because sometimes id is an object
    link: string;
}

interface SpecifyLinkUser {
    id: string;
    link: string;
}

interface DashboardData {
    name: string;
    commonlink: string;
    img?: string;
    allowUser: User[];
    specifyLink: SpecifyLinkFromAPI[];
}

interface ApiResponse<T> {
    data: T;
}

interface Message {
    type: 'success' | 'error';
    text: string[];
}

// Utility function for Excel processing
const processExcelFile = (
    file: File,
    allUsers: User[],
    userMap: Map<string, User>,
    mode: 'id-only' | 'id-with-link',
    setAllowUser: React.Dispatch<React.SetStateAction<User[]>>,
    setSpecifyLink: React.Dispatch<React.SetStateAction<SpecifyLinkUser[]>>,
    setMessage: React.Dispatch<React.SetStateAction<Message | null>>
) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

            const headers = (jsonData[0] as string[]).map((h) => h?.toString().toLowerCase());
            const emailCol = headers.indexOf('email');
            const linkCol = headers.indexOf('link');

            if (emailCol === -1) {
                setMessage({ type: 'error', text: ['Excel file must contain an "Email" column.'] });
                return;
            }

            if (mode === 'id-with-link' && linkCol === -1) {
                setMessage({ type: 'error', text: ['Excel file must contain a "Link" column for ID with Link mode.'] });
                return;
            }

            const errors: string[] = [];
            const newUsers: User[] = [];
            const newSpecifyLinks: SpecifyLinkUser[] = [];
            let added = 0;
            let updated = 0;

            jsonData.slice(1).forEach((row, index) => {
                const email = row[emailCol]?.toString().trim();
                const link = linkCol !== -1 && mode === 'id-with-link' ? row[linkCol]?.toString().trim() || '' : '';

                if (!email) {
                    errors.push(`Row ${index + 2}: Missing email.`);
                    return;
                }

                const user = userMap.get(email.toLowerCase() + '|' + (row[headers.indexOf('phone')] || ''));
                if (!user || !user._id || !user.email || !user.phone) {
                    errors.push(`Row ${index + 2}: Invalid user data for email ${email}.`);
                    return;
                }

                if (mode === 'id-only') {
                    if (!newUsers.some((u) => u._id === user._id)) {
                        newUsers.push(user);
                    }
                } else {
                    if (!newSpecifyLinks.some((u) => u.id === user._id && u.link === link)) {
                        newSpecifyLinks.push({ id: user._id, link });
                    }
                }
            });

            if (errors.length > 0) {
                setMessage({ type: 'error', text: errors });
                return;
            }

            if (mode === 'id-only') {
                setAllowUser((prev) => {
                    const existingMap = new Map(prev.map((u) => [u.email.toLowerCase() + '|' + u.phone, u]));
                    const updatedUsers: User[] = [...prev];

                    newUsers.forEach((user) => {
                        const key = user.email.toLowerCase() + '|' + user.phone;
                        if (existingMap.has(key)) {
                            const index = updatedUsers.findIndex((u) => u.email.toLowerCase() + '|' + u.phone === key);
                            updatedUsers[index] = user;
                            updated++;
                        } else {
                            updatedUsers.push(user);
                            added++;
                        }
                    });

                    return updatedUsers;
                });
                setMessage({
                    type: 'success',
                    text: [`Processed ${newUsers.length} users for Allow Users (${added} added, ${updated} updated).`],
                });
            } else {
                setSpecifyLink((prev) => {
                    const existingMap = new Map(prev.map((u) => [u.id, u]));
                    const updatedLinks: SpecifyLinkUser[] = [...prev];

                    newSpecifyLinks.forEach((item) => {
                        const user = userMap.get(item.id);
                        if (!user) return;
                        if (existingMap.has(item.id)) {
                            const index = updatedLinks.findIndex((u) => u.id === item.id);
                            updatedLinks[index] = item;
                            updated++;
                        } else {
                            updatedLinks.push(item);
                            added++;
                        }
                    });

                    return updatedLinks;
                });
                setMessage({
                    type: 'success',
                    text: [`Processed ${newSpecifyLinks.length} user-link pairs for Specify Link (${added} added, ${updated} updated).`],
                });
            }
        } catch (err) {
            console.error('Excel processing error:', err);
            setMessage({ type: 'error', text: ['Failed to process Excel file.'] });
        }
    };
    reader.readAsArrayBuffer(file);
};

// Styled Components
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

const cardStyles = {
    maxWidth: '800px',
    mx: 'auto',
    mt: 5,
    p: 4,
    borderRadius: 2,
    bgcolor: 'white',
    boxShadow: 3,
};

const inputStyles = {
    bgcolor: 'white',
    '& .MuiOutlinedInput-root': { borderRadius: 1 },
};

// User List Component
interface UserListProps {
    users: User[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

const UserList: React.FC<UserListProps> = React.memo(({ users, onRemove, onClear }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="500">
                Allow Users  ({users.length})
            </Typography>
            {users.length > 0 && (
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ClearAllIcon />}
                    onClick={onClear}
                    sx={{ borderRadius: 1 }}
                >
                    Clear All
                </Button>
            )}
        </Box>
        {users.length === 0 && <Typography color="text.secondary">No users added.</Typography>}
        {users.map((user) => (
            <Box
                key={user._id}
                // sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.50', p: 1, borderRadius: 1, mb: 1 }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start', // Ensure items are aligned to the left
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                }}

            >
                <Chip
                    avatar={<Avatar><PersonIcon /></Avatar>}
                    label={`${user.email} (${user.phone})`}
                    variant="outlined"
                    sx={{ flex: 1, display: "flex", justifyContent: "start" }}
                />
                <IconButton onClick={() => onRemove(user._id)} color="error" size="small">
                    <DeleteIcon />
                </IconButton>
            </Box>
        ))}
    </Paper>
));

// Specify Link List Component
interface SpecifyLinkListProps {
    items: SpecifyLinkUser[];
    allUsers: User[];
    userMap: Map<string, User>;
    onRemove: (id: string, link: string) => void;
    onUpdateLink: (index: number, link: string) => void;
    onClear: () => void;
}

const SpecifyLinkList: React.FC<SpecifyLinkListProps> = React.memo(
    ({ items, userMap, onRemove, onUpdateLink, onClear }) => (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="500">
                    Specify Link  ({items.length})
                </Typography>
                {items.length > 0 && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearAllIcon />}
                        onClick={onClear}
                        sx={{ borderRadius: 1 }}
                    >
                        Clear All
                    </Button>
                )}
            </Box>
            {items.length === 0 && <Typography color="text.secondary">No user-link pairs added.</Typography>}
            {items.map((item, idx) => {
                const user = userMap.get(item.id);
                return (
                    <Box
                        key={`${item.id}-${item.link}-${idx}`}
                        sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.50', p: 1, borderRadius: 1, mb: 1 }}
                    >
                        <Chip
                            avatar={<Avatar><PersonIcon /></Avatar>}
                            label={user ? `${user.email} (${user.phone})` : 'Unknown User'}
                            variant="outlined"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            value={item.link}
                            onChange={(e) => onUpdateLink(idx, e.target.value)}
                            size="small"
                            placeholder="User-specific Link"
                            sx={{ flex: 2, mx: 1, bgcolor: 'white' }}
                        />
                        <IconButton onClick={() => onRemove(item.id, item.link)} color="error" size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                );
            })}
        </Paper>
    )
);

// Main Component
const EditDashboard: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const [name, setName] = useState('');
    const [commonLink, setCommonLink] = useState('');
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [previewImg, setPreviewImg] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userLink, setUserLink] = useState('');
    const [mode, setMode] = useState<'id-only' | 'id-with-link'>('id-only');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allowUser, setAllowUser] = useState<User[]>([]);
    const [specifyLink, setSpecifyLink] = useState<SpecifyLinkUser[]>([]);
    const [message, setMessage] = useState<Message | null>(null);
    const [clearAllowUserDialog, setClearAllowUserDialog] = useState(false);
    const [clearSpecifyLinkDialog, setClearSpecifyLinkDialog] = useState(false);
    const navigate = useNavigate();

    // Memoize user lookup map
    const userMap = useMemo(() => {
        const map = new Map<string, User>();
        allUsers.forEach((user) => {
            map.set(user._id, user);
            map.set(user.email.toLowerCase() + '|' + user.phone, user);
        });
        return map;
    }, [allUsers]);

    useEffect(() => {
        if (!dashboardId) {
            setMessage({ type: 'error', text: ['Invalid dashboard ID.'] });
            return;
        }

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const res = await axios.get<ApiResponse<DashboardData>>(`${my_dashboard_api_allDetails}/${dashboardId}`);
                const data = res.data.data;

                setName(data.name || '');
                setCommonLink(data.commonlink || '');
                setPreviewImg(data.img || null);

                setAllowUser(
                    Array.isArray(data.allowUser)
                        ? data.allowUser.filter((u) => u._id && u.email && u.phone)
                        : []
                );

                setSpecifyLink(
                    Array.isArray(data.specifyLink)
                        ? data.specifyLink
                            .filter((item: SpecifyLinkFromAPI) => {
                                if (typeof item.id === 'string') return !!item.id;
                                return !!item.id._id && !!item.id.email && !!item.id.phone;
                            })
                            .map((item: SpecifyLinkFromAPI) => ({
                                id: typeof item.id === 'string' ? item.id : item.id._id,
                                link: typeof item.link === 'string' ? item.link : '',
                            }))
                        : []
                );

                setMode(data.specifyLink?.length > 0 ? 'id-with-link' : 'id-only');
            } catch (err) {
                console.error('Error loading dashboard:', err);
                setMessage({ type: 'error', text: ['Failed to load dashboard data.'] });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [dashboardId]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get<ApiResponse<User[]>>(displayAllUSer_email_phone);
                setAllUsers(
                    Array.isArray(res.data.data)
                        ? res.data.data.filter((u) => u._id && u.email && u.phone)
                        : []
                );
            } catch (err) {
                console.error('Error fetching users:', err);
                setMessage({ type: 'error', text: ['Failed to fetch users.'] });
            }
        };

        fetchUsers();
    }, []);

    const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImgFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImg(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewImg(null);
        }
    };

    const handleExcelChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setMessage({ type: 'error', text: ['No file selected.'] });
            return;
        }

        processExcelFile(file, allUsers, userMap, mode, setAllowUser, setSpecifyLink, setMessage);
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleAddUser = () => {
        if (!selectedUserId) {
            setMessage({ type: 'error', text: ['Please select a user.'] });
            return;
        }

        const selectedUser = userMap.get(selectedUserId);
        if (!selectedUser || !selectedUser.email || !selectedUser.phone) {
            setMessage({ type: 'error', text: ['Selected user has invalid data.'] });
            return;
        }

        if (mode === 'id-with-link') {
            if (!commonLink.trim()) {
                setMessage({ type: 'error', text: ['Common Link is required when adding users with specific links.'] });
                return;
            }
            const key = selectedUser.email.toLowerCase() + '|' + selectedUser.phone;
            const existingIndex = specifyLink.findIndex((u) => userMap.get(u.id)?.email.toLowerCase() + '|' + userMap.get(u.id)?.phone === key);
            if (existingIndex !== -1) {
                setSpecifyLink((prev) =>
                    prev.map((u, i) => (i === existingIndex ? { id: selectedUserId, link: userLink.trim() || '' } : u))
                );
                setMessage({ type: 'success', text: ['Updated user link in Specify Link.'] });
            } else {
                setSpecifyLink((prev) => [...prev, { id: selectedUserId, link: userLink.trim() || '' }]);
                setMessage({ type: 'success', text: ['Added user to Specify Link.'] });
            }
        } else {
            const key = selectedUser.email.toLowerCase() + '|' + selectedUser.phone;
            const existingIndex = allowUser.findIndex((u) => u.email.toLowerCase() + '|' + u.phone === key);
            if (existingIndex !== -1) {
                setAllowUser((prev) => prev.map((u, i) => (i === existingIndex ? selectedUser : u)));
                setMessage({ type: 'success', text: ['Updated user in Allow Users.'] });
            } else {
                setAllowUser((prev) => [...prev, selectedUser]);
                setMessage({ type: 'success', text: ['Added user to Allow Users.'] });
            }
        }

        setSelectedUserId('');
        setUserLink('');
    };

    const handleRemoveAllowUser = (id: string) => {
        setAllowUser((prev) => prev.filter((u) => u._id !== id));
    };

    const handleRemoveSpecifyLink = (id: string, link: string) => {
        setSpecifyLink((prev) => prev.filter((u) => !(u.id === id && u.link === link)));
    };

    const handleUpdateSpecifyLink = (index: number, link: string) => {
        setSpecifyLink((prev) => prev.map((u, i) => (i === index ? { ...u, link } : u)));
    };

    const handleClearAllowUser = () => {
        setAllowUser([]);
        setMessage({ type: 'success', text: ['All Allow Users cleared.'] });
        setClearAllowUserDialog(false);
    };

    const handleClearSpecifyLink = () => {
        setSpecifyLink([]);
        setMessage({ type: 'success', text: ['All Specify Link users cleared.'] });
        setClearSpecifyLinkDialog(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dashboardId) {
            setMessage({ type: 'error', text: ['Invalid dashboard ID.'] });
            return;
        }

        if (!name.trim()) {
            setMessage({ type: 'error', text: ['Name is required.'] });
            return;
        }

        if (specifyLink.length > 0 && !commonLink.trim()) {
            setMessage({ type: 'error', text: ['Common Link is required when users with specific links are added.'] });
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('commonlink', commonLink);
        formData.append('allowUser', JSON.stringify(allowUser.map((u) => u._id)));
        formData.append('specifyLink', JSON.stringify(specifyLink));
        if (imgFile) formData.append('img', imgFile);

        try {
            setSubmitting(true);
            await axios.patch(`${my_dashboard_api}/${dashboardId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage({ type: 'success', text: ['Dashboard updated successfully!'] });
            toast.success('Edited successfully!');

            setTimeout(() => {
                navigate('/my_dashboard');
            }, 2000)
        } catch (err) {
            console.error('Error updating dashboard:', err);
            setMessage({ type: 'error', text: ['Failed to update dashboard.'] });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading dashboard data...</Typography>
            </Box>
        );
    }

    return (
        <>
            <ToastContainer />
            <Card sx={cardStyles}>
                <Typography variant="h5" fontWeight="600" color="text.primary" mb={2} textAlign="center">
                    Edit Dashboard Card
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Name Section */}
                        <Box>
                            <Typography variant="h6" fontWeight="500" mb={1}>
                                Dashboard Name
                            </Typography>
                            <TextField
                                fullWidth
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                variant="outlined"
                                sx={inputStyles}
                            />
                        </Box>

                        {/* Image Section */}
                        <Box>
                            <Typography variant="h6" fontWeight="500" mb={1}>
                                Image (Optional)
                            </Typography>
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 1 }}>
                                Upload Image
                                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImgChange} />
                            </Button>
                            {previewImg && (
                                <Box mt={2}>
                                    <img
                                        src={previewImg}
                                        alt="Preview"
                                        style={{ width: 192, height: 'auto', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* User Assignment Section */}
                        <Box>
                            <Typography variant="h6" fontWeight="500" mb={1}>
                                User Assignment
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Selection Mode"
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as 'id-only' | 'id-with-link')}
                                    variant="outlined"
                                    sx={inputStyles}
                                >
                                    <MenuItem value="id-only">Nested Card</MenuItem>
                                    <MenuItem value="id-with-link">Common Link & Specific User Link</MenuItem>
                                </TextField>
                                {mode === 'id-with-link' && (
                                    <TextField
                                        fullWidth
                                        label="Common Link"
                                        value={commonLink}
                                        onChange={(e) => setCommonLink(e.target.value)}
                                        variant="outlined"
                                        required={specifyLink.length > 0}
                                        sx={inputStyles}
                                    />
                                )}
                                <Autocomplete
                                    options={allUsers}
                                    getOptionLabel={(user) => `${user.email} (${user.phone})`}
                                    value={allUsers.find((user) => user._id === selectedUserId) || null}
                                    onChange={(event, newValue) => {
                                        setSelectedUserId(newValue ? newValue._id : '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search User by Email or Phone"
                                            variant="outlined"
                                            sx={inputStyles}
                                            aria-label="Search user"
                                        />
                                    )}
                                    filterOptions={(options, { inputValue }) => {
                                        const input = inputValue.toLowerCase();
                                        return options.filter(
                                            (user) =>
                                                user.email.toLowerCase().includes(input) ||
                                                user.phone.toLowerCase().includes(input)
                                        );
                                    }}
                                    renderOption={(props, user) => (
                                        <li {...props} key={user._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                                                    <PersonIcon sx={{ fontSize: 16 }} />
                                                </Avatar>
                                                {`${user.email} (${user.phone})`}
                                            </Box>
                                        </li>
                                    )}
                                />
                                {mode === 'id-with-link' && (
                                    <TextField
                                        fullWidth
                                        label="User-specific Link (Optional)"
                                        value={userLink}
                                        onChange={(e) => setUserLink(e.target.value)}
                                        variant="outlined"
                                        sx={inputStyles}
                                    />
                                )}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddUser}
                                    disabled={!selectedUserId}
                                    sx={{ borderRadius: 1 }}
                                >
                                    Add User
                                </Button>
                                <Box>
                                    <Typography variant="subtitle1" mb={1}>
                                        Bulk Upload from Excel (Columns: Email - required; Link - {mode === 'id-with-link' ? 'required' : 'optional'})
                                    </Typography>
                                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 1 }}>
                                        Upload Excel
                                        <VisuallyHiddenInput type="file" accept=".xlsx,.xls" onChange={handleExcelChange} />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        You can upload multiple Excel files. Existing users with matching email and phone will be updated.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Allow Users Section */}
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" fontWeight="500">
                                    Allow Users ({allowUser.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <UserList
                                    users={allowUser}
                                    onRemove={handleRemoveAllowUser}
                                    onClear={() => setClearAllowUserDialog(true)}
                                />
                            </AccordionDetails>
                        </Accordion>

                        {/* Specify Link Section */}
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" fontWeight="500">
                                    Specify Link ({specifyLink.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SpecifyLinkList
                                    items={specifyLink}
                                    allUsers={allUsers}
                                    userMap={userMap}
                                    onRemove={handleRemoveSpecifyLink}
                                    onUpdateLink={handleUpdateSpecifyLink}
                                    onClear={() => setClearSpecifyLinkDialog(true)}
                                />
                            </AccordionDetails>
                        </Accordion>

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            {/* <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                            // startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{ borderRadius: 1, px: 3, py: 1, fontWeight: '600' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button> */}

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full p-4 text-white rounded-lg font-semibold transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#27ae60] to-[#27ae93] hover:shadow-lg hover:-translate-y-0.5'}`}
                                aria-label="Create card"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </Box>

                        {/* Alert */}
                        {message && (
                            <Alert severity={message.type} sx={{ mt: 3, borderRadius: 1 }} onClose={() => setMessage(null)}>
                                {message.text.map((msg, idx) => (
                                    <Typography key={idx} variant="body2">
                                        {msg}
                                    </Typography>
                                ))}
                            </Alert>
                        )}
                    </Box>
                </form>

                {/* Clear Allow User Dialog */}
                <Dialog open={clearAllowUserDialog} onClose={() => setClearAllowUserDialog(false)}>
                    <DialogTitle>Clear Allow Users</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to clear all Allow Users? This action cannot be undone.</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setClearAllowUserDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleClearAllowUser} color="error" autoFocus>
                            Clear
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Clear Specify Link Dialog */}
                <Dialog open={clearSpecifyLinkDialog} onClose={() => setClearSpecifyLinkDialog(false)}>
                    <DialogTitle>Clear Specify Link Users</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to clear all Specify Link users? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setClearSpecifyLinkDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleClearSpecifyLink} color="error" autoFocus>
                            Clear
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>
        </>
    );
};

export default EditDashboard;