// components/PersistWrapper.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

function PersistWrapper({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const auth = useSelector((state) => state.auth);

    useEffect(() => {
        // Wait for a braief moment to ensure redux is rehydrated
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        // You can replace this with a loading spinner
        return (
            <div className="flex justify-center items-center mt-10">
                <Loading />
            </div>
        );
    }

    return children;
}

export default PersistWrapper;
