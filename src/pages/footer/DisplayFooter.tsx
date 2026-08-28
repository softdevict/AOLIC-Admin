import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { display_footer_contact_us_link, display_footer_social_link } from '../../api/config';
// import ActionCard from '../../components/cards/ActionCard';
import FooterSocialCard from '../../components/cards/FooterSocialCard';
import FooterContactUsCard from '../../components/cards/FooterContactUSCard';
import { Link } from 'react-router-dom';

interface SocialLink {
    _id: string;
    mediaName: string;
    mediaLink: string;
    mediaImage?: string;
}

interface ContactLink {
    _id: string;
    contactName: string;
    contactLink: string;
    contactImage?: string;
}

const DisplayFooter: React.FC = () => {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const response = await axios.get(display_footer_social_link);
                setSocialLinks(response.data.allSocialmedia || []);
            } catch (error) {
                console.error('Error fetching social links:', error);
            }
        };

        fetchSocialLinks();
    }, []);

    useEffect(() => {
        const fetchContactLinks = async () => {
            try {
                const response = await axios.get(display_footer_contact_us_link);
                setContactLinks(response.data.allContactWithUs || []);
            } catch (error) {
                console.error('Error fetching contact links:', error);
            }
        };

        fetchContactLinks();
    }, []);
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

                        >Home</button>
                    </Link>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Footer</button>
                    </li>

                </ol>
            )}
            <div className="flex gap-4 flex-wrap justify-center mt-4">
                {socialLinks.map((item) => (
                    <FooterSocialCard key={item._id} action={item.mediaName} link={item.mediaLink} img={item.mediaImage} id={item._id} />
                ))}

                {contactLinks.map((item) => (
                    <FooterContactUsCard key={item._id} action={item.contactName} link={item.contactLink} img={item.contactImage} id={item._id} />
                ))}
            </div>
        </>
    );
};

export default DisplayFooter;
