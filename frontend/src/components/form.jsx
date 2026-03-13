import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const formName = method === "login" ? "Login" : "Register";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await api.post(route, {
                username: username.trim(),
                password,
            });

            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            const detail = error.response?.data?.detail;
            const firstFieldError = Object.values(error.response?.data || {})[0]?.[0];
            setErrorMessage(detail || firstFieldError || "Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{formName}</h1>
        <input
            className="form-input"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
        />
        <input
            className="form-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
        />

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {loading && <LoadingIndicator />}
        <div className="form-actions">
            <button type="submit" className="form-button">
                {formName}
            </button>
            {method === "login" && (
                <button type="button" className="form-button form-button--secondary" onClick={() => navigate("/register")}>
                    Register
                </button>
            )}
        </div>
    </form>;
}

export default Form;