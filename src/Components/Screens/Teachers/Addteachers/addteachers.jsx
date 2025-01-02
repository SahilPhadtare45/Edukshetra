import './addteachers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark,faSearch } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
import acclogo from '../../../../images/acclogo.png';
const Addteachers = () => {
    const [isVisible, setIsVisible] = useState(true);
    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    return ( 
        isVisible && (
            <div className="addteachersbg">
        <div className="addteachers">
           <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
            <div className="addteacherstitle">Add Teachers</div>
            <label for="formGroupExampleInput" class="form-label lbl">Enter Mail</label>
            <div class="form-floating mb-3 name">               
                <input type="text" class="form-control nameinsr " id="floatingInput" placeholder="Search"/>
                <label  for="floatingInput">Search&nbsp;<FontAwesomeIcon onClick={handleClose} icon={faSearch} />
                </label>
                <button class="btn btn-outline-secondary srbtn" type="button" id="button-addon1">Search</button>
            </div>
            <div className='sritems'>
                <div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div>  
                <div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div>      
                <div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div>
                <div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div><div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div><div className='srrow'>
                <img className='srimg'  src={acclogo} alt=""></img>
                <div className='srmail text-truncate'>sahilphadtare1045gmail.com</div>
                </div>
            </div>
            <button class="btn sradd" type="submit">Submit</button>         
        </div>
        </div>
        )
     );
}
 
export default Addteachers;