import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
    Box,
} from '@mui/material';

interface User {
    id: string; // Matches API _id
    email: string;
    phone: string;
}

interface Group {
    _id: string;
    name: string;
    type: 'regular' | 'city' | 'interest';
    cities?: string[];
    interests?: Array<{ _id: string; name: string }>;
    userCount?: number;
    users?: Array<{ _id: string; email: string; phone: string }>;
}

interface Props {
    open: boolean;
    handleClose: () => void;
    group: Group | null;
}

const ViewAllUser: React.FC<Props> = ({ open, handleClose, group }) => {
    const users: User[] = group?.users?.map(user => ({
        id: user._id,
        email: user.email,
        phone: user.phone,
    })) || [];

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Users in {group?.name || 'Group'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                        <strong>Group ID:</strong> {group?._id || 'N/A'}
                    </Typography>
                    <Typography variant="subtitle1">
                        <strong>Type:</strong> {group?.type || 'N/A'}
                    </Typography>
                    <Typography variant="subtitle1">
                        <strong>Members:</strong> {group?.userCount || 0}
                    </Typography>
                    {group?.type === 'city' && (
                        <Typography variant="subtitle1">
                            <strong>Cities:</strong> {group?.cities?.join(', ') || 'None'}
                        </Typography>
                    )}
                    {group?.type === 'interest' && (
                        <Typography variant="subtitle1">
                            <strong>Interests:</strong> {group?.interests?.map(i => i.name).join(', ') || 'None'}
                        </Typography>
                    )}
                </Box>

                {users.length === 0 ? (
                    <Typography>No users found for this group.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>User ID</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Phone Number</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAllUser;