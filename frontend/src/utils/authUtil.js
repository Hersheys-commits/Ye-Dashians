import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import axios from "axios";
import toast from "react-hot-toast";

const useGoogleAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleSignIn = async (tokenId) => {
        try {
            const res = await axios.post(
                "http://localhost:4001/api/users/google-login",
                { tokenId },
                { withCredentials: true }
            );
            console.log("dataform", res);
            if (res?.data?.data?.error == "email exists") {
                toast.error("Email already exists. Try signing in.");
                return res;
            }
            dispatch(
                login({
                    user: res.data.data.user,
                    accessToken: res.data.data.accessToken,
                })
            );

            localStorage.setItem("user", JSON.stringify(res.data.data)); // Store user data properly
            return res; // Return response for further use
        } catch (error) {
            console.log(
                "Error during Google sign-in:",
                error.response?.data?.message || error.message
            );
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await handleGoogleSignIn(credentialResponse.credential);

            if (res?.data?.data?.error !== "email exists") {
                if (res.data.data?.first == false) navigate("/");
                else navigate("/questionnaire");
            }
        } catch (error) {
            console.error("Google sign-in error:", error.message);
        }
    };

    const handleGoogleFailure = (error) => {
        console.error(
            "Google Sign In was unsuccessful. Try again later",
            error
        );
    };

    return { handleGoogleSuccess, handleGoogleFailure };
};

export default useGoogleAuth;
