import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Typography,
    Alert,
    Autocomplete,
    Chip,
} from '@mui/material';
import axios, { AxiosError } from 'axios';

// Define the User interface for type safety
interface User {
    _id: string;
    name: string;
    phone: string;
    cities?: string[];
    interests?: string[];
}

// Props interface for EditUser component
interface EditUserProps {
    open: boolean;
    user: User | null;
    groupType: 'regular' | 'city' | 'interest'; // Added to control field behavior
    onClose: () => void;
    onUserUpdated: () => void;
    availableCities?: string[];
    availableInterests?: string[];
    apiEndpoint?: string;
}

const EditUser: React.FC<EditUserProps> = ({
    open,
    user,
    groupType,
    onClose,
    onUserUpdated,
    availableCities = [],
    availableInterests = [],
    apiEndpoint = '/api/users', // Replace with actual endpoint
}) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        cities: user?.cities || [],
        interests: user?.interests || [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Phone number validation regex (example: allows +1234567890 or 123-456-7890)
    const phoneRegex = /^\+?\d{1,4}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;

    // Update form data when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                cities: user.cities || [],
                interests: user.interests || [],
            });
            setError(null);
        }
    }, [user]);

    const handleChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleCitiesChange = (_event: any, newValue: string[]) => {
        setFormData(prev => ({ ...prev, cities: newValue }));
    };

    const handleInterestsChange = (_event: any, newValue: string[]) => {
        setFormData(prev => ({ ...prev, interests: newValue }));
    };

    const handleSubmit = async () => {
        if (!user?._id) {
            setError('No user selected.');
            return;
        }
        if (groupType === 'regular') {
            if (!formData.name.trim()) {
                setError('Name is required.');
                return;
            }
            if (!formData.phone.trim()) {
                setError('Phone is required.');
                return;
            }
            if (!phoneRegex.test(formData.phone)) {
                setError('Invalid phone number format.');
                return;
            }
        }
        if (groupType === 'city' && !formData.cities.length) {
            setError('At least one city is required.');
            return;
        }
        if (groupType === 'interest' && !formData.interests.length) {
            setError('At least one interest is required.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Send only relevant fields based on groupType
            const payload = {
                ...(groupType === 'regular' && {
                    name: formData.name,
                    phone: formData.phone,
                    cities: formData.cities,
                    interests: formData.interests,
                }),
                ...(groupType === 'city' && { cities: formData.cities }),
                ...(groupType === 'interest' && { interests: formData.interests }),
            };
            await axios.put(`${apiEndpoint}/${user._id}`, payload);

            onUserUpdated();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof AxiosError
                ? `Failed to update user: ${err.response?.data?.message || err.message}`
                : 'Failed to update user. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isRegularGroup = groupType === 'regular';
    const isCityGroup = groupType === 'city';
    const isInterestGroup = groupType === 'interest';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="edit-user-dialog-title"
        >
            <DialogTitle id="edit-user-dialog-title">Edit User - {groupType.charAt(0).toUpperCase() + groupType.slice(1)} Group</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {!user ? (
                    <Typography color="error">No user selected.</Typography>
                ) : (
                    <>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            fullWidth
                            margin="normal"
                            error={isRegularGroup && !formData.name.trim()}
                            helperText={
                                isRegularGroup
                                    ? !formData.name.trim()
                                        ? 'Name is required'
                                        : ''
                                    : 'Name cannot be edited for this group type'
                            }
                            disabled={loading || !isRegularGroup}
                        />
                        <TextField
                            label="Phone"
                            value={formData.phone}
                            onChange={handleChange('phone')}
                            fullWidth
                            margin="normal"
                            error={isRegularGroup && (!formData.phone.trim() || !phoneRegex.test(formData.phone))}
                            helperText={
                                isRegularGroup
                                    ? !formData.phone.trim()
                                        ? 'Phone is required'
                                        : !phoneRegex.test(formData.phone)
                                            ? 'Invalid phone number format'
                                            : ''
                                    : 'Phone cannot be edited for this group type'
                            }
                            disabled={loading || !isRegularGroup}
                        />
                        <Autocomplete
                            multiple
                            options={availableCities}
                            value={formData.cities}
                            onChange={handleCitiesChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Cities"
                                    margin="normal"
                                    helperText={
                                        availableCities.length
                                            ? isCityGroup || isRegularGroup
                                                ? 'Select cities associated with the user'
                                                : 'Cities cannot be edited for this group type'
                                            : 'No cities available'
                                    }
                                    error={isCityGroup && !formData.cities.length}
                                    disabled={loading || (!isCityGroup && !isRegularGroup) || !availableCities.length}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} {...getTagProps({ index })} />
                                ))
                            }
                            disabled={loading || (!isCityGroup && !isRegularGroup) || !availableCities.length}
                        />
                        <Autocomplete
                            multiple
                            options={availableInterests}
                            value={formData.interests}
                            onChange={handleInterestsChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Interests"
                                    margin="normal"
                                    helperText={
                                        availableInterests.length
                                            ? isInterestGroup || isRegularGroup
                                                ? 'Select interests associated with the user'
                                                : 'Interests cannot be edited for this group type'
                                            : 'No interests available'
                                    }
                                    error={isInterestGroup && !formData.interests.length}
                                    disabled={loading || (!isInterestGroup && !isRegularGroup) || !availableInterests.length}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} {...getTagProps({ index })} />
                                ))
                            }
                            disabled={loading || (!isInterestGroup && !isRegularGroup) || !availableInterests.length}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={
                        loading ||
                        (isRegularGroup &&
                            (!formData.name.trim() || !formData.phone.trim() || !phoneRegex.test(formData.phone))) ||
                        (isCityGroup && !formData.cities.length) ||
                        (isInterestGroup && !formData.interests.length)
                    }
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUser;