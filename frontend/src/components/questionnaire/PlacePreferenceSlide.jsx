// PlacePreferencesSlide.jsx
import React from "react";
import { useForm } from "react-hook-form";

function PlacePreferenceSlide({
    defaultValues,
    onSubmit,
    onBack,
    onSkip,
    onSelectAll,
}) {
    const { register, handleSubmit } = useForm({ defaultValues });
    const [placePreferences, setPlacePreferences] = useState({
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
    });

    const selectAllPlaces = () => {
        setPlacePreferences(
            Object.keys(placePreferences).reduce(
                (acc, place) => ({
                    ...acc,
                    [place]: true,
                }),
                {}
            )
        );
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="card bg-base-100 shadow-xl p-6"
        >
            <h2 className="text-2xl font-bold text-center mb-6">
                Place Preferences
            </h2>
            <div className="grid grid-cols-3 gap-4">
                {Object.keys(placePreferences).map((place) => (
                    <button
                        key={place}
                        className={`btn ${placePreferences[place] ? "btn-primary" : "btn-outline"}`}
                        onClick={() => togglePlacePreference(place)}
                    >
                        {place.charAt(0).toUpperCase() + place.slice(1)}
                    </button>
                ))}
            </div>
            <button
                type="button"
                className="btn btn-secondary mt-4 w-full"
                onClick={selectAllPlaces}
            >
                Select All
            </button>
            <div className="card-actions justify-between mt-6">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onBack}
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
                        onClick={onSkip}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </form>
    );
}

export default PlacePreferenceSlide;
