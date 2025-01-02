import './joinform.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
const Joinform = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    return ( 
        isVisible && (
            <div className="joinfrombg">
        <div className="joinform">
        <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="jointitle">Join your School</div>
            <label for="formGroupExampleInput" class="form-label lbl">Enter Your Name</label>
             <div class="form-floating mb-3 name">               
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput">Enter Name</label>
             </div>

            <label for="formGroupExampleInput" class="form-label lbl">Enter Code here</label>              
            <div class="form-floating mb-3 name">                      
                <input type="text" class="form-control namein " id="floatingInput" placeholder="Enter Name"/>
                <label  for="floatingInput" className="en">Enter here</label>
                <span class="input-group-text eg" id="basic-addon3">eg.XUVcdc</span> 
            </div>

            <button class="btn sub1" type="submit">Submit</button>
        </div>
        </div>
        )
     );
}
 
export default Joinform;