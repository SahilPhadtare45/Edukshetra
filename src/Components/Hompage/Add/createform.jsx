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
    const [nameError, setNameError] = useState("");

    const [shortForm, setShortForm] = useState("");
    const [shortFormInputError, setShortFormInputError] = useState("");

    const [schoolPhone, setSchoolPhone] = useState("");
    const [schoolPhoneError, setSchoolPhoneError] = useState("");

    const [schoolEmail, setSchoolEmail] = useState("");

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        // Set the role to 'admin' when the user is creating a school
     // Final validation before submitting
        const isValid = /^[A-Za-z\s]*$/.test(schoolName);
        if (!isValid) {
            setNameError("❌ Only alphabets and spaces are allowed");
            return; // ⛔ STOP if invalid
        }

        if (schoolName.length > 20) {
            setNameError("❌ Maximum 20 characters allowed");
            return; // ⛔ STOP if too long
        }

        setNameError(""); // ✅ Clear error if valid
            if (!currentUser) {
                console.error("User is not authenticated.");
                return;
            }
        
          const isShortFormValid = /^[A-Za-z._]*$/.test(shortForm);

          if (!isShortFormValid) {
            setShortFormInputError("❌ Only alphabets, dots (.) and underscores (_) are allowed.");
            return;
          }
        
          if (shortForm.length > 20) {
            setShortFormInputError("Maximum 20 characters allowed.");
            return;
          }
        
          setShortFormInputError(""); // All good, clear errors
          if (!/^[0-9]{10}$/.test(schoolPhone)) {
            setSchoolPhoneError("Phone number must be exactly 10 digits.");
            return;
          }

          if (!/^[0-9]{10}$/.test(schoolPhone)) {
            setSchoolPhoneError("❌ Number must be exactly 10 digits and numeric");
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
            {nameError && <p style={{ color: "red", marginTop: "-28px",marginLeft:"55%", fontSize:"14px",position:"absolute" }}>{nameError}</p>}

             <div class="form-floating mb-3 name">               
                <input type="text" class="form-control namein "  
                onChange={(e) => {
                    const input = e.target.value;
                    setSchoolName(input);

                    // Validation logic
                    const isValid = /^[A-Za-z\s]*$/.test(input);
                    if (!isValid) {
                        setNameError("Only alphabets and spaces are allowed");
                    } else if (input.length > 20) {
                        setNameError("Maximum 20 characters allowed");
                    } else {
                        setNameError(""); // ✅ Valid input
                    }
                    }}
                    maxLength={30} // Slightly more input allowed but logic limits to 20
                    minLength={2}
                    id="floatingInput" placeholder="Enter Name" required/>
                    <label  for="floatingInput">Enter Name</label>
            </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter Shortfrom</label>              
            <div className="form-floating mb-3 name">
                <input
                    type="text"
                    className="form-control namein"
                    id="floatingInput"
                    placeholder="Enter Shortform"
                    value={shortForm}
                    onChange={(e) => {
                    const input = e.target.value;
                    setShortForm(input);

                    const isValid = /^[A-Za-z._]*$/.test(input); // only letters, dot, underscore

                    if (!isValid) {
                        setShortFormInputError("Only alphabets, dots (.) and underscores (_) are allowed.");
                    } else if (input.length > 20) {
                        setShortFormInputError("Maximum 20 characters allowed.");
                    } else {
                        setShortFormInputError("");
                    }
                    }}
                    maxLength={30}
                    minLength={2}
                    required
                />
                <label htmlFor="floatingInput">Enter here</label>
                <span className="input-group-text eg" id="basic-addon3">eg. N.E.H.S.</span>
            </div>

            {shortFormInputError && (
            <p style={{ color: "red", marginTop: "-98px",marginLeft:"40%", fontSize:"14px",position:"absolute" }}>{shortFormInputError}</p>
            )}

            <label for="formGroupExampleInput" class="form-label lbl">Enter Phone No.</label>              

            <div className="form-floating mb-3 name">
            <input
                type="text"
                className="form-control namein"
                id="floatingInput"
                placeholder="Enter Phone Number"
                value={schoolPhone}
                onChange={(e) => {
                const input = e.target.value;
                setSchoolPhone(input);

                const isNoValid = /^[0-9]*$/.test(input);
                if (!isNoValid) {
                    setSchoolPhoneError("Only numeric digits (0-9) are allowed.");
                } else if (input.length !== 10) {
                    setSchoolPhoneError("Phone number must be exactly 10 digits.");
                } else {
                    setSchoolPhoneError(""); // Clear errors
                }
                }}
                maxLength={10}
                minLength={10}
                required
            />
            <label htmlFor="floatingInput" className="en">Enter no.</label>
            <span className="input-group-text no" id="basic-addon3">+91</span>
            </div>

            {schoolPhoneError && (
            <p style={{ color: "red", marginTop: "-98px",marginLeft:"58%", fontSize:"14px",position:"absolute" }}>{schoolPhoneError}</p>
            )}



            <label for="formGroupExampleInput" class="form-label lbl">Enter School's E-mail</label>
            <div class="form-floating mb-3 name">                      
                <input type="email" className="form-control namein " onChange={(e) => setSchoolEmail(e.target.value)} id="floatingInput" placeholder="Enter Name"  maxLength={40} minLength={5} required/>
                <label  for="floatingInput" className="en">Enter mail</label>
                <span className="input-group-text no" id="basic-addon3">eg.gmail.com</span> 
            </div>

            <button class="btn-submit"  type="submit">Submit</button>   
            </form>     
        </div>
    </div> 
        )       
    );
};

export default Createform


