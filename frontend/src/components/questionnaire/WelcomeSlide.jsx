// WelcomeSlide.jsx
import React from "react";

function WelcomeSlide({ onDiveIn }) {
    return (
        <div className="card bg-base-100 shadow-xl p-6 text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome!</h1>
            <p className="text-xl mb-6">
                Ready to find new friends to meet and greet?
            </p>
            <button
                className="btn btn-primary btn-wide mx-auto"
                onClick={onDiveIn}
            >
                Dive In
            </button>
        </div>
    );
}

export default WelcomeSlide;
