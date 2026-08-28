import React, { memo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    CircularProgress,
    TextField,
    Box,
    Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';

// Define the Group interface for type safety
interface Group {
    id: string;
    groupName: string;
    members: number;
    type: 'regular' | 'city' | 'interest';
    cities?: string[];
    interests?: string[];
    users?: Array<{
        _id: string;
        name: string;
        phone: string;
        cities?: string[];
        interests?: string[];
    }>;
}

// Define Props interface with action handlers and optional title
interface NotificationRegularTableProps {
    groups: Group[];
    tableTitle?: string;
    onView?: (group: Group) => void;
    onEdit?: (group: Group) => void;
    onSendNotification?: (group: Group) => void;
    onDelete?: (group: Group) => void;
    notificationLoading?: string | null;
}

const NotificationRegularTable: React.FC<NotificationRegularTableProps> = ({
    groups,
    tableTitle = 'Regular Groups',
    onView,
    onEdit,
    onSendNotification,
    onDelete,
    notificationLoading,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter groups based on search query
    const filteredGroups = groups.filter((group) => {
        const query = searchQuery.toLowerCase();
        const groupName = group.groupName?.toLowerCase() || '';
        const cities = group.cities?.map(city => city.toLowerCase())?.join(' ') || '';
        const interests = group.interests?.map(interest => interest.toLowerCase())?.join(' ') || '';
        return (
            groupName.includes(query) ||
            cities.includes(query) ||
            interests.includes(query)
        );
    });

    return (
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography
                    variant="h6"
                    component="div"
                    id="regular-groups-table-title"
                >
                    {tableTitle}
                </Typography>
                <TextField
                    label="Search Groups"
                    variant="filled"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    sx={{ mt: 1, bgcolor: 'white', borderRadius: 1 }}
                    aria-label="Search groups by name, cities, or interests"
                    placeholder="Enter group name, city, or interest"
                />
            </Box>
            <Table aria-labelledby="regular-groups-table-title">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Group Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Cities/Interests</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredGroups.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography color="text.secondary">
                                    {searchQuery ? 'No matching groups found' : 'No groups available'}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredGroups.map((group) => (
                            <TableRow key={group.id} hover>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {group.groupName || 'Unnamed Group'}
                                </TableCell>
                                <TableCell>{group.members ?? 0}</TableCell>
                                <TableCell>
                                    {group.type
                                        ? group.type.charAt(0).toUpperCase() + group.type.slice(1)
                                        : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    {group.cities?.length
                                        ? group.cities.join(', ')
                                        : group.interests?.length
                                            ? group.interests.join(', ')
                                            : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="View group details">
                                        <IconButton
                                            aria-label={`View details for group ${group.groupName}`}
                                            color="primary"
                                            onClick={() => onView?.(group)}
                                            disabled={!onView}
                                            size="small"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit group">
                                        <IconButton
                                            aria-label={`Edit group ${group.groupName}`}
                                            color="success"
                                            onClick={() => onEdit?.(group)}
                                            disabled={!onEdit}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Send notification">
                                        <IconButton
                                            aria-label={`Send notification to group ${group.groupName}`}
                                            color="warning"
                                            onClick={() => onSendNotification?.(group)}
                                            disabled={!onSendNotification || notificationLoading === group.id}
                                            size="small"
                                        >
                                            {notificationLoading === group.id ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <NotificationsIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete group">
                                        <IconButton
                                            aria-label={`Delete group ${group.groupName}`}
                                            color="error"
                                            onClick={() => onDelete?.(group)}
                                            disabled={!onDelete}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default memo(NotificationRegularTable);