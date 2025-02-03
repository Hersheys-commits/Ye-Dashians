// PersonalInfoSlide.jsx
import React from "react";
import { useForm } from "react-hook-form";

function PersonalInfoSlide({ defaultValues, onSubmit, onCancel, onSkip }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="card bg-base-100 shadow-xl p-6"
        >
            <h2 className="text-2xl font-bold text-center mb-6">
                Personal Information
            </h2>
            <div className="form-control w-full">
                <label className="label">Age</label>
                <input
                    type="number"
                    placeholder="Enter your age"
                    className="input input-bordered w-full"
                    {...register("age", { required: "Age is required" })}
                />
                {errors.age && (
                    <span className="text-red-500">{errors.age.message}</span>
                )}
            </div>
            <div className="form-control w-full">
                <label className="label">Gender</label>
                <select
                    className="select select-bordered w-full"
                    {...register("gender", { required: "Gender is required" })}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                {errors.gender && (
                    <span className="text-red-500">
                        {errors.gender.message}
                    </span>
                )}
            </div>
            <div className="form-control w-full">
                <label className="label">Address</label>
                <input
                    type="text"
                    placeholder="Enter your address"
                    className="input input-bordered w-full"
                    {...register("address", {
                        required: "Address is required",
                    })}
                />
                {errors.address && (
                    <span className="text-red-500">
                        {errors.address.message}
                    </span>
                )}
            </div>
            <div className="card-actions justify-between mt-6">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onCancel}
                >
                    Cancel
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

export default PersonalInfoSlide;
