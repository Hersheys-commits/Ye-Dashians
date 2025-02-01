import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center px-4 lg:px-40 py-8">
                <h1 className="text-9xl font-bold text-blue-600">404</h1>

                <div className="absolute rotate-12 -mt-8">
                    <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-lg shadow-lg">
                        Page Not Found
                    </div>
                </div>

                <div className="mt-16">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Oops! Looks like you're lost
                    </h3>

                    <p className="text-gray-600 mb-8">
                        The page you're looking for doesn't exist or has been
                        moved to another URL
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <Home size={20} />
                            Home Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;
