import { Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { add_action, create_card, display_all_user_type } from '../api/config';
import { useNavigate } from 'react-router-dom';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { constants } from 'buffer';

// Defining form data interface
interface FormData {
    name: string;
    options: string[];
    usertype: string;
    actions: {
        action: string;
        link: string;
        language: string;
        usertype: string;
        actionImage?: FileList; // This is correct for input type="file"
    }[];
}

interface UserTypeItem {
    usertype: string;
}

interface CreateUserProps {
    head: { headline: string }[];
}

// Main CreateUser Component
const CreateUser: React.FC<CreateUserProps> = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
            <UserCard />
        </div>
    );
};

// UserCard Component with the entire form logic
const UserCard = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: { name: '', options: [], actions: [{ language: '', usertype: '', action: '', link: '', actionImage: undefined }] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'actions' });

    const [usertype, setusertype] = useState('');
    const [language, setLanguage] = useState('');
    const [items, setItems] = useState<UserTypeItem[]>([]); // Define items state
    // const [img ,setImg] = useState("");

    // Fetching user types using API
    useEffect(() => {
        axios
            .get(display_all_user_type)
            .then((response) => {
                console.log('Fetched User Types:', response.data);
                setItems(response.data);
            })
            .catch((err) => {
                console.error('Error fetching user types:', err);
            });
    }, []);

    // Form submit handler
    const handleFormSubmit = async (data: FormData) => {
        try {
            console.log('Submitted Data:', data);

            data.actions.map((a) => {
                a.language = language;
                a.usertype = usertype;
                // a.actionImage = ;
            });

            const formData = new FormData();
            formData.append('name', data.name);
            // formData.append("img",data.img);
            formData.append('options', JSON.stringify(data.options));
            formData.append('usertype', usertype);

            data.actions.forEach((action, index) => {
                formData.append(`actions[${index}][action]`, action.action);
                formData.append(`actions[${index}][link]`, action.link);

                // Fix file upload: Ensure the correct type is handled
                // if (action.actionImage instanceof File) {
                if (action.actionImage && action.actionImage.length > 0) {
                    formData.append(`actions[${index}][actionImage]`, action.actionImage[0]);
                }

                // console.log(action.actionImage, 'sjsijskskmlmlmmmkm');

                // }
            });

            // Ensure add_action is a valid URL
            if (!add_action || typeof add_action !== 'string') {
                throw new Error('Invalid API URL for add_action');
            }

            // Ensure create_card is a valid URL
            if (!create_card || typeof create_card !== 'string') {
                throw new Error('Invalid API URL for create_card');
            }

            // Fix add_action API call (send as object)
            console.log(data.actions, 'action');
            // console.log(usertype,"djdjjd");
            formData.forEach((e) => {
                console.log(e, 'e');
            });

            await axios.post(add_action, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/action', { state: { status: usertype } });

            // console.log("Card created successfully:", response.data);
        } catch (err) {
            console.error('Error during submission:', err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                backgroundImage: 'linear-gradient(0deg, #ECA55A , #fff)',
                marginTop: '2rem',
            }}
        >
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>User Card</h1>

            {/* Language Selection */}
            <FormControl style={{ marginBottom: '1rem', width: '30rem' }}>
                <InputLabel>Language</InputLabel>
                <Select
                    value={language}
                    onChange={(event) => {
                        setLanguage(event.target.value);
                        setValue('options.0', event.target.value);
                    }}
                >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                </Select>
            </FormControl>

            {/* User Type Selection */}
            <FormControl style={{ marginBottom: '1rem', width: '30rem' }}>
                <InputLabel>User Type</InputLabel>
                <Select
                    value={usertype}
                    onChange={(event) => {
                        setusertype(event.target.value);
                        setValue('name', event.target.value);
                    }}
                >
                    {items.map((item, index) => (
                        <MenuItem key={index} value={item.usertype}>
                            {item.usertype}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Actions Section */}
            {fields.map((field, i) => (
                <div key={field.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p>Action {i + 1}</p>
                        <Button onClick={() => remove(i)} style={{ backgroundColor: '#c7baba', color: 'white', height: '35px' }}>
                            <RemoveIcon style={{ width: '1rem' }} />
                        </Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Action Content */}
                        <input
                            style={{ border: '1px solid gray', padding: '0.8rem', borderRadius: '10px', width: '30rem' }}
                            placeholder="Action Content"
                            {...register(`actions.${i}.action`, { required: 'Action is required' })}
                        />
                        {errors.actions?.[i]?.action?.message && <p style={{ color: 'red' }}>{errors.actions[i]?.action?.message}</p>}

                        {/* Action Image */}
                        <input type="file" {...register(`actions.${i}.actionImage`)} style={{ border: '1px solid gray', padding: '0.5rem', borderRadius: '10px', width: '30rem' }} />

                        {/* Action Link */}
                        <input
                            style={{ border: '1px solid gray', padding: '0.8rem', borderRadius: '10px', width: '30rem', height: '3rem' }}
                            placeholder="Action Link"
                            {...register(`actions.${i}.link`, { required: 'Action Link is required' })}
                        />
                        {errors.actions?.[i]?.action?.message && <p style={{ color: 'red' }}>{errors.actions[i]?.action?.message}</p>}
                    </div>
                </div>
            ))}

            {/* Add Action and Submit Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button onClick={() => append({ action: '', link: '', language: '', usertype: '', actionImage: undefined })} style={{ backgroundColor: '#c7baba', color: 'white', width: '40px' }}>
                    <AddIcon />
                </Button>
                <Button type="submit" style={{ backgroundColor: '#fff', color: '#ECA55A ', width: '150px' }}>
                    Save Card
                </Button>
            </div>
        </form>
    );
};

export default CreateUser;
