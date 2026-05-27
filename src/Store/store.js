import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

// authorization
import AuthReducer from "../Store/Features/Authentication/authslice";
import authsaga from "../Store/API/AuthAPI/authapi";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        AuthReducer: AuthReducer,
    },
    middleware: (geDefaultMiddleware) => 
        geDefaultMiddleware({ thunk: false, serializableCheck: false, }).concat(sagaMiddleware),
    
});

sagaMiddleware.run(authsaga);
export default store;