import React, { useState, useRef, useEffect } from 'react';
import './homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faGear } from '@fortawesome/free-solid-svg-icons';
import Header from '../Comman/header';
import workplace from '../Hompage/workplace.jpg';
import Add from './Add/add.jsx';
import school from '../../images/schoolimg.jpg';
import desk from '../../images/deskbg.jpg';
import books from '../../images/download.jpg';
import { useUserStore } from "../../Firebase/userstore.js"; // Import Zustand store
import Createform from './Add/createform'; // Import the Createform component
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    const userSchools = useUserStore((state) => state.userSchools); // Get schools from Zustand store
    const [showAddComponent, setShowAddComponent] = useState(false);
    const [schools, setSchools] = useState(userSchools);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth); // Sign out from Firebase
            useUserStore.getState().clearUser(); // Clear Zustand store
            navigate("/")
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    const handleNavClick = (index) => {
        setActiveIndex(index);
    };
    // This function will handle adding a new school card with form data
     const handleAddSchool  = (newSchool) => {
        setSchools((prevSchools) => [...prevSchools, newSchool]);
    };
     // Random image selection function
     const getRandomImage = () => {
        const images = [workplace, desk, books]; // List of images
        const randomIndex = Math.floor(Math.random() * images.length); // Get random index
        return images[randomIndex]; // Return the selected image
    };

    useEffect(() => {
        // Fetch user's schools when the component mounts
        const fetchSchools = async () => {
            const currentUser = useUserStore.getState().currentUser;
            if (currentUser) {
                await useUserStore.getState().fetchUserSchools(currentUser.uid);
            }
        };

        fetchSchools();
    }, []);
    useEffect(() => {
        if (navItemsRef.current[activeIndex]) {
            const { offsetLeft, offsetWidth } = navItemsRef.current[activeIndex];
            setUnderlineStyle({
                left: offsetLeft, // Position relative to the parent container
                width: offsetWidth, // Match the underline width to the active item
            });
        }
    }, [activeIndex]);

     
    return (
        <>
        <div className="homepage">
            
        <Header/>
        
            <nav className="navbar navbar-expand-lg">
                
                <div className="container-fluid">
                    <ul className="navbar-nav">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      
                        {['All', 'Admin', 'Teachers', 'Students'].map((item, index) => (
                            <li
                                key={index}
                                className={`nav-item navtext ${activeIndex === index ? 'active' : ''}`}
                                ref={(el) => (navItemsRef.current[index] = el)}
                                onClick={() => handleNavClick(index)}
                            >
                                <a className="nav-link" href="#">{item}</a>
                            </li>
                        ))}
                        </div>
                    </ul>
                </div>
                <div className="active-underline md-none" style={underlineStyle}></div>
                <FontAwesomeIcon className="plusicon" onClick={() => setShowAddComponent((prev) => !prev)} icon={faPlus} />
                <FontAwesomeIcon className="gearicon" onClick={handleLogout} icon={faGear} />
            </nav>
            {showAddComponent && <Add />}
            <div className="navbar-line"></div>

            <div class="list-group">
                <ul className="container maincon">
                    {userSchools.length === 0 ? (
                            <p>No schools joined yet</p>
                    ) : (
                        userSchools.map((school, index) => (
                            <li className='card concard' key={index}>                    
                                <img src={getRandomImage()} className="card-img cardimg d-none d-md-block" alt="..." />                       
                                <div className="card-img-overlay">
                                <h5 className="card-text role"><small>Role:Admin</small></h5>
                                <div className="card-title title text-truncate">{school.name}</div>
                                <div style={{display:'flex'}}>
                                    <img className="school-logo" src={school} alt='...'/>
                                    <h5 className="card-text shortform">{school.shortForm}</h5>
                                </div>
                                </div>                        
                            </li>                   
                        ))
                    )}              
                </ul>
            </div>
        </div>
        </>
    );
};

export default Homepage;
