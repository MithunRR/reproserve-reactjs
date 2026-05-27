
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Store/store.js";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
    <Provider store={store} >
        <BrowserRouter>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
    </Provider>

);