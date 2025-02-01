import React from 'react'
import { IoSend } from "react-icons/io5";
import useSendMessage from '../../../hooks/useSendMessage';
import { useForm } from 'react-hook-form';

function Sendtext() {
    const { sendMessageLoading, sendMessage } = useSendMessage();
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        if(data.message=="")return;
        await sendMessage(data.message);
        reset(); // This clears the form
    };

    return (
        <div>
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
                    <button type="submit">
                        <IoSend className="text-3xl" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Sendtext