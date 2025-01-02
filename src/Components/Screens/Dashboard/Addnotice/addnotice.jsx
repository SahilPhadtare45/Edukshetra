import './addnotice.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
const Addnotice = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    return ( 
        isVisible && (
            <div className="addnoticebg">
        <div className="addnotice">
        <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="addnoticetitle">Add Notice</div>
            <label for="formGroupExampleInput" class="form-label lbl">Enter here</label>
            <textarea id="customParagraphInput" className="form-control name" placeholder="Type your paragraph here..."/>       

            <p>To:</p>
            <div className="To-dropdowns">
                <select>
                    <option value="All">All</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Students">Students</option>            
                </select>
            </div>      

            <button class="btn sub1" type="submit">Submit</button>
        </div>
        </div>
        )
     );
}
 
export default Addnotice;