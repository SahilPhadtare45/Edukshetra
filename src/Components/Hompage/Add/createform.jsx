import "./createform.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { useUserStore } from "../../../Firebase/userstore"; // Import Zustand store
const Createform = () => {
    const [isVisible, setIsVisible] = useState(true);
    const setUserRole = useUserStore((state) => state.setUserRole); // Get the setUserRole function from the store
    const currentUser = useUserStore((state) => state.currentUser); // Get current user from Zustand
    const [schoolName, setSchoolName] = useState("");
    const [shortForm, setShortForm] = useState("");
    const [schoolPhone, setSchoolPhone] = useState("");
    const [schoolEmail, setSchoolEmail] = useState("");

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        // Set the role to 'admin' when the user is creating a school
        setUserRole('admin');
        if (!currentUser) {
            console.error("User is not authenticated.");
            return;
          }
        const db = getFirestore();

    // Save school data
    const schoolData = {
      userId: currentUser.uid, // Add userId to associate with the user
      name: schoolName,
      shortForm: shortForm,
      phone: schoolPhone,
      email: schoolEmail,
      createdAt: new Date(),
      logoUrl: "school_logo_url_here", // You can implement image upload if needed
    };

    const schoolRef = doc(db, 'schools', `${currentUser.uid}-${Date.now()}`); // Unique ID
    await setDoc(schoolRef, schoolData);

    setIsVisible(false); // Hides the container
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
                <input type="text" class="form-control namein " onChange={(e) => setSchoolName(e.target.value)} id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput">Enter Name</label>
             </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter Shortfrom</label>              
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " onChange={(e) => setShortForm(e.target.value)} id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter here</label>
                <span class="input-group-text eg" id="basic-addon3">eg.N.E.H.S.</span> 
            </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter School's No.</label>
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " onChange={(e) => setSchoolPhone(e.target.value)} id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter no.</label>
                <span class="input-group-text no" id="basic-addon3">+91</span> 
            </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter School's E-mail</label>
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " onChange={(e) => setSchoolEmail(e.target.value)} id="floatingInput" placeholder="Enter Name"/>
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


