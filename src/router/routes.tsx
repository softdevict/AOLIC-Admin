import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import Update from '../pages/Update';
import UpdateDetails from '../pages/UpdateDetails';
import Action from '../pages/Actions';
import TypeCard from '../pages/TypeCard';
import HeadlineForm from '../pages/form/HeadlineForm';
import UserTypeForm from '../pages/form/UserTypeForm';
import YoutubeForm from '../pages/form/YoutubeForm';
import PopupForm from '../pages/popup/PopupForm';
import AddNotification from '../pages/form/AddNotification';
import SOSForm from '../pages/sos/SOSForm';
import LiveLinkForm from '../pages/form/LiveLinkForm';
import SearchPage from '../components/search/SearchPage';
import LiveString from '../pages/form/LiveString';
import DisplayFooter from '../pages/footer/DisplayFooter';
import History from '../pages/history/History';
import Notification from '../pages/history/Notification';
import AllPopupHistory from '../pages/history/AllPopupHistory';
import AllLiveHistory from '../pages/history/AllLiveHistory';
import ContactUsEditForm from '../pages/footer/ContactUsEditForm';
import SocialMediaEditForm from '../pages/footer/SocialMediaEditForm';
import AdvertisementHistory from '../pages/history/AdvertisementHistory';
import OnBoardingForm from '../pages/form/OnBoardingForm';
import DisplayDirection from '../pages/direction/DisplayDirection';
import Directionmodefication from '../pages/direction/Directionmodefication';
import AddDirection from '../pages/direction/AddDirection';
import DirectionDetails from '../pages/direction/DirectionDetails';
import Users from '../pages/notification/SingleNotification';
import Group from '../pages/notification/DisplayGroups';
import NotificationForm from '../pages/notification/AllNotification';
import GroupNotificationForm from '../pages/notification/GroupNotification';
import LinkLog from '../pages/analytics/LinkLog';
import ModuleLinkLog from '../pages/analytics/ModuleLinkLog';
import ScheduleNotification from '../pages/history/ScheduleNotification';
import Privacypolicy from '../pages/Privacypolicy/Privacypolicy';
import TermsOfUse from '../pages/Privacypolicy/TermsOfUse';
import AddAudioTour from '../pages/direction/AddAudioTour';
import PeaceOfMindHistory from '../pages/history/PeaceOfMindHistory';
import AudioTourModification from '../pages/direction/AudioTourModefication';
import AddAndModDefaultTour from '../pages/direction/AddAndModDefaultTour';
import AdvertisementDisplay from '../pages/advertisement/Display';
import AOLLoginDisplay from '../pages/AOLLogins/Display';
import HomeDisplay from '../pages/home/Display';
import HomeEdit from '../pages/home/Edit';
import HomeAdd from '../pages/home/Add';
import AnalyticsDisplay from '../pages/analytics/Display';
import NotificationAll from '../pages/notification/AllNotification';
import NotificationGroup from '../pages/notification/GroupNotification';
import NotificationSingle from '../pages/notification/SingleNotification';
import DisplayGroup from '../pages/notification/DisplayGroups';
import AddAshramDetails from '../pages/direction/AddAshramDetails';
import ProximityControl from '../pages/direction/ProximityControl';
import Popup from '../pages/popup/Display';
import StaticAudioTourForm from '../pages/direction/StaticAudioTourForm';
import SentSingleNotificaton from '../pages/notification/SentSingleNotification';
import AolLoginAdd from '../pages/AOLLogins/Add';
import AolLoginEdit from '../pages/AOLLogins/Edit';
import AdvertisementEdit from '../pages/advertisement/Edit';
import AdvertisementAdd from '../pages/advertisement/Add';
import LanguageControl from '../pages/direction/LanguageControl';
import Zero_My_Dashboard_View from '../pages/myDashboard/Zero/View';
import Zero_My_Dashboard_Add from '../pages/myDashboard/Zero/Add';
import Zero_My_Dashboard_Edit from '../pages/myDashboard/Zero/Edit';
import First_My_Dashboard_View from '../pages/myDashboard/One/View';
import First_My_Dashboard_Add from '../pages/myDashboard/One/Add';
import First_My_Dashboard_Edit from '../pages/myDashboard/One/Edit';
import Second_My_Dashboard_View from '../pages/myDashboard/Two/View';
import Second_My_Dashboard_Add from '../pages/myDashboard/Two/Add';
import Second_My_Dashboard_Edit from '../pages/myDashboard/Two/Edit';
import Third_My_Dashboard_View from '../pages/myDashboard/Three/View';
import Third_My_Dashboard_Add from '../pages/myDashboard/Three/Add';
import Third_My_Dashboard_Edit from '../pages/myDashboard/Three/Edit';
import Fourth_My_Dashboard_View from '../pages/myDashboard/Four/View';
import Fourth_My_Dashboard_Add from '../pages/myDashboard/Four/Add';
import Fourth_My_Dashboard_Edit from '../pages/myDashboard/Four/Edit';
import Location from "../pages/myDashboard/component/Location";
import Range from '../pages/myDashboard/component/Range';
import AddEvent from '../pages/myDashboard/event/Add';
import EditEvent from '../pages/myDashboard/event/Edit';
import AddSubEvent from '../pages/myDashboard/subEvent/Add';
import EditSubEvent from '../pages/myDashboard/subEvent/Edit';
import EventType from '../pages/myDashboard/component/EventType';
import TrigerNotefication from '../pages/myDashboard/component/triggerNotefication/TrigerNotefication';
import ReminderNotefication from '../pages/myDashboard/component/triggerNotefication/ReminderNotefication';
import DigitalPassView from '../pages/DigitalPass/View';
import DigitalPassEdit from '../pages/DigitalPass/Edit';
import DigitalPassAdd from '../pages/DigitalPass/Add';
import PassUser from '../pages/DigitalPass/PassUser';
import AdminView from '../pages/admin/View';
import AdminAdd from '../pages/admin/Add';
import AdminEdit from '../pages/admin/Edit';
import HOD from '../pages/myDashboard/component/triggerNotefication/HOD';
import DigitalPassApply from "../pages/DigitalPass/DigitalPassApply";
import DigitalPassAllForm from '../pages/DigitalPass/form/DigitalPassAllForm';
import DigitalPassEditForm from '../pages/DigitalPass/form/DigitalPassEditForm';
import DisplayAllFormName from '../pages/DigitalPass/form/DisplayAllFormName';
import DigitalPassFormAdd from '../pages/DigitalPass/form/DigitalPassFormAdd';
import DigitalPassFormLink from '../pages/DigitalPass/form/DigitalPassFormLink';
import Mamber from '../pages/DigitalPass/mamber/Mamber';
import Supervisor from '../pages/DigitalPass/form/Supervisor/Supervisor';
import AdminDetails from '../pages/admin/Details';
import EditMamber from '../pages/DigitalPass/mamber/Edit';
import AddMamber from '../pages/DigitalPass/mamber/Add';
import AllPass from '../pages/DigitalPass/AllPass';
import DigitalPassCoordinatorManage from '../pages/DigitalPass/DigitalPassCoordinatorManage';
import SharePass from '../pages/SharePass';
import Index from '../pages/Index';
import ErrorPage from '../pages/ErrorPage';
import Hod from '../pages/DigitalPass/manage/Hod';
import Approver from '../pages/DigitalPass/manage/Approver';
import EventPassesLinkLog from '../pages/analytics/EventPassesLinkLog';
import EventPassesLinkLogDetails from '../pages/analytics/EventPassesLinkLogDetails';
import SupervisorsList from '../pages/myDashboard/component/triggerNotefication/HOD';
import DisplayDirections from '../pages/direction/direction/AshramMaps';
import DisplayAudioTours from '../pages/direction/direction/AudioTours';
import DisplayStaticAudios from '../pages/direction/direction/AudioGuide';
import ApplayMessage from '../pages/DigitalPass/manage/ApplayMessage';
import AttendancePage from '../pages/myDashboard/component/AttendancePage';
const Login = lazy(() => import('../pages/Login'));

