import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconCaretDown from '../Icon/IconCaretDown';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import logo from '../../../public/assets/logo/AOL LOGO BANGALORE ASHRAM BLACK.png';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SosIcon from '@mui/icons-material/Sos';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import RestoreIcon from '@mui/icons-material/Restore';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import ExploreIcon from '@mui/icons-material/Explore';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import axios from 'axios';
import { sub_admin } from '../../api/config';
import MapIcon from '@mui/icons-material/Map';
import AlbumIcon from '@mui/icons-material/Album';
interface PermissionModule {
    _id: string;
    name: string;
    subTypes: Array<{
        _id: string;
        name: string;
    }>;
}

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const adminType = localStorage.getItem("adminType");
    const adminId = localStorage.getItem("adminId");
    console.log("Admin Type:", adminType);
    const [permissions, setPermissions] = useState<PermissionModule[]>([]);
    console.log("🚀 ~ Sidebar ~ permissions:===", permissions)

    useEffect(() => {
        if (adminType !== "super admin" && adminId) {
            axios
                .get(`${sub_admin}/${adminId}`)
                .then((res) => setPermissions(res.data.data.permissions))
                .catch((err) => console.error(err));
        }
    }, [adminId, adminType]);

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Helper function to check if user has permission
    const hasPermission = (moduleName: string, subTypeName?: string) => {
        if (adminType === "super admin") return true;

        const module = permissions.find(p => p.name === moduleName);
        if (!module) return false;

        if (subTypeName) {
            return module.subTypes?.some((st: any) => st.name === subTypeName) || false;
        }

        return true;
    };

    // Menu configuration for sub admin
    const menuItems = [
        {
            name: 'Analytics',
            icon: <AutoGraphIcon />,
            permission: 'Analytics',
            items: [
                { name: 'Event Passes Link Logs', path: '/analytics/event_passes_linkLog', permission: 'Event Passes Link Logs' },
                { name: 'Module Link Logs', path: '/analytics/module_linkLog', permission: 'Module Link Logs' },
                { name: 'Total Users', path: '/analytics', permission: 'Total Users' },
                { name: 'User Link Logs', path: '/analytics/linkLog', permission: 'User Link Logs' },
            ]
        },
        {
            name: 'Ashram Maps',
            icon: <MapIcon />,
            // icon: <ExploreIcon />,
            permission: 'Ashram Maps',
            items: [
                { name: 'Add Direction', path: '/addDirection', permission: 'Add Direction' },
                { name: 'View', path: '/direction/AshramMaps', permission: 'View' },
            ]
        },


        {
            name: 'Audio Tours',
            icon: <ExploreIcon />,
            permission: 'Audio Tours',
            items: [
                { name: 'Add Audio Tour', path: '/addAudioTour', permission: 'Add Audio Tour' },
                { name: 'Instrumental Audio', path: '/addAndModDefaultTour', permission: 'Add Instrumental Audio' },
                { name: 'Language Control', path: '/direction/languageControl', permission: 'Language Control' },
                { name: 'Proximity Control', path: '/direction/proximityControl', permission: 'Proximity Control' },
                { name: 'View', path: '/direction/AudioTours', permission: 'View' },
            ]
        },
        {
            name: 'Audio Guide',
            icon: <AlbumIcon />,
            permission: 'Audio Guide',
            items: [
                { name: 'Add Audio Guide', path: '/staticAudioTourForm', permission: 'Add Audio Guide' },
                { name: 'View', path: '/direction/AudioGuide', permission: 'View' },
            ]
        },
        {
            name: 'AOL Logins',
            icon: <PersonIcon />,
            permission: 'AOL Logins',
            items: [
                { name: 'Create AOL', path: '/aol-logins/add', permission: 'Create AOL Login Cards' },
                { name: 'View', path: '/aol-logins/display', permission: 'View' },
            ]
        },
        {
            name: 'Digital Pass',
            icon: <LocalActivityIcon />,
            permission: 'Digital Passes',
            items: [
                { name: 'Apply Message', path: '/my_dashboard/passApplayMessage', permission: 'Apply Message' },
                { name: 'Approver', path: '/my_dashboard/approver', permission: 'Approver' },
                { name: 'Coordinators', path: '/digitalPass/coordinator', permission: 'Coordinator' },
                { name: 'Create Event Pass', path: '/digitalPass/add', permission: 'Create Event Pass' },

                { name: 'Geo Locations', path: '/my_dashboard/location', permission: 'Geo Locations' },
                { name: 'HOD', path: '/my_dashboard/hod', permission: 'HOD' },
                { name: 'Mamber Type ', path: '/my_dashboard/mamber', permission: 'Mamber Type' },
                { name: 'View', path: '/digitalPass', permission: 'View' },
            ]
        },
        {
            name: 'Footer',
            icon: <ConnectWithoutContactIcon />,
            permission: 'Footer',
            items: [
                { name: 'View', path: '/footer', permission: 'View' }
            ]
        },
        {
            name: 'History',
            icon: <RestoreIcon />,
            permission: 'History',
            items: [
                { name: 'Advertisement History', path: '/allAdvertisement_history', permission: 'Advertisement History' },
                { name: 'Live Link History', path: '/allLive_history', permission: 'Live Link History' },
                { name: 'Notification History', path: '/allNotification_history', permission: 'Notifications History' },
                { name: 'Peace Of Mind History', path: '/peaceOfMind_history', permission: 'Peace Of Mind History' },
                { name: 'Popup History', path: '/allPopup_history', permission: 'Popup History' },
                { name: 'Scheduled Notifications', path: '/schedule_notification', permission: 'Scheduled Notifications History' },
            ]
        },
        {
            name: 'Home',
            icon: <HomeIcon />,
            permission: 'Home',
            items: [
                { name: 'Add Cards', path: '/HomeCard/add', permission: 'Create Cards' },
                { name: 'Cards', path: '/HomeCard', permission: 'View' },
            ]
        },
        {
            name: 'Live Link',
            icon: <LiveTvIcon />,
            permission: 'Add Live Link',
            items: [
                { name: 'Add Live Link', path: '/live_Link', permission: 'Add Live Link' }
            ]
        },
        {
            name: 'My Dashboard',
            icon: <DashboardCustomizeIcon />,
            permission: 'My Dashboard',
            items: [
                { name: 'Add Member Group', path: '/my_dashboard/mamber', permission: 'Add Member Group' },
                { name: 'Attendance Records', path: '/my_dashboard/attendanceRecords', permission: 'Attendance Records' },
                { name: 'Event Type', path: '/my_dashboard/event', permission: 'Event Type' },
                { name: 'Create New Event', path: '/my_dashboard/add-event', permission: 'Create New Event' },
                { name: 'Create New Card', path: '/my_dashboard/form', permission: 'Create New Card' },
                { name: 'Location', path: '/my_dashboard/location', permission: 'Location' },
                { name: 'Proximity Control', path: '/my_dashboard/range', permission: 'Proximity Control' },
                { name: 'Supervisor', path: '/my_dashboard/supervisorsList', permission: 'Supervisor' },
                { name: 'Trigger Notification', path: '/my_dashboard/trigger_notification', permission: 'Trigger Notification' },
                { name: 'View', path: '/my_dashboard', permission: 'View' },
            ]
        },
        {
            name: 'Next Live Session',
            icon: <CalendarMonthIcon />,
            permission: 'Add Next Live Session',
            items: [
                { name: 'Add Next Live', path: '/live_Date_Time', permission: 'Live Updates' }
            ]
        },
        {
            name: 'Notification',
            icon: <NotificationsIcon />,
            permission: 'Notification',
            items: [
                { name: 'All User Notification', path: '/notification/all', permission: 'All User Notification' },
                { name: 'Group Notification', path: '/notification/group/display', permission: 'Group Notification' },
                { name: 'User Notification', path: '/notification/single', permission: 'User Notification' },
            ]
        },

        {
            name: 'On Boarding',
            icon: <PhotoSizeSelectActualIcon />,
            permission: 'Add On Boarding',
            items: [
                { name: 'Add On Boarding', path: '/On_boarding_form', permission: 'Add OnBoarding Img' },
            ]
        },
        {
            name: 'Peace OF Mind',
            icon: <YouTubeIcon />,
            permission: 'Peace OF Mind',
            items: [
                { name: 'Add YouTube Link', path: '/youtubeLink', permission: 'Add Your YouTube Link' },
            ]
        },


        {
            name: 'Upcoming Programs',
            icon: <AddPhotoAlternateIcon />,
            permission: 'Upcoming Programs',
            items: [
                { name: 'Upcoming Programs', path: '/advertisement', permission: 'View' },
            ]
        },
        {
            name: 'SOS',
            icon: <SosIcon />,
            permission: 'SOS',
            items: [
                { name: 'Add SOS', path: '/sos', permission: 'Add SOS Number' },
            ]
        },
        {
            name: 'Popup',
            icon: <LocalPostOfficeIcon />,
            permission: 'Popup',
            items: [
                { name: 'Add', path: '/popup/form', permission: 'Create Popup' },
                { name: 'View', path: '/popup', permission: 'View' },
            ]
        },



    ];

    // Render menu items based on permissions for sub admin
    const renderMenuItem = (item: any, index: number) => {
        if (!hasPermission(item.permission)) return null;

        // Filter subitems based on permissions
        const visibleSubItems = item.items?.filter((subItem: any) =>
            hasPermission(item.permission, subItem.permission)
        ) || [];

        // If has sub-items but none visible, don't show the menu
        if (item.items && visibleSubItems.length === 0) return null;

        const menuKey = `${item.name}-${index}`;

        // Menu with subitems
        if (item.items && visibleSubItems.length > 0) {
            return (
                <li key={menuKey} className="menu nav-item">
                    <button
                        type="button"
                        className={`${currentMenu === menuKey ? 'active' : ''} nav-link group w-full`}
                        onClick={() => toggleMenu(menuKey)}
                    >
                        <div className="flex items-center">
                            {item.icon}
                            <span className="ltr:pl-3 rtl:pr-3 text-[#56480f] dark:text-[#56480f] dark:group-hover:text-[#56480f]">
                                {t(item.name)}
                            </span>
                        </div>
                        <div className={currentMenu !== menuKey ? 'rtl:rotate-90 -rotate-90' : ''}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === menuKey ? 'auto' : 0}>
                        <ul className="sub-menu text-[#56480f] hover:text-[#56480f]">
                            {visibleSubItems.map((subItem: any, subIndex: number) => (
                                <li key={`${menuKey}-sub-${subIndex}`}>
                                    <NavLink to={subItem.path}>{t(subItem.name)}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        return null;
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div
                    className=" bg-white dark:bg-black h-full "
                    style={
                        {
                            // background: 'linear-gradient(to bottom, #f4a460, #e97451)',
                        }
                    }
                >
                    <div
                        className="flex justify-between items-center px-4 py-3 pb-4 mb-4  text-white"
                        style={{
                            background: 'linear-gradient(to right, #ffe259, #ffa751)',
                        }}
                    >
                        <NavLink to="/" className="main-logo flex items-center shrink-0 justify-center">
                            <img className=" m-auto ml-10  flex-none h-[4rem]" src={logo} alt="logo" />
                            {/* <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">{t('Art Of Living')}</span> */}
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="h-[75vh] relative overflow-y-scroll">
                        {/* <PerfectScrollbar className="h-[calc(100vh-80px)] relative overflow-y-scroll"> */}
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0 ">
                            <li className="nav-item">
                                {
                                    adminType == "super admin" ?
                                        <ul>
                                            <li className="nav-item">
                                                <NavLink to="/analytics" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <AutoGraphIcon />
                                                        <span className="text-[#56480f]">{t('Analytics')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/aol-logins/display" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <PersonIcon />
                                                        {/* <FiGrid className="group-hover:!text-primary shrink-0" /> */}
                                                        <span className="text-[#56480f]">{t('AOL Logins')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            {/* =============================== */}
                                            <li className="nav-item">
                                                <NavLink to="/digitalPass" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <LocalActivityIcon />
                                                        <span className="text-[#56480f]">{t('Digital Pass')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/footer" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <ConnectWithoutContactIcon />
                                                        <span className="text-[#56480f]">{t('Footer')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/history" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <RestoreIcon />

                                                        <span className="text-[#56480f]">{t('History')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/HomeCard" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <HomeIcon />
                                                        {/* <FiGrid className="group-hover:!text-primary shrink-0" /> */}
                                                        <span className="text-[#56480f]">{t('Home')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/live_Link" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <LiveTvIcon />
                                                        <span className="text-[#56480f]">{t('Live Link')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/direction" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <ExploreIcon />
                                                        <span className="text-[#56480f]">{t('Maps and Tours')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>


                                            <li className="nav-item">
                                                <NavLink to="/my_dashboard" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <DashboardCustomizeIcon />
                                                        <span className="text-[#56480f]">{t('My Dashboard')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/live_Date_Time" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarMonthIcon />
                                                        <span className="text-[#56480f]">{t('Next Live Session ')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="menu nav-item">
                                                <button type="button" className={`${currentMenu === 'invoice' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('invoice')}>
                                                    <div className="flex items-center">
                                                        <NotificationsIcon
                                                        // className="group-hover:!text-primary shrink-0"
                                                        />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-[#56480f]  dark:text-[#56480f] dark:group-hover:text-[#56480f]">{t('Notification')}</span>
                                                    </div>

                                                    <div className={currentMenu !== 'invoice' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                                        <IconCaretDown />
                                                    </div>
                                                </button>

                                                <AnimateHeight duration={300} height={currentMenu === 'invoice' ? 'auto' : 0}>
                                                    <ul className="sub-menu text-[#56480f]  hover:text-[#56480f]">
                                                        <li>
                                                            <NavLink to="/notification/all">{t('All User Notification')}</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink to="/notification/group/display">{t('Group Notification')}</NavLink>
                                                        </li>
                                                        <li>
                                                            <NavLink to="/notification/single">{t('User Notification')}</NavLink>
                                                        </li>
                                                    </ul>
                                                </AnimateHeight>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/On_boarding_form" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <PhotoSizeSelectActualIcon />
                                                        {/* <span className="text-[#56480f]">{t('Add Youtube')}</span> */}
                                                        <span className="text-[#56480f]">{t('On Boarding')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink to="/youtubeLink" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <YouTubeIcon />
                                                        {/* <span className="text-[#56480f]">{t('Add Youtube')}</span> */}
                                                        <span className="text-[#56480f]">{t('Peace OF Mind')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/popup" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <LocalPostOfficeIcon />
                                                        {/* <FiGrid className="group-hover:!text-primary shrink-0" /> */}
                                                        <span className="text-[#56480f]">{t('Popup')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/sos" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <SosIcon />
                                                        {/* <FiGrid className="group-hover:!text-primary shrink-0" /> */}
                                                        <span className="text-[#56480f]">{t('SOS')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>



                                            <li className="nav-item">
                                                <NavLink to="/subadmin" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <SupervisorAccountIcon />
                                                        <span className="text-[#56480f]">{t('Sub Admin')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink to="/advertisement" className="group">
                                                    <div className="flex items-center gap-2">
                                                        <AddPhotoAlternateIcon />
                                                        {/* <FiGrid className="group-hover:!text-primary shrink-0" /> */}
                                                        <span className="text-[#56480f]">{t('Upcoming Programs')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>





                                        </ul> :
                                        <ul>
                                            {menuItems.map((item, index) => renderMenuItem(item, index))}
                                        </ul>
                                }

                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;