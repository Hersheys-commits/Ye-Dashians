// BioSlide.jsx
import React from "react";
import { useForm } from "react-hook-form";

function BioSlide({ defaultValues, onSubmit, onBack, onSkip }) {
    const { register, handleSubmit } = useForm({ defaultValues });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="card bg-base-100 shadow-xl p-6"
        >
            <h2 className="text-2xl font-bold text-center mb-6">About Me</h2>
            <textarea
                {...register("bio")}
                className="textarea textarea-bordered h-48 w-full"
                placeholder="Tell us about yourself..."
            ></textarea>
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

export default BioSlide;
