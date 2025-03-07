import React, { useState, useRef, useEffect } from 'react';
import './homepage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus,faGear,faCopy } from '@fortawesome/free-solid-svg-icons';
import Header from '../Comman/header';
import workplace from '../Hompage/workplace.jpg';
import Add from './Add/add.jsx';
import desk from '../../images/deskbg.jpg';
import books from '../../images/download.jpg';
import { useUserStore } from "../../Firebase/userstore.js"; // Import Zustand store
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../../Firebase/firebase";


const Homepage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navItemsRef = useRef([]);
    
    const { userSchools, fetchUserSchools, currentUser,currentSchool,fetchRoleForSchool,setRole,schoolData,currentRole } = useUserStore();
    const [showAddComponent, setShowAddComponent] = useState(false);
    const navigate = useNavigate();
    const setCurrentSchool = useUserStore((state) => state.setCurrentSchool); // Zustand action

    const handleSchoolClick = async (school) => {
        if (!school || !school.schoolId) {
            console.error("Invalid school data:", school);
            return;
        }
    
        const currentSchool = useUserStore.getState().currentSchool;
    
        if (currentSchool?.schoolId === school.schoolId) {
            console.log("School already selected. Updating role...");
        } else {
            setCurrentSchool(school);
        }
    
        try {
            // ✅ Pass both `school.schoolId` and `currentUser?.uid`
            const userRole = await fetchRoleForSchool(school.schoolId, currentUser?.uid);
            setRole(userRole);
    
            // ✅ Ensure navigation to dashboard
            navigate(`/dashboard`);
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
    };
    
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

    useEffect(() => {
        if (!currentUser) return;
    
        const schoolsQuery = query(collection(db, "schools"), where("members", "array-contains", currentUser.uid));
    
        const unsubscribe = onSnapshot(schoolsQuery, (querySnapshot) => {
            const schools = querySnapshot.docs.map((doc) => ({
                id: doc.id, 
                ...doc.data(),
            }));
    
            console.log("Updated Schools from Firestore:", schools); // Debugging log
    
            useUserStore.getState().setSchools(schools); // Update Zustand store
        });
    
        return () => unsubscribe(); // Cleanup listener
    }, [currentUser]);  


    useEffect(() => {
        if (currentUser && userSchools.length === 0) {
          fetchUserSchools(currentUser.uid);
        }
      }, [currentUser, fetchUserSchools, userSchools.length]);
     // Precompute images for schools
     const images = [workplace, desk, books];
     const schoolImages = userSchools.map((_, index) => images[index % images.length]); // Cyclic assignment
 
    useEffect(() => {
        if (navItemsRef.current[activeIndex]) {
            const { offsetLeft, offsetWidth } = navItemsRef.current[activeIndex];
            setUnderlineStyle({
                left: offsetLeft, // Position relative to the parent container
                width: offsetWidth, // Match the underline width to the active item
            });
        }
    }, [activeIndex]);

    console.log("userSchools:", userSchools, "Type:", typeof userSchools);

    useEffect(() => {
    if (currentUser) {
        useUserStore.getState().fetchUserSchools(currentUser.uid);
    }

    return () => {
        const unsubscribe = useUserStore.getState().unsubscribeFetchUserSchools;
        if (unsubscribe) {
            unsubscribe(); // Cleanup Firestore listener
        }
    };
}, [currentUser]);

useEffect(() => {
    if (currentUser?.uid) {
        fetchUserSchools(currentUser.uid);
    }
}, [currentUser]);



const getUserRole = (school) => {
    if (!school || !school.members || !Array.isArray(school.members)) {
      console.log("School data missing or incorrect:", school);
      return "Unknown";
    }
  
    const member = school.members.find(m => m.uid === currentUser?.uid);
  
    if (!member) {
      console.log(`User ${currentUser?.uid} not found in members`, school.members);
      return "Not a Member";
    }
  
    return member.userRole || "Unknown";
  };
  
    return (
        <>
        <div className="homepage">            
            <Header/>        
                <nav className="navbar navbar-expand-lg">            
                    <div className="container-fluid">
                        <ul className="navbar-nav">
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                             aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            
                                {['All', 'Admin', 'Teachers', 'Students'].map((item, index) => (
                                    <li key={index} className={`nav-item navtext ${activeIndex === index ? 'active' : ''}`}
                                    ref={(el) => (navItemsRef.current[index] = el)} onClick={() => handleNavClick(index)}>
                                        <a className="nav-link" href="#">{item}</a>
                                    </li>
                                ))}
                            </div>
                        </ul>
                    </div>
                    <div className="active-underline md-none" style={underlineStyle}/>
                    <FontAwesomeIcon className="plusicon" onClick={() => setShowAddComponent((prev) => !prev)} icon={faPlus} />
                    <FontAwesomeIcon className="gearicon" onClick={handleLogout} icon={faGear} />
                </nav>
            {showAddComponent && <Add />}
            <div className="navbar-line"/>
            <div class="list-group">
            <ul className="container maincon">
    {(!userSchools || !Array.isArray(userSchools) || userSchools.length === 0) ? (
        <p>No schools joined yet</p>
    ) : (
        userSchools.map((school, index) => (

                              <li className="card concard" key={index} onClick={() => handleSchoolClick(school)}>                    
                                <img src={schoolImages[index]} className="card-img cardimg d-none d-md-block" alt="..." />                       
                                <div className="card-img-overlay">
                                  <div className='share_code'>
                                    Password: <strong>{school.password || "Not available"}</strong>
                                  </div>
                      
                                  {/* Dynamically Display User Role */}
                                  <h5 className="card-text role">
                                    <small>Role: {school.userRole || "Unknown"}</small>
                                  </h5>
                      
                                  <div className="card-title title text-truncate">{school.schoolName}</div>
                                  <div style={{ display: 'flex' }}>
                                    <img className="school-logo" src={school.logoUrl} alt="..." />
                                    <h5 className="card-text shortform">{school.shortForm}</h5>
                                  </div>
                                </div>                        
                              </li>  
        )))                 
                          }
                                      
                      </ul>
            </div>
        </div>
        </>
    );
};

export default Homepage;
