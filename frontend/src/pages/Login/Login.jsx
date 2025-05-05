import React, { useState } from "react";
import "./Login.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomizedSwitches from "../../components/appLayout/toggleTheme";
import image from "../../assets/image.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Password:", password);

        // Uncomment when backend ready:
        /*
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
        */
    };

    return (
        <div className="login-container">
            <p><CustomizedSwitches/></p>
            <div className="overlay"></div>
            <div className="login-card">
                <div className="card-image-section">
                    <img
                        src={image}
                        alt="Bakery inside"
                        className="card-image"
                    />
                </div>
                <div className="card-form-section">
                    <h2>Bakery Bliss Login</h2>
                    <p>Freshness at your fingertips!</p>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div 
                                className="toggle-password" 
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </div>
                        </div>
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
