import React, { useState } from 'react';
import PopupImg from '../../../src/assets/img/AOL LOGO BANGALORE ASHRAM BLACK.png';
import CloseIcon from '@mui/icons-material/Close';
import { boolean } from 'yup';

function Popups() {
    const [show, setShow] = useState<boolean>(true);
    function clearPage() {
        setShow(!show);
    }
    return (
        <div
            style={{
                padding: '0',
                margin: '0',
                width: '99vw',
                height: '100vh',
                zIndex: '99',
                top: '0',
                left: '0',
                backgroundColor: '#0507179e',
                display: show ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'fixed',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    margin: 'auto',
                    position: 'relative',
                    backgroundColor: 'white',
                }}
            >
                <img
                    style={{
                        width: '40vw',
                        minWidth: '40rem',
                        // height: '60vh',
                        margin: 'auto',
                        padding: '10rem',
                    }}
                    src={PopupImg}
                    alt=""
                />
                <CloseIcon
                    className="absolute top-4 right-4 bg-gray-300 p-1 text-white rounded-full h-8 w-8 hover:bg-gray-400"
                    onClick={() => {
                        clearPage();
                    }}
                />
            </div>
        </div>
    );
}

export default Popups;