const routes = [
    {
        path: '*',
        element: <ErrorPage />,
    },
    {
        path: '/privacy-policy',
        element: <Privacypolicy />,
    },
    {
        path: '/terms-of-use',
        element: <TermsOfUse />,
    },
    {
        path: '/digitalPass/apply/:selectedPassId',
        element: (
            <DigitalPassApply />
        ),
    },
    {
        path: '/digitalPass/form/link/:formId',
        element: (
            <DigitalPassFormLink />
        ),
    },
    {
        path: '/digitalPass/share-pass/:passId',
        element: (
            <SharePass />
        ),
    },
    // =================================================
    // --- Home ---
    // =================================================
    {
        path: '/',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Index />
            </Suspense>
        ),
        layout: 'default', // Ensure this is actually used somewhere
    },
    {
        path: '/HomeCard',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <HomeDisplay />
            </Suspense>
        ),
        layout: 'default', // Ensure this is actually used somewhere
    },
    {
        path: '/HomeCard/edit',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <HomeEdit />
            </Suspense>
        ),
        layout: 'default', // Ensure this is actually used somewhere
    },
    {
        path: '/HomeCard/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <HomeAdd />
            </Suspense>
        ),
        layout: 'default', // Ensure this is actually used somewhere
    },
    {
        path: '/searchPage',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <SearchPage />
            </Suspense>
        ),
    },
    // =================================================
    // --- Analytics ---
    // =================================================
    {
        path: '/analytics',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <AnalyticsDisplay />
            </Suspense>
        ),
    },
    {
        path: '/analytics/linkLog',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <LinkLog />
            </Suspense>
        ),
    },
    {
        path: '/analytics/module_linkLog',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ModuleLinkLog />
            </Suspense>
        ),
    },
    {
        path: '/analytics/event_passes_linkLog',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EventPassesLinkLog />
            </Suspense>
        ),
    },
    {
        path: '/analytics/event_passes_linkLog/:eventId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EventPassesLinkLogDetails />
            </Suspense>
        ),
    },
    // =================================================
    // --- Map and Tour ---
    // =================================================
    {
        path: '/direction',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayDirection />
            </Suspense>
        ),
    },
    {
        path: '/direction/AshramMaps',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayDirections />
            </Suspense>
        ),
    },
    {
        path: '/direction/AudioTours',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayAudioTours />
            </Suspense>
        ),
    },
    {
        path: '/direction/AudioGuide',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayStaticAudios />
            </Suspense>
        ),
    },
    {
        path: '/direction/proximityControl',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProximityControl />
            </Suspense>
        ),
    },
    {
        path: '/addAshramDetails',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddAshramDetails />
            </Suspense>
        ),
    },
    {
        path: '/staticAudioTourForm',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <StaticAudioTourForm />
            </Suspense>
        ),
    },
    {
        path: '/addAudioTour',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddAudioTour />
            </Suspense>
        ),
    },

    {
        path: '/audioTourModification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AudioTourModification />
            </Suspense>
        ),
    },

    {
        path: '/direction/languageControl',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <LanguageControl />
            </Suspense>
        ),
    },


    // =================================================
    // --- AOL Logins ---
    // =================================================
    {
        path: '/aol-logins/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AolLoginAdd />
            </Suspense>
        ),
    },
    {
        path: '/aol-logins/edit',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AolLoginEdit />
            </Suspense>
        ),
    },
    {
        path: '/aol-logins/display',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AOLLoginDisplay />
            </Suspense>
        ),
    },

    // =================================================
    // --- My Dashboard ---
    // =================================================
    {
        path: '/my_dashboard',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Zero_My_Dashboard_View />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/form',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Zero_My_Dashboard_Add />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/edit/:dashboardId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Zero_My_Dashboard_Edit />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/hod',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Hod />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/supervisorsList',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SupervisorsList />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/approver',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Approver />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/passApplayMessage',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ApplayMessage />
            </Suspense>
        ),
    },



    // ==1 ===
    {
        path: '/my_dashboard_1/:root_Card_1',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <First_My_Dashboard_View />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_1/form/:root_Card_1',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <First_My_Dashboard_Add />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_1/edit/:dashboardId_1',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <First_My_Dashboard_Edit />
            </Suspense>
        ),
    },

    // ==2 ===
    {
        path: '/my_dashboard_2/:root_Card_2',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Second_My_Dashboard_View />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_2/form/:root_Card_2',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Second_My_Dashboard_Add />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_2/edit/:dashboardId_2',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Second_My_Dashboard_Edit />
            </Suspense>
        ),
    },
    // ==3 ===
    {
        path: '/my_dashboard_3/:root_Card_3',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Third_My_Dashboard_View />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_3/form/:root_Card_3',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Third_My_Dashboard_Add />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_3/edit/:dashboardId_3',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Third_My_Dashboard_Edit />
            </Suspense>
        ),
    },
    // ==4 ===
    {
        path: '/my_dashboard_4/:root_Card_4',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Fourth_My_Dashboard_View />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_4/form/:root_Card_4',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Fourth_My_Dashboard_Add />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard_4/edit/:dashboardId_4',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Fourth_My_Dashboard_Edit />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/location',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Location />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/event',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EventType />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/range',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Range />
            </Suspense>
        ),
    },



    // {
    //     path: '/my_dashboard/edit/:dashboardId',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <EditDashboard />
    //         </Suspense>
    //     ),
    // },
    // {
    //     path: '/my_dashboard/nested/edit/:dashboardId',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <EditNestedDashboard />
    //         </Suspense>
    //     ),
    // },
    // {
    //     path: '/my_dashboard/nested',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <NestedDisplay />
    //         </Suspense>
    //     ),
    // },
    // {
    //     path: '/my_dashboard/nested/form',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <NestedForm />
    //         </Suspense>
    //     ),
    // },

    // ===================================

    {
        path: '/my_dashboard/mamber',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Mamber />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/mamber/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddMamber />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/mamber/edit/:mamberId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EditMamber />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/supervisor',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Supervisor />
            </Suspense>
        ),
    },
    // ===================================
    {
        path: '/my_dashboard/add-event',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddEvent />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/edit-event/:dashboardId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EditEvent />
            </Suspense>
        ),
    },
    {
        path: '/add-sub-event/form/:dashboardId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddSubEvent />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/trigger_notification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <TrigerNotefication />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/attendanceRecords',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                  <AttendancePage />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/hod',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <HOD />
            </Suspense>
        ),
    },
    {
        path: '/my_dashboard/reminder_notefication/:eventId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ReminderNotefication />
            </Suspense>
        ),
    },
    // {
    //     path: '/my_dashboard/attendance',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <Attendance />
    //         </Suspense>
    //     ),
    // },
    {
        path: '/my_dashboard_1/edit-sub-event/:dashboardId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EditSubEvent />
            </Suspense>
        ),
    },

    // =================================================
    // --- Add On Boarding ---
    // =================================================

    // =================================================
    // --- Peace Of Mind ---
    // =================================================
    {
        path: '/youtubeLink',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <YoutubeForm />
            </Suspense>
        ),
    },
    // =================================================
    // --- Add Live Link ---
    // =================================================
    {
        path: '/live_Link',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <LiveLinkForm />
            </Suspense>
        ),
    },
    // =================================================
    // --- Add Next Live Session ---
    // =================================================
    {
        path: '/live_Date_Time',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <LiveDateTime /> */}
                <LiveString />
            </Suspense>
        ),
    },
    // =================================================
    // --- Advertisement ---
    // =================================================

    {
        path: '/advertisement',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <Advertisement /> */}
                <AdvertisementDisplay />
            </Suspense>
        ),
    },
    {
        path: '/advertisement/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <Advertisement /> */}
                <AdvertisementAdd />
            </Suspense>
        ),
    },
    {
        path: '/advertisement/edit',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <Advertisement /> */}
                <AdvertisementEdit />
            </Suspense>
        ),
    },

    // =================================================
    // --- sos ---
    // =================================================
    {
        path: '/sos',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SOSForm />
            </Suspense>
        ),
    },
    // =================================================
    // --- Popup ---
    // =================================================
    {
        path: '/popup',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Popup />
            </Suspense>
        ),
    },
    {
        path: '/popup/form',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PopupForm />
            </Suspense>
        ),
    },
    // =================================================
    // --- Notificattion ---
    // =================================================
    {
        path: '/notification/all',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <NotificationAll />
            </Suspense>
        ),
    },
    {
        path: '/notification/group',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <NotificationGroup />
            </Suspense>
        ),
    },
    {
        path: '/notification/group/display',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <DisplayGroup />
            </Suspense>
        ),
    },
    {
        path: '/notification/single',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <NotificationSingle />
            </Suspense>
        ),
    },
    {
        path: '/single_notification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <NotificationForm />
            </Suspense>
        ),
    },

    {
        path: '/sentSingleNotificaton',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SentSingleNotificaton />
            </Suspense>
        ),
    },

    {
        path: '/displaya_all_user',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Users />
            </Suspense>
        ),
    },
    {
        path: '/display_all_group',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Group />
            </Suspense>
        ),
    },

    {
        path: '/group_notification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <GroupNotificationForm />
            </Suspense>
        ),
    },

    // =================================================
    // --- Footer ---
    // =================================================
    {
        path: '/footer',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayFooter />
            </Suspense>
        ),
    },
    {
        path: '/footer_social_edit_card',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SocialMediaEditForm />
            </Suspense>
        ),
    },
    {
        path: '/footer_contact_us_edit_card',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ContactUsEditForm />
            </Suspense>
        ),
    },
    // =================================================
    // --- History ---
    // =================================================
    {
        path: '/history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <History />
            </Suspense>
        ),
    },
    {
        path: '/allNotification_history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Notification />
            </Suspense>
        ),
    },
    {
        path: '/allLive_history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AllLiveHistory />
            </Suspense>
        ),
    },
    {
        path: '/allPopup_history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AllPopupHistory />
            </Suspense>
        ),
    },
    {
        path: '/allAdvertisement_history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AdvertisementHistory />
            </Suspense>
        ),
    },

    {
        path: '/schedule_notification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ScheduleNotification />
            </Suspense>
        ),
    },
    {
        path: '/peaceOfMind_history',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PeaceOfMindHistory />
            </Suspense>
        ),
    },

    // =================================================
    // --- extra ---
    // =================================================
    {
        path: '/headline',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateCard /> */}
                <HeadlineForm />
            </Suspense>
        ),
    },

    // =================================================
    // --- Advertisement ---
    // =================================================

    // =================================================
    // =================================================
    {
        path: '/create_internal_login',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                {/* <CreateInternalLogin /> */}
                <UserTypeForm />
            </Suspense>
        ),
    },
    {
        path: '/popup',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Popup />
            </Suspense>
        ),
    },
    {
        path: '/addNotification',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddNotification />
            </Suspense>
        ),
    },

    {
        path: '/signin',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: '/update/:id',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Update />
            </Suspense>
        ),
    },
    {
        path: '/update-details/:id',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <UpdateDetails />
            </Suspense>
        ),
    },

    {
        path: '/action',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Action />
            </Suspense>
        ),
    },
    {
        path: '/typecard',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <TypeCard />
            </Suspense>
        ),
    },
    {
        path: '/typeaction2',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <TypeCard />
            </Suspense>
        ),
    },
    // {
    //     path: '/sos',
    //     element: (
    //         <Suspense fallback={<div>Loading...</div>}>
    //             <SOSForm />
    //         </Suspense>
    //     ),
    // },




    {
        path: '/On_boarding_form',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <OnBoardingForm />
            </Suspense>
        ),
    },

    {
        path: '/directionmodefication',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Directionmodefication />
            </Suspense>
        ),
    },

    {
        path: '/addDirection',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddDirection />
            </Suspense>
        ),
    },
    {
        path: '/directionDetails',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DirectionDetails />
            </Suspense>
        ),
    },
    {
        path: '/addAndModDefaultTour',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddAndModDefaultTour />
            </Suspense>
        ),
    },

    // ======================== digital pass ===============================
    {
        path: '/digitalPass',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassView />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/coordinator',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassCoordinatorManage />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassAdd />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/allPass/:eventId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AllPass />
            </Suspense>
        ),
    },

   
    {
        path: '/digitalPass/form/name',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DisplayAllFormName />
            </Suspense>
        ),
    },

    // ==== form template ==================
    {
        path: '/digitalPass/form/view/:eventId',
        // path: '/digitalPass/form/view/:eventId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassAllForm />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/form/add/:eventId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassFormAdd />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/form/edit/:formId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassEditForm />
            </Suspense>
        ),
    },
    // ===========================================
    {
        path: '/digitalPass/edit/:passId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DigitalPassEdit />
            </Suspense>
        ),
    },
    {
        path: '/digitalPass/user/:userId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PassUser />
            </Suspense>
        ),
    },

    {
        path: '/subadmin',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AdminView />
            </Suspense>
        ),
    },
    {
        path: '/subadmin/view/:adminId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AdminDetails />
            </Suspense>
        ),
    },
    {
        path: '/subadmin/add',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AdminAdd />
            </Suspense>
        ),
    },
    {
        path: '/subadmin/edit/:adminId',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AdminEdit />
            </Suspense>
        ),
    },

    {
        path: '*',
        element: <Navigate to="/" />, // Redirect unknown routes to Home
    },
];

export { routes };
