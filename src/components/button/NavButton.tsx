// GradientNavButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface GradientNavButtonProps extends ButtonProps {
  to: string;
  state?: any;
}

const NavButton: React.FC<GradientNavButtonProps> = ({ to, state, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to, { state });
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      sx={{
        background: 'linear-gradient(to right, #56ccf2, #2f80ed)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
        color: 'white',
        textTransform: 'none',
        fontWeight: 600,
        paddingX: 3,
        paddingY: 1,
        borderRadius: '8px',
        '&:hover': {
          background: 'linear-gradient(to right, #4ec3ec, #2979e0)',
          boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.3)',
        },
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};

export default NavButton;
