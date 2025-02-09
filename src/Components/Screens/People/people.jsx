import './people.css';
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import acclogo from '../../../images/acclogo.png';
import { useState, useEffect } from "react";
import { db, auth } from "../../../Firebase/firebase"; // Ensure correct Firebase imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash,faUser } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from "../../../Firebase/userstore"; // Zustand store
import { collection, query, where, getDoc, deleteDoc, doc,addDoc } from "firebase/firestore";

const People = () => {
     const { currentSchool } = useUserStore();
     const [members, setMembers] = useState([]);

     useEffect(() => {
        const fetchMembers = async () => {
          if (!currentSchool || !currentSchool.schoolId) {
            console.log("No school selected.");
            return;
          }
    
          try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnap = await getDoc(schoolRef);
    
            if (schoolSnap.exists()) {
              const schoolData = schoolSnap.data();
              setMembers(schoolData.members || []);
              console.log("Members fetched:", schoolData.members);
            } else {
              console.log("No such school exists!");
            }
          } catch (error) {
            console.error("Error fetching members:", error.message);
          }
        };
    
        fetchMembers();
      }, [currentSchool]);
    if (!currentSchool) {
        return <p>Loading...</p>;
    }
    return ( 
        <div className='peoplepage'>
            <Header/>
            <Sidebar/>
            <PageInfo/>
            <div className='people'>
                <div className='contain'>
                    <div class="form-floating mb-3 name">               
                        <input type="text" class="form-control nameinsr " id="floatingInput" placeholder="Search"/>
                        <label  for="floatingInput">Search&nbsp;<FontAwesomeIcon icon={faSearch} /></label>
                        <button class="btn btn-outline-secondary srbtn" type="button" id="button-addon1">Search</button>
                    </div>
                
                    <div className='table_title' style={{display:"flex"}}>
                        <div style={{marginLeft:'4%',marginTop:'1%',fontWeight:'bold'}}>EMAIL</div>
                        <div style={{marginLeft:'54.5%',marginTop:'1%',fontWeight:'bold'}}>ID</div>
                    </div>
                    {/* Members List */}
<div className='tr_section'>
{members.length > 0 ? (
    members.map((member) => (
            <div key={member.uid} className='table_row'>
                <ul className="list-group list-group-flush llist">
                    <li className="li-item">
                        <img className='people_img' src={acclogo} alt="profile" />
                        <div className="item-text text-truncate">{member.email}</div>
                        <div className='sub_name text-truncate'>{member.uid}</div>

                        {/* Show delete icon only if the current user is an admin */}
                        {currentSchool.userRole === "admin" && (
                            <FontAwesomeIcon 
                                className='trash_icon' 
                                icon={faTrash} 
                                
                                style={{ cursor: "pointer", color: "red" }}
                            />
                        )}
                    </li>
                </ul>
                <div className='navbarline1' />
            </div>
        ))
    ) : (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No members found.</p>
    )}
</div>
                </div>
            </div>
        </div>
     );
}
 
export default People;