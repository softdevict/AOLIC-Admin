import React, { useState, ChangeEvent, FormEvent } from "react";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sub_admin } from "../../api/config";
import axios from "axios";

interface SubAdminForm {
    name: string;
    email: string;
    password: string;
}

const AdminAdd: React.FC = () => {
    const [form, setForm] = useState<SubAdminForm>({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // update input fields
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // submit handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(sub_admin, form);

            toast.success("Sub Admin Created Successfully!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
            console.log("Response:", res.data);

            // reset form
            setForm({ name: "", email: "", password: "" });
            navigate("/subadmin");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        }

        setLoading(false);
    };

    return (
        <Container maxWidth="sm">
            <ToastContainer />
            <Paper elevation={4} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Add Sub Admin
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Create Sub Admin"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminAdd;