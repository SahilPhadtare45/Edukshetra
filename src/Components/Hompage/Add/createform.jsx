import "./createform.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Createform = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    const navigate = useNavigate(); // Initialize navigate
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        // Perform form validation or API call here
        navigate("/dashboard"); // Navigate to the dashboard
    };
    return(
        isVisible && (
    <div className="createfrombg">
        <div className="createform">
        <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="createtitle">Setup your School Profile</div>
            <form onSubmit={handleSubmit}>
            <div class="input-group upload">
            <label for="formGroupExampleInput" class="form-label lbl1">Upload School pfp : </label>
                <input type="file" class="form-control uploadin" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"/>
            </div>
            <label for="formGroupExampleInput" class="form-label lbl">Enter School Name</label>
             <div class="form-floating mb-3 name">               
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput">Enter Name</label>
             </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter Shortfrom</label>              
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter here</label>
                <span class="input-group-text eg" id="basic-addon3">eg.N.E.H.S.</span> 
            </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter School's No.</label>
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter no.</label>
                <span class="input-group-text no" id="basic-addon3">+91</span> 
            </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter School's E-mail</label>
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter mail</label>
                <span class="input-group-text no" id="basic-addon3">gmail.com</span> 
            </div>

            <button class="btn submit"  type="submit">Submit</button>   
            </form>     
        </div>
    </div> 
        )       
    );
};

export default Createform


