import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
// import { PersistGate } from 'redux-persist/integration/react'
import store from "./store/store.js";
// import PersistWrapper from './components/PersistWrapper'
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}>
      <PersistWrapper> */}
        <GoogleOAuthProvider clientId={clientId}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </GoogleOAuthProvider>
        {/* </PersistWrapper>
    </PersistGate> */}
    </Provider>
);
