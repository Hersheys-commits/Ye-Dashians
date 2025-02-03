import React, { useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { FaImage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import useSendMessage from "../../../hooks/useSendMessage";
import { useForm } from "react-hook-form";

function Sendtext() {
    const { sendMessageLoading, sendMessage } = useSendMessage();
    const { register, handleSubmit, reset } = useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (data) => {
        if (!data.message && !selectedImage) return;

        await sendMessage({
            text: data.message,
            image: selectedImage
        });

        reset();
        removeImage();
    };

    return (
        <div className="relative">
            {imagePreview && (
                <div className="absolute bottom-[8vh] left-4 mb-2">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1"
                            type="button"
                        >
                            <IoMdClose className="text-white" />
                        </button>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-1 h-[8vh] bg-gray-800">
                    <div className="w-[70%] mx-4">
                        <input
                            type="text"
                            placeholder="Type here"
                            {...register("message")}
                            className="border border-gray-700 rounded-xl outline-none mt-1 px-4 py-3 w-full"
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className={`${imagePreview ? "text-blue-500" : "text-gray-400"} hover:text-blue-500 transition-colors`}
                    >
                        <FaImage className="text-3xl mr-6 ml-2"/>
                    </button>
                    <button 
                        type="submit"
                        disabled={sendMessageLoading}
                        className={`${(!register("message") && !selectedImage) ? "text-gray-500" : "text-blue-500"} hover:text-blue-600 transition-colors`}
                    >
                        <IoSend className="text-3xl" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Sendtext;