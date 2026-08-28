import { Button, Card } from '@mui/material';
import axios from 'axios';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { delete_card } from '../api/config';

function Update() {
    const navigate = useNavigate();
    const params = useParams();
       console.log(params,"params");
       const id = params.id;
    const location = useLocation();
//    console.log(location.state.name);
   const content =  location.state.name;

    const handleUpdateClick = () => {
        navigate('/update-details'); // Navigate to the update details page
    };

    const handleDeleteClick = () => {
        axios.delete(`${delete_card}/`)
        // navigate('/');
    };

    return (
        <div
            style={{
                display: 'flex',
              
                padding: '2rem',
            }}
        >
            <Card
                style={{
                    maxWidth: '650px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center', // Fixed typo here
                    gap: '2rem',
                    padding: '3rem',
                    flexDirection: 'column',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Added shadow for better visual appeal
                }}
            >
                <p
                    style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    {content}
                </p>
                <div>
                    <Button
                        style={{
                            backgroundColor: 'blue',
                            color: 'white',
                            marginRight: '2rem',
                            padding: '10px 20px', // Added padding for better button size
                        }}
                        onClick={handleUpdateClick} // Corrected onClick usage
                        aria-label="Update Founder Details" // Accessibility improvement
                    >
                        Update
                    </Button>
                    <Button
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            padding: '10px 20px', // Added padding for better button size
                        }}
                        onClick={handleDeleteClick} // Corrected onClick usage
                        aria-label="Delete Founder" // Accessibility improvement
                    >
                        Delete
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default Update;