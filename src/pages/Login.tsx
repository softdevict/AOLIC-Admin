import { Card, TextField, useMediaQuery, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { loginSuccess } from '../store/authSlice';
import { login_admin } from '../api/config';
import Button from '../components/button/Button';
import logo from '../../public/assets/logo/AOL LOGO BANGALORE ASHRAM BLACK.png';
import { toast, ToastContainer } from 'react-toastify';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ mode: 'onBlur' });



  const handleLogin = async (data: LoginForm) => {
    try {
      setLoading(true);
      const { data: response } = await axios.post(login_admin, data);

      // Save values in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("adminId", response.admin.id);
      localStorage.setItem("adminName", response.admin.name);
      localStorage.setItem("adminType", response.admin.type);  // ⭐ SAVE TYPE

      dispatch(loginSuccess(response.token));

      const redirectPath = sessionStorage.getItem("lastPath") || "/";
      sessionStorage.removeItem("lastPath");

      toast.success("Login Successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);

    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  }, [navigate]);

  return (
    <>
      <ToastContainer />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          zIndex: 100,
          left: 0,
          top: 0,
          padding: 2,
        }}
      >
        <Card
          sx={{
            width: isMobile ? '100%' : 620,
            padding: isMobile ? 4 : 6,
            boxSizing: 'border-box',
            margin: '1rem',
          }}
        >
          <img
            src={logo}
            alt="AOL Logo"
            style={{
              margin: '0 auto',
              width: isMobile ? '60%' : '40%',
              display: 'block',
            }}
          />

          <h1
            style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              margin: '2rem 0',
              textAlign: 'center',
            }}
          >
            Login
          </h1>

          <form
            onSubmit={handleSubmit(handleLogin)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button text="Submit" loading={loading} />
          </form>
        </Card>
      </Box>
    </>
  );
};

export default Login;
