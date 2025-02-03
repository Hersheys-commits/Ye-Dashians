import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

function Questionnaire() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    // This state will hold all the data gathered from the forms
    const [formData, setFormData] = useState({
        personalInfo: {},
        placePreferences: {},
        bio: "",
    });

    // Personal Info Form
    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        formState: { errors: errorsPersonal },
    } = useForm({
        defaultValues: { age: "", gender: "", address: "" },
    });

    // Place Preferences Form
    const {
        register: registerPlaces,
        handleSubmit: handleSubmitPlaces,
        control: controlPlaces,
        setValue,
        getValues,
    } = useForm({
        defaultValues: {
            restaurant: false,
            cafe: false,
            bar: false,
            park: false,
            theater: false,
            museum: false,
            arcade: false,
            bakery: false,
            library: false,
            mall: false,
        },
    });
    // Watch the place preferences so that our UI can update immediately when a value changes.
    const placeValues = useWatch({ control: controlPlaces });

    // Bio Form
    const { register: registerBio, handleSubmit: handleSubmitBio } = useForm({
        defaultValues: { bio: "" },
    });

    // Navigation functions
    const nextSlide = () => setCurrentSlide((prev) => prev + 1);
    const prevSlide = () => setCurrentSlide((prev) => prev - 1);

    // Form submission handlers for each slide:
    const onSubmitPersonal = async (data) => {
        try {
            const response = await axios.patch(
                "http://localhost:4001/api/users/update-account-question",
                data,
                { withCredentials: true }
            );
            toast.success("Profile updated successfully.");
        } catch (error) {
            console.log("first", error.message);
        }
        setFormData((prev) => ({ ...prev, personalInfo: data }));
        nextSlide();
    };

    const onSubmitPlaces = async (data) => {
        try {
            const response = await axios.post(
                "http://localhost:4001/api/users/update-preferences",
                { preferences: data },
                { withCredentials: true }
            );
            // console.log(response)
            toast.success("Preferences updated successfully");
        } catch (error) {
            console.log("first", error.message);
        }
        setFormData((prev) => ({ ...prev, placePreferences: data }));
        nextSlide();
    };

    const onSubmitBio = async (data) => {
        try {
            const response = await axios.post(
                "http://localhost:4001/api/users/update-bio",
                data,
                { withCredentials: true }
            );
            console.log(response);
            toast.success("Bio updated successfully");
        } catch (error) {
            console.log("first", error.message);
        }
        setFormData((prev) => ({ ...prev, bio: data.bio }));
        nextSlide();
    };

    // Toggle all place preferences based on current state.
    const toggleAllPlaces = () => {
        const current = getValues();
        // If any is false, then select all; otherwise unselect all.
        const shouldSelectAll = Object.values(current).some((val) => !val);
        Object.keys(current).forEach((place) =>
            setValue(place, shouldSelectAll)
        );
    };

    // Slides array: each slide is a JSX element.
    const slides = [
        // 1. Personal Information Slide
        <div className="card bg-base-100 shadow-xl p-6" key="personal">
            <h2 className="text-2xl font-bold text-center mb-6">
                Personal Information
            </h2>
            <form onSubmit={handleSubmitPersonal(onSubmitPersonal)}>
                <div className="form-control w-full">
                    <label className="label">Age</label>
                    <input
                        type="number"
                        placeholder="Enter your age"
                        className="input input-bordered w-full"
                        {...registerPersonal("age", { required: true })}
                    />
                    {errorsPersonal.age && (
                        <span className="text-red-500">Age is required</span>
                    )}
                </div>
                <div className="form-control w-full mt-4">
                    <label className="label">Gender</label>
                    <select
                        className="select select-bordered w-full"
                        {...registerPersonal("gender", { required: true })}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errorsPersonal.gender && (
                        <span className="text-red-500">Gender is required</span>
                    )}
                </div>
                <div className="form-control w-full mt-4">
                    <label className="label">Address</label>
                    <input
                        type="text"
                        placeholder="Enter your address"
                        className="input input-bordered w-full"
                        {...registerPersonal("address", { required: true })}
                    />
                    {errorsPersonal.address && (
                        <span className="text-red-500">
                            Address is required
                        </span>
                    )}
                </div>
                <div className="card-actions justify-between mt-6">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => navigate("/")}
                    >
                        Cancel
                    </button>
                    <div className="space-x-2">
                        {/* Submitting the form will run our onSubmitPersonal handler */}
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={nextSlide}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </form>
        </div>,

        // 2. Place Preferences Slide
        <div className="card bg-base-100 shadow-xl p-6" key="places">
            <h2 className="text-2xl font-bold text-center mb-6">
                Place Preferences
            </h2>
            <form onSubmit={handleSubmitPlaces(onSubmitPlaces)}>
                <div className="grid grid-cols-3 gap-4">
                    {Object.keys(placeValues || {}).map((place) => (
                        <button
                            type="button"
                            key={place}
                            // Change style based on whether the place is selected.
                            className={`btn ${placeValues[place] ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setValue(place, !placeValues[place])}
                        >
                            {place.charAt(0).toUpperCase() + place.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    className="btn btn-secondary mt-4 w-full"
                    onClick={toggleAllPlaces}
                >
                    Select/Unselect All
                </button>
                <div className="card-actions justify-between mt-6">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={prevSlide}
                    >
                        Back
                    </button>
                    <div className="space-x-2">
                        {/* Submitting the form saves the data and goes to the next slide */}
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={nextSlide}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </form>
        </div>,

        // 3. Bio Slide
        <div className="card bg-base-100 shadow-xl p-6" key="bio">
            <h2 className="text-2xl font-bold text-center mb-6">About Me</h2>
            <form onSubmit={handleSubmitBio(onSubmitBio)}>
                <textarea
                    className="textarea textarea-bordered h-48 w-full"
                    placeholder="Tell us about yourself..."
                    {...registerBio("bio")}
                ></textarea>
                <div className="card-actions justify-between mt-6">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={prevSlide}
                    >
                        Back
                    </button>
                    <div className="space-x-2">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={nextSlide}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </form>
        </div>,

        // 4. Welcome Slide
        <div
            className="card bg-base-100 shadow-xl p-6 text-center"
            key="welcome"
        >
            <h1 className="text-4xl font-bold mb-6">Welcome!</h1>
            <p className="text-xl mb-6">
                Ready to find new friends to meet and greet?
            </p>
            <button
                className="btn btn-primary btn-wide mx-auto"
                onClick={() => {
                    console.log("Final Form Data:", formData);
                    navigate("/");
                }}
            >
                Dive In
            </button>
        </div>,
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="w-full max-w-md">{slides[currentSlide]}</div>
        </div>
    );
}

export default Questionnaire;
