import { Dashboard, Language } from "@mui/icons-material";

const API_URL = import.meta.env.VITE_API_URL;

export const display_login = `${API_URL}/aol/adminLogin`

//admin
export const login_admin = `${API_URL}/aol/adminLogin`;

// sub admin 
export const sub_admin = `${API_URL}/aol/subAdmin`
export const permissionType = `${API_URL}/aol/subAdmin/permissionType`

// user 
export const delete_user = `${API_URL}/aol/userDelete`;

// card 
export const display_all_cards = `${API_URL}/aol/showAllCards`;
export const Experience_Center_Digitally = `${API_URL}/aol/showAllCards/Experience Center Digitally`;
export const Facilities_Services_at_Center = `${API_URL}/aol/showAllCards/Facilities & Services at Center`;
export const Stay_Updated = `${API_URL}/aol/showAllCards/Stay Updated`;
export const Experience_Peace_With_Your_Squad = `${API_URL}/aol/showAllCards/Experience Peace With Your Squad`;
export const create_card = `${API_URL}/aol/createCard`;
export const update_card = `${API_URL}/aol/updateCard`;
export const delete_card = `${API_URL}/aol/removeCard`;

export const location = `${API_URL}/aol/l4/location`;
export const EVENT_API = `${API_URL}/aol/event/event-type`;
export const EVENT = `${API_URL}/aol/event`;
export const SUB_EVENT = `${API_URL}/aol/event/sub`;
export const MamberAPI = `${API_URL}/aol/event/member`;
export const SupervisorAPI = `${API_URL}/aol/event/userSupervisor`;

// my dashboard cards
export const my_dashboard_api = `${API_URL}/aol/my_dashboard`;
export const my_dashboard_api_allDetails = `${API_URL}/aol/my_dashboard_allDetails`;
export const nested_my_dashboard_api = `${API_URL}/aol/nested_my_dashboard`;
export const all_nested_my_dashboard_api = `${API_URL}/aol/display_all_nested_cards`;
export const my_dashboard_user = `${API_URL}/aol/nested_my_dashboard_users`;
export const display_details_nestedCard = `${API_URL}/aol/get_all_details_of_nestedCard`;
export const display_all_location = `${API_URL}/aol/l4/location/name`;

// my dash board proper card ======================

export const searchUser_email_phone = `${API_URL}/aol/searchUser_for_mydashboard`;
export const all_user = `${API_URL}/aol/displayAllUSer`;
// ===0 ===
// export const search_zero_my_dashboard_user = `${API_URL}/aol/`;
export const my_dashboard = `${API_URL}/aol/my_dashboard`;
export const my_dashboard_user_card_details = `${API_URL}/aol/my_dashboard_allDetails/card_Id`;

export const geo_range = `${API_URL}/aol/l4/geo-range`

// ===1 ===
export const my_dashboard_1 = `${API_URL}/aol/my_dashboard_1/dashboard_id`;
export const my_dashboard_1_mod = `${API_URL}/aol/my_dashboard_1`;
export const my_dashboard_1_user_card_details = `${API_URL}/aol/my_dashboard_allDetails_1/card_Id`;

export const my_dashboard_all_users = `${API_URL}/aol/my_dashboard_all_users/dashboard_id`;
export const my_dashboard_all_event_users = `${API_URL}/aol/my_dashboard_all_users/event/dashboard_id`;
// ===2 ===
export const my_dashboard_2 = `${API_URL}/aol/my_dashboard_2/dashboard_1_id`;
export const my_dashboard_2_mod = `${API_URL}/aol/my_dashboard_2`;
export const my_dashboard_2_user_card_details = `${API_URL}/aol/my_dashboard_allDetails_2/card_Id`;
export const my_dashboard_all_users_1 = `${API_URL}/aol/my_dashboard_all_users_1/dashboard_id`;
// ===3 ===
export const my_dashboard_3 = `${API_URL}/aol/my_dashboard_3/dashboard_2_id`;
export const my_dashboard_3_mod = `${API_URL}/aol/my_dashboard_3`;
export const my_dashboard_3_user_card_details = `${API_URL}/aol/my_dashboard_allDetails_3/card_Id`;
export const my_dashboard_all_users_2 = `${API_URL}/aol/my_dashboard_all_users_2/dashboard_id`;
// ===4 ===
export const my_dashboard_4 = `${API_URL}/aol/my_dashboard_4/dashboard_3_id`;
export const my_dashboard_4_mod = `${API_URL}/aol/my_dashboard_4`;
export const my_dashboard_4_user_card_details = `${API_URL}/aol/my_dashboard_allDetails_4/card_Id`;
export const my_dashboard_all_users_3 = `${API_URL}/aol/my_dashboard_all_users_3/dashboard_id`;
// === ===

