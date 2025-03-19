import "./createform.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, setDoc, doc,updateDoc,arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../Firebase/userstore"; // Import Zustand store
import school from '../../../images/schoolimg.jpg';
import uploadImageToCloudinary from "../../../Firebase/upload";
import { generatePassword } from '../../../Firebase/services';

const Createform = () => {
    const [isVisible, setIsVisible] = useState(true);
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

        if (!currentUser) {
            console.error("User is not authenticated.");
            return;
          }
        const db = getFirestore();

         // Upload the image to Firebase Storage
        const fileInput = document.getElementById("inputGroupFile04");
        const file = fileInput.files[0];
        let logoUrl = school;

        if (file) {
            try {
                // Use the new uploadImage function
                logoUrl = await uploadImageToCloudinary(file, currentUser.uid);
                console.log("Image uploaded successfully:", logoUrl); // Check if URL is generated

            } catch (error) {
                console.error("Error uploading image:", error);
                return;
            }
        }
      // Generate a schoolId using userId and timestamp
      const schoolId = `${currentUser.uid}-${Date.now()}`;

      // Generate a unique 6-character password for the school
        const schoolPassword = generatePassword();

    // Save school data
    const schoolData = {
      schoolId: schoolId, // Store the unique school ID
      userId: currentUser.uid, // Add userId to associate with the user
      createdBy: currentUser.name,
      schoolName: schoolName,
      shortForm: shortForm,
      phone: schoolPhone,
      schoolemail: schoolEmail,
      createdAt: new Date(),
      logoUrl: logoUrl, // Use the uploaded logo or a default
      userRole: "Admin",
      password: schoolPassword, // Include the generated password
    };

    try {
        const schoolRef = doc(db, "schools", schoolId);
        await setDoc(schoolRef, schoolData);

         // Update user's schoolData array in the "Users" collection
         const userRef = doc(db, "Users", currentUser.uid);
         await updateDoc(userRef, {
             schoolData: arrayUnion(schoolData),
         });
        // Add the new school to Zustand store
        useUserStore.getState().addSchool(schoolData);

        setIsVisible(false); // Hide the form
        console.log("School added successfully.");
        console.log("School password:", schoolPassword); // Log the password for debugging (remove in production)
    } catch (error) {
        console.error("Error saving school data:", error);
    }
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


