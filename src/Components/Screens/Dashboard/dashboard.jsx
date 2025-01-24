import "./dashboard.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar"
import PageInfo from "../../Comman/pageinfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useRef, useEffect } from 'react'; 
import Addnotice from "./Addnotice/addnotice";
import { useParams } from 'react-router-dom';
import { useUserStore } from "../../../Firebase/userstore"; // Import Zustand store
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../Firebase/firebase";
const Dashboard = () => {
    const  [addMode, setAddMode] = useState(false);
    const { schoolId } = useParams(); // Get schoolId from the URL params
    const currentUser = useUserStore((state) => state.currentUser); // Get current user data
    const setSchoolData = useUserStore((state) => state.setSchoolData); // Function to set school data in Zustand
    const schoolData = useUserStore((state) => state.schoolData); // Get school data from Zustand

    useEffect(() => {
        // Fetch school data based on schoolId
        if (schoolId && currentUser) {
            fetchSchoolData(schoolId);
        }
    }, [schoolId, currentUser]);

     // Fetch school data from Firebase
    const fetchSchoolData = async (schoolId) => {
        try {
            // Fetch the school data from Firestore using schoolId
            const docRef = doc(db, "schools", schoolId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                // Set the school data in Zustand
                setSchoolData(docSnap.data());
            } else {
                console.warn("No school data found!");
            }
        } catch (error) {
            console.error("Error fetching school data:", error);
        }
    };

    return ( 
       
<div className="dashboard">
                <Header/>
                <Sidebar/>
                <PageInfo/>
        
                <div className="classes">
                    <div className="classes-title">Classes</div>
                    <div className="class-no">
                        <div className="class-dropdowns">
                            <select>
                                <option value="All">All</option>
                                <option value="1st">1st</option>
                                <option value="2nd">2nd</option>
                                <option value="3rd">3rd</option>
                                <option value="4th">4th</option>
                                <option value="5th">6th</option>
                                <option value="6th">6th</option>
                                <option value="7th">7th</option>
                                <option value="8th">8th</option>
                                <option value="9th">9th</option>
                                <option value="10th">10th</option>
                            </select>
                        </div>                    
                    </div>
                </div>
                <div className="teachers">
                    <div className="teachers-title">Teachers</div>
                    <div className="teachers-no">12</div>
                </div>
                <div className="students">
                <div className="students-title">Students</div>
                <div className="students-no">29</div>
                </div>
                <div className="complaints">
                    <div className="complaints-title"> Complaints</div>
                    <div className="complaints-no">2</div>
                </div>
    <div className="notice">
        <div className="notice-header">
            <div className="notice-title">Notice</div>
            <FontAwesomeIcon className="nicon" icon={faAdd} onClick={() => setAddMode((prev) => !prev)} />
        </div>
        {addMode && <Addnotice />}
        <div className="notice-list">
        <ul class="list-group list-group-flush">
            <li class="list-group-item item">
                <div className="item-text">An </div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
            <li class="list-group-item item">
                <div className="item-text">An item</div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
            <li class="list-group-item item">
                <div className="item-text">An item</div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
            <li class="list-group-item item">
                <div className="item-text">An item</div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
            <li class="list-group-item item">
                <div className="item-text">An item</div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
            <li class="list-group-item item">
                <div className="item-text">An item</div>
                <FontAwesomeIcon className="icon" icon={faTrash}/>
            </li>
        </ul>
        </div>
    </div>
</div> 
    );
}
 
export default Dashboard;