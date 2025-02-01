import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
// import { PersistGate } from 'redux-persist/integration/react'
import store from "./store/store.js";
// import PersistWrapper from './components/PersistWrapper'
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}>
      <PersistWrapper> */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
        {/* </PersistWrapper>
    </PersistGate> */}
    </Provider>
);