export const event_name = `${API_URL}/aol/event/event-names`;
export const send_Reminder_Notification = `${API_URL}/aol/event/send_Reminder_Notification`;
export const attendance_display = `${API_URL}/aol/event/attendance_display`;

// digital_pass 
export const digital_pass = `${API_URL}/aol/digital_pass`;
export const digital_pass_hod = `${API_URL}/aol/digital_pass/hod`;
export const digital_pass_approverer = `${API_URL}/aol/digital_pass/approverer`;
export const digital_all_pass_name = `${API_URL}/aol/digital_pass/displayAllPassName`;
export const apply_digital_pass = `${API_URL}/aol/digital_pass/applayPass`;

// hod
export const hod = `${API_URL}/aol/event/supervisors`;

// ============Event pass ==================

export const eventPass_format = `${API_URL}/aol/digital_pass/eventPass_format`;
export const eventPass_applyPass = `${API_URL}/aol/digital_pass/applyPass`;

export const sendNotefication = `${API_URL}/aol/digital_pass/notify`

// global search 
export const global_search = `${API_URL}/aol/card_search`;

// user type 
export const create_user_type = `${API_URL}/aol/addUserType`;
export const display_all_user_type = `${API_URL}/aol/userType`;
export const update_user_type = `${API_URL}/aol/updateUSerType`;
export const delete_user_type = `${API_URL}/aol/deleteUSerType`;


// action 
export const add_action = `${API_URL}/aol/addAction`;
export const display_all_action = `${API_URL}/aol/displayAction`;
export const update_action = `${API_URL}/aol/updateAction`;
export const delete_action = `${API_URL}/aol/deleteAction`;

// adv 
export const advertisement = `${API_URL}/aol/adv`;
export const display_all_advertisement = `${API_URL}/aol/displayAdvertisement`;
export const display_all_history_advertise = `${API_URL}/aol/advertisement_history`;

// head 
export const display_all_head = `${API_URL}/aol/displayHeading`;
export const create_heading = `${API_URL}/aol/addHeading`;
export const update_heading = `${API_URL}/aol/updateHeading/`;
export const delete_heading = `${API_URL}/aol/deleteHeading/`;

// youtube 
export const add_youtube_link = `${API_URL}/aol/addYoutubeLinks`;
export const display_mobile = `${API_URL}/aol/displayMobYoutubeLinks`;
export const display_web = `${API_URL}/aol/displayWebYoutubeLinks`;
export const update_youtube_link = `${API_URL}/aol/updateYoutubeLink/`;
export const delete_youtube_link = `${API_URL}/aol/deleteYoutubeLink`;
export const all_youtube_link = `${API_URL}/aol/all-youtube-links`;

//sos
export const add_sos_no = `${API_URL}/aol/sos`;

// popup
export const add_PopUp = `${API_URL}/aol/addPopUp`;
export const all_PopUp = `${API_URL}/aol/displayAllPopUp`;
export const display_PopUp = `${API_URL}/aol/displayPopUp`;

//notification 
export const push_Notification = `${API_URL}/aol/sendNotificationToAll`;
export const push_Notification_single = `${API_URL}/aol/sendSingleNotification`;
export const push_group_notification = `${API_URL}/aol/sendGroupNotification`;
export const merge_group = `${API_URL}/aol/meargeGroup`;

export const profile_userIntrest = `${API_URL}/aol/profile_userIntrest`;
export const CityInterestGroup = `${API_URL}/aol/cityIntrestGroup`;
export const sendNoteficationCityIntrest = `${API_URL}/aol/sentNotification_city_intrest`;

export const stopScheduleNotefication = `${API_URL}/aol/stopScheduleNotefication`;
export const editScheduleNotefication = `${API_URL}/aol/editScheduleNotefication`;

export const searchUser = `${API_URL}/aol/searchUser`;


export const displayAllUSer_email_phone = `${API_URL}/aol/displayAllUSer_email_phone`;
// export const five_hundred_User = `${API_URL}/aol/five_hundredUser`;
export const all_user_for_mydashboard = `${API_URL}/aol/displayUserMydashboard`;
export const all_group = `${API_URL}/aol/displayAllGroup`;
export const create_group = `${API_URL}/aol/createGroup`;
export const create_exel_group = `${API_URL}/aol/createGroupExel`;
export const delete_group = `${API_URL}/aol/deleteGroup`;
export const update_group = `${API_URL}/aol/updateGroup`;

