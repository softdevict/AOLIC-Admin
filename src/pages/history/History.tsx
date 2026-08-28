import { Link } from 'react-router-dom';
import Hcard from './Hcard';

const historyItems = [
    {
        id: 1,
        name: 'Notification',
        link: '/allNotification_history',
    },
    {
        id: 2,
        name: 'Live Video',
        link: '/allLive_history',
    },
    {
        id: 3,
        name: 'PopUp',
        link: '/allPopup_history',
    },
    {
        id: 4,
        name: 'Advertisement',
        link: '/allAdvertisement_history',
    },
    {
        id: 4,
        name: 'Schedule Notification',
        link: '/schedule_notification',
    },
    {
        id: 5,
        name: 'Peace Of Mind',
        link: '/peaceOfMind_history',
    },
];

function History() {
    return (
        <>
                  <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
              <Link to="/">
                                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"
                                    
                                    >Home</button>
                                </Link>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">History</button>
                </li>
               
            </ol>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center text-[#5A382D]">History Center</h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {historyItems.map((item) => (
                    <Hcard key={item.id} name={item.name} link={item.link} />
                ))}
            </div>
        </div>
        </>
    );
}

export default History;
