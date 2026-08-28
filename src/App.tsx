import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { IRootState } from './store';
import { toggleRTL, toggleTheme, toggleLocale, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from './store/themeConfigSlice';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar); // ✅ Get sidebar state from Redux
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleLocale(localStorage.getItem('i18nextLng') || themeConfig.locale));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));
    }, [dispatch]);


    useEffect(() => {
        const token = localStorage.getItem('token');
        const publicRoutes = [
            '/signin',
            '/signup',
            '/privacy-policy',
            '/terms-of-use',
        ];

        // ⭐ FIX: Allow PUBLIC dynamic routes
        const isPublicRoute =
            publicRoutes.includes(location.pathname) ||
            location.pathname.startsWith('/digitalPass/form/link/') ||
            location.pathname.startsWith('/digitalPass/share-pass/');

        if (!token && !isPublicRoute) {
            navigate('/signin');
        }
    }, [location, navigate]);

    console.log("aol");


    return (
        <div
            className={`
                ${sidebar ? 'toggle-sidebar' : ''}
                ${themeConfig.menu}
                ${themeConfig.layout}
                ${themeConfig.rtlClass}
                main-section antialiased relative font-nunito text-sm font-normal
            `}
        >
            {children}
        </div>
    );
}

export default App;