export const display_all_notification = `${API_URL}/aol/display_notification`;
export const display_user_notification = `${API_URL}/aol/notifications`;

export const addToken = `${API_URL}/aol/deviceToken`;

export const future_notification = `${API_URL}/aol/future-notification`

export const display_all_city = `${API_URL}/aol/allCity`;
export const display_all_country = `${API_URL}/aol/allCountry`;
export const display_city_country = `${API_URL}/aol/displayCountry`;

// export const send_Notification = `${API_URL}/notifications/sendNotification`;

// livelink 
export const add_Live_link = `${API_URL}/aol/add_live_link`;
export const display_Live_link = `${API_URL}/aol/display_live_link`;
export const remove_Live_link = `${API_URL}/aol/clear_live_link`;

export const previous_liveLink = `${API_URL}/aol/displayHistoryOfLive`;

// next live 
export const display_new_live_update = `${API_URL}/aol/display_live_date_time`;
export const add_new_live_update = `${API_URL}/aol/add_live_date_time`;
export const stop_show_new_live_update = `${API_URL}/aol/clear_live_link_date_time`

//liveDateTime
export const add_Live_Date_Time = `${API_URL}/aol/add_live_date_time`;

// all users 
export const count_of_user = `${API_URL}/aol/countDeviceTokens`;


// footer 
export const display_footer_social_link = `${API_URL}/aol/social_media`;
export const display_footer_contact_us_link = `${API_URL}/aol/contact_with_us`;

export const update_footer_social_media = `${API_URL}/aol/social_media`;
export const update_footer_contact_us = `${API_URL}/aol/contact_with_us`;

export const delete_footer_social_media = `${API_URL}/aol/social_media`;
export const delete_footer_contact_us = `${API_URL}/aol/contact_with_us`;
// update footer 

// Dashboard
export const add_onBoarding = `${API_URL}/aol/add_On_Boarding`;
export const display_onBoarding = `${API_URL}/aol/display_On_Boarding`;

// direction 
export const get_direction = `${API_URL}/aol/display_direction`;
export const add_direction = `${API_URL}/aol/add_direction`;
export const update_direction = `${API_URL}/aol/update_direction`;
export const delete_direction = `${API_URL}/aol/delete_direction`;
export const static_audioTour = `${API_URL}/aol/static_audioTour`;
export const audioTourName = `${API_URL}/aol/display_eng_audioTour_name`;

// audio tour 
export const get_audioTour = `${API_URL}/aol/display_audioTour`;
export const add_audioTour = `${API_URL}/aol/add_audioTour`;
export const update_audioTour = `${API_URL}/aol/update_audioTour`;
export const delete_audioTour = `${API_URL}/aol/delete_audioTour`;

// Language 
export const audio_language = `${API_URL}/aol/language`;

// default audio tour 
export const add_default_audioTour = `${API_URL}/aol/addDefaultAudioTour`;
export const update_default_audioTour = `${API_URL}/aol/editDefaultAudioTour`;
export const display_default_audioTour = `${API_URL}/aol/displayDefaultAudioTour`;

// linklog 
export const user_linkLog = `${API_URL}/aol/displayClick`;
export const module_linkLog = `${API_URL}/aol/displayHomeClick`;

// Geofencing
export const createGeofencingDistance = `${API_URL}/aol/createGeofencingDistance`;
export const GeofencingSOS = `${API_URL}/aol/toggle/sos`;
export const GeofencingMAP = `${API_URL}/aol/toggle/ashram map`;
export const GeofencingTOUR = `${API_URL}/aol/toggle/audio tour`;
export const GeofencingPopUp = `${API_URL}/aol/toggle/popup`;

export const display_GeofencingSOS = `${API_URL}/aol/geofencing/sos`;
export const display_GeofencingMAP = `${API_URL}/aol/geofencing/ashram map`;
export const display_GeofencingTOUR = `${API_URL}/aol/geofencing/audio tour`;
export const display_GeofencingPopUp = `${API_URL}/aol/geofencing/popup`;

export const Proximity_Control_walk_tour = `${API_URL}/aol/proximityControl/walk tour`;
export const Proximity_Control_vehicle_tour = `${API_URL}/aol/proximityControl/vehicle tour`;
export const Proximity_Control_video_tour = `${API_URL}/aol/proximityControl/video tour`;

export const Proximity_Control_update_walk_tour = `${API_URL}/aol/distance/walk tour`;
export const Proximity_Control_update_vehicle_tour = `${API_URL}/aol/distance/vehicle tour`;
export const Proximity_Control_update_video_tour = `${API_URL}/aol/distance/video tour`;

