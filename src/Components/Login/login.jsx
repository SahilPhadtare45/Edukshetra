import React, { useState } from "react";
import "./login.css";
import greenarrow from "../../images/greenarrow.png";
import schoolbg1 from "../../images/schoolbg.png";
import classbg from "../../images/classbg.jpg";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-solid-svg-icons';
const Login = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentBg, setCurrentBg] = useState(schoolbg1);
    const navigate = useNavigate(); // Initialize navigate
        const handleLogin = (e) => {
            e.preventDefault(); // Prevent default form submission behavior
            // Perform form validation or API call here
            navigate("/home"); // Navigate to the dashboard
        };
    const toggleFlip = () => {
      setIsFlipped(!isFlipped);
      // Change the background with sliding effect
      setTimeout(() => {
        setCurrentBg(isFlipped ? schoolbg1 : classbg);
      }, 100); // Matches the CSS transition duration
    };
return ( 
  <div className="login" style={{ backgroundImage: `url(${currentBg})` }}>
      <div className="flip-card-container">
          <div className="tri"></div>
              <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
                  <div className="back-container">
                    <button className="rightmiddle" onClick={toggleFlip}>{!isFlipped ? "Signup" : "Login"}</button>
                  </div>
                  <div className="card-front">
                  {/* Front: Login Form */}
                  <div className="middle">Login</div>
                  <form className="form">
                        <div class="form-floating mb-3 subin  ">               
                                  <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Email" required/>
                                  <label  for="floatingInput ">Enter Email</label>
                        </div>
                        <div class="form-floating mb-3 subin  ">               
                            <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Password" required/>
                            <label  for="floatingInput ">Enter Password</label>
                        </div>
                      <button type="submit" className="submit-button" onClick={handleLogin}>
                      Login
                      </button>
                  </form>
                  </div>

                  {/* Back: Signup Form */}
                  <div className="card-back">
                  <div className="middle">SignUp</div>
                  <form className="form1"> 
                        <div class="form-floating mb-3 subin  ">               
                                  <input type="text" class="form-control box " id="floatingInput" placeholder="Name" required/>
                                  <label  for="floatingInput ">Name</label>
                        </div>
                        <div class="form-floating mb-3 subin  ">               
                                  <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Email" required/>
                                  <label  for="floatingInput ">Enter Email</label>
                        </div>
                        <div class="form-floating mb-3 subin  ">               
                                  <input type="text" class="form-control box " id="floatingInput" placeholder="Enter Password" required/>
                                  <label  for="floatingInput ">Enter Password</label>
                        </div>
                      <button type="submit" className="submit-button1">
                      Signup
                      </button>     
                  </form>
                  <div className="google-con" >
                  <div className="navbar-line"></div>
                    <p>or</p>
                    <div className="navbar-line"></div>
                  </div>
                  <button className="google-btn">
                  G
                  </button>
                  </div>
              </div>
          </div>
  </div>
);
}
 
export default Login;