import "bootstrap/dist/css/bootstrap.min.css";
import './header.css';
import acclogo from '../../images/acclogo.png';
import edulogo from '../../images/edulogo.png';
import { useUserStore } from "../../Firebase/userstore.js"; // Import Zustand store
import { useEffect,useState } from "react";
const Header = () => {
    const { currentUser,userSchools } = useUserStore(); // Access user data and loading state
    console.log("Current User in Header:", currentUser);

  

    return (         
        <div className="header">
            <div className="left-rec">
                <div className="logo"><img  src={ edulogo} alt=""></img></div>
                    <div className="tri-left"></div>
            </div>        
            <div className="parlelo">
                <div className="pfp">
                <img  src={acclogo} alt=""></img>
                </div>
                <div className="username text-truncate">{currentUser?.name || "User"}  </div>
                
                
            </div>
        </div>
     );
}
 
export default Header;