import { useReducer, createContext, useContext, useCallback } from "react";
import axios from 'axios';

const OrdersContext = createContext();

const initialOrdersState = {
    loading: true,
    data: [],
    error: null,
};

const ordersReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null };
        case "GET_ORDERS_SUCCESS":
            return { loading: false, error: null, data: action.payload };
        case "GET_ORDERS_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "CLEAR_ORDERS":
            return initialOrdersState;
        default:
            return state;
    }
};

const OrdersContextProvider = ({ children }) => {
    const [userOrders, dispatchUserOrders] = useReducer(ordersReducer, initialOrdersState);

    // Dùng useCallback để hàm không bị tạo lại mỗi lần render
    const getOrders = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatchUserOrders({ type: "GET_ORDERS_ERROR", payload: "No token found" });
            return;
        }

        dispatchUserOrders({ type: "LOADING" });
        try {
            const response = await axios.get("http://localhost:5000/api/orders", {
                headers: { 'x-access-token': token }
            });
            dispatchUserOrders({ type: "GET_ORDERS_SUCCESS", payload: response.data });
        } catch (err) {
            const errorMessage = err.response ? err.response.data.message : err.message;
            dispatchUserOrders({ type: "GET_ORDERS_ERROR", payload: errorMessage });
        }
    }, []); // Dependency rỗng vì nó không phụ thuộc vào props hay state nào

    return (
        <OrdersContext.Provider value={{ userOrders, getOrders, dispatchUserOrders }}>
            {children}
        </OrdersContext.Provider>
    );
};

const useOrders = () => useContext(OrdersContext);

export { useOrders, OrdersContextProvider };