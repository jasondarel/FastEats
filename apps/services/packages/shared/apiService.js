import axios from "axios";

const fetchWithLogging = async(url, token, warnMsg) => {
    try {
        const response = await axios.get(url, {
        headers: {
            Authorization: token, 
            "Content-Type": "application/json",
        },
        });
        return response.data;
    } catch (error) {
        return null;
    }
}

export const getUserInformation = async (url, userId, token, message=`User with ID ${userId} not found`) => {
    const userData = await fetchWithLogging(
        `${url}/user/user/${userId}`,
        token,
        message
    );
    return userData;
};

export const getRestaurantInformation = async (url, restaurantId, token, message=`Restaurant with restaurant ID ${restaurantId} not found`) => {
    const restaurantData = await fetchWithLogging(
        `${url}/restaurant/restaurant/${restaurantId}`,
        token,
        message
    );
    return restaurantData;
}

export const getRestaurantByOwnerIdInformation = async (url, ownerId, token, message=`Restaurant with owner ID ${ownerId} not found`) => {
    const restaurantData = await fetchWithLogging(
        `${url}/restaurant/restaurant-owner/${ownerId}`,
        token,
        message
    );
    return restaurantData;
}

export const getMenuInformation = async (url, menuId, token, message=`Menu with ID ${menuId} not found`) => {
    const menuData = await fetchWithLogging(
        `${url}/restaurant/menu-by-id/${menuId}`,
        token,
        message
    );
    return menuData;
}

export const getOrderInformation = async (url, orderId, token, message=`Order with ID ${orderId} not found`) => {
    const orderData = await fetchWithLogging(
        `${url}/order/order/${orderId}`,
        token,
        message
    );
    return orderData;
}