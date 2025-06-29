import { createContext, useContext, useState, useEffect } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setInitialLoad(false);
        }

        // تحديث الحالة عند تغيير localStorage
        const handleStorageChange = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setCartCount(0);
                setWishlistCount(0);
                setOrdersCount(0);
                setUnreadNotifications(0);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <GlobalStateContext.Provider
            value={{
                cartCount,
                setCartCount,
                wishlistCount,
                setWishlistCount,
                ordersCount,
                setOrdersCount,
                unreadNotifications,
                setUnreadNotifications,
                initialLoad,
                setInitialLoad
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};