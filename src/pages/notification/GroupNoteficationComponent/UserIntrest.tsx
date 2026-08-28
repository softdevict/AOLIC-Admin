import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Alert,
    Snackbar,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios, { AxiosError } from 'axios';
import { profile_userIntrest } from '../../../api/config';

interface Interest {
    _id: string; // Updated to match API response (MongoDB _id)
    name: string;
}

interface UserInterestProps {
    onInterestsUpdated?: () => void; // Callback to refresh interests in parent (e.g., DisplayGroups)
}

const UserInterest: React.FC<UserInterestProps> = ({ onInterestsUpdated }) => {
    const [interests, setInterests] = useState<Interest[]>([]);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null); // For delete confirmation dialog
    const [currentInterest, setCurrentInterest] = useState<Interest | null>(null);
    const [interestName, setInterestName] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({}); // Track loading per action
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch interests from API
    const fetchInterests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get<Interest[]>(profile_userIntrest);
            console.log('Fetched interests:', response.data);
            // Validate response data
            const validatedInterests = response.data.filter(
                (item): item is Interest => typeof item._id === 'string' && typeof item.name === 'string'
            );
            if (validatedInterests.length !== response.data.length) {
                console.warn('Some interests have invalid format:', response.data);
            }
            setInterests(validatedInterests);
        } catch (err) {
            const errorMessage = err instanceof AxiosError
                ? `Failed to fetch interests (Status ${err.response?.status}): ${err.response?.data?.message || err.message}`
                : 'Failed to fetch interests. Please try again.';
            setError(errorMessage);
            console.error('Fetch error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterests();
    }, [fetchInterests]);

    const handleOpen = (interest?: Interest) => {
        if (interest) {
            if (!interest._id) {
                setError('Invalid interest ID.');
                console.error('Invalid interest _id in handleOpen:', interest);
                return;
            }
            console.log('Opening edit for interest:', interest);
            setCurrentInterest(interest);
            setInterestName(interest.name);
        } else {
            console.log('Opening add new interest form');
            setCurrentInterest(null);
            setInterestName('');
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setInterestName('');
        setCurrentInterest(null);
        setError(null);
    };

    const handleSave = async () => {
        if (!interestName.trim()) {
            setError('Interest name cannot be empty.');
            return;
        }
        if (interests.some(i => i.name.toLowerCase() === interestName.toLowerCase() && i._id !== currentInterest?._id)) {
            setError('Interest name already exists.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            if (currentInterest) {
                // Update existing interest
                if (!currentInterest._id) {
                    throw new Error('Invalid interest ID for update.');
                }
                console.log('Updating interest:', { _id: currentInterest._id, name: interestName });
                await axios.patch(`${profile_userIntrest}/${currentInterest._id}`, { name: interestName });
                setInterests(prev =>
                    prev.map(item =>
                        item._id === currentInterest._id ? { ...item, name: interestName } : item
                    )
                );
                setSuccess(`Interest "${interestName}" updated successfully.`);
            } else {
                // Add new interest
                console.log('Adding new interest:', { name: interestName });
                const response = await axios.post<Interest>(profile_userIntrest, { name: interestName });
                if (!response.data._id || !response.data.name) {
                    throw new Error('Invalid response format from POST request.');
                }
                setInterests(prev => [...prev, response.data]);
                setSuccess(`Interest "${interestName}" added successfully.`);
            }
            onInterestsUpdated?.();
            handleClose();
        } catch (err) {
            const errorMessage = err instanceof AxiosError
                ? `Failed to ${currentInterest ? 'update' : 'add'} interest (Status ${err.response?.status}): ${err.response?.data?.message || err.message}`
                : `Failed to ${currentInterest ? 'update' : 'add'} interest: ${err instanceof Error ? err.message : 'Unknown error'}.`;
            setError(errorMessage);
            console.error('Error in handleSave:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDelete = (id: string) => {
        if (!id) {
            setError('Invalid interest ID.');
            console.error('Invalid interest _id in handleOpenDelete:', id);
            return;
        }
        setDeleteId(id);
    };

    const handleCloseDelete = () => {
        setDeleteId(null);
        setError(null);
    };

    const handleDelete = async (id: string) => {
        if (!id) {
            setError('Invalid interest ID.');
            console.error('Invalid interest _id in handleDelete:', id);
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, [id]: true }));
            setError(null);
            const interest = interests.find(i => i._id === id);
            console.log('Deleting interest:', { _id: id, name: interest?.name });
            await axios.delete(`${profile_userIntrest}/${id}`);
            setInterests(prev => prev.filter(item => item._id !== id));
            setSuccess(`Interest "${interest?.name}" deleted successfully.`);
            onInterestsUpdated?.();
            handleCloseDelete();
        } catch (err) {
            const errorMessage = err instanceof AxiosError
                ? `Failed to delete interest with ID ${id} (Status ${err.response?.status}): ${err.response?.data?.message || err.message}`
                : `Failed to delete interest with ID ${id}. Please try again.`;
            setError(errorMessage);
            console.error('Error in handleDelete:', errorMessage);
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
                User Interests
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading interests...</Typography>
                </Box>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={4000}
                    onClose={() => setSuccess(null)}
                >
                    <Alert severity="success" onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                </Snackbar>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                aria-label="Add new interest"
                disabled={loading}
            >
                Add Interest
            </Button>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table aria-label="User interests table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {interests.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography color="text.secondary">No interests available.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            interests.map((interest) => (
                                <TableRow key={interest._id}>
                                    <TableCell>{interest._id}</TableCell>
                                    <TableCell>{interest.name}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(interest)}
                                            aria-label={`Edit interest ${interest.name}`}
                                            disabled={loading || actionLoading[interest._id]}
                                        >
                                            {actionLoading[interest._id] ? <CircularProgress size={20} /> : <EditIcon />}
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDelete(interest._id)}
                                            aria-label={`Delete interest ${interest.name}`}
                                            disabled={loading || actionLoading[interest._id]}
                                        >
                                            {actionLoading[interest._id] ? <CircularProgress size={20} /> : <DeleteIcon />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="interest-dialog-title"
            >
                <DialogTitle id="interest-dialog-title">
                    {currentInterest ? 'Edit Interest' : 'Add Interest'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Interest Name"
                        type="text"
                        fullWidth
                        value={interestName}
                        onChange={(e) => setInterestName(e.target.value)}
                        error={!interestName.trim()}
                        helperText={!interestName.trim() ? 'Name is required.' : ''}
                        disabled={loading}
                        inputProps={{ 'aria-label': 'Interest name input' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading || !interestName.trim()}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {currentInterest ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!deleteId}
                onClose={handleCloseDelete}
                fullWidth
                maxWidth="sm"
                aria-labelledby="delete-interest-dialog-title"
            >
                <DialogTitle id="delete-interest-dialog-title">Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the interest "{interests.find(i => i._id === deleteId)?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} disabled={loading || actionLoading[deleteId || '']}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDelete(deleteId!)}
                        color="error"
                        variant="contained"
                        disabled={loading || actionLoading[deleteId || '']}
                        startIcon={actionLoading[deleteId || ''] ? <CircularProgress size={20} /> : null}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserInterest;