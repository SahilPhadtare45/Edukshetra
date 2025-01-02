import './viewmarks.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark,faSearch } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from "react";
const Viewmarks = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false); // Hides the container
    };
    return ( 
        isVisible && (
            <div className="viewmarksbg">
                <div className="viewmarks">
                <FontAwesomeIcon className="xicon" onClick={handleClose} icon={faCircleXmark} />
                    <div className="viewmarkstitle">Unit 1 Exanimation Marks</div>
                    <div className='marks'>
                        <div className='table_row'>
                            <ul class="list-group list-group-flush llist">
                                <li class="li-item">
                                    <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                                    <div className='sub_name text-truncate'>11/50</div>                               
                                </li>
                            </ul>
                        </div>
                        <div className='table_row'>
                            <ul class="list-group list-group-flush llist">
                                <li class="li-item">
                                    <div className="item-text text-truncate">IndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekhIndulekh </div>
                                    <div className='sub_name text-truncate'>11/50</div>                               
                                </li>
                            </ul>
                        </div>
                        <div className='total-percentage'>
                            <h5>Total Percentage : 50%</h5>
                        </div>
                    </div>
                </div>
            </div>
        
    
    ))};

export default Viewmarks;