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
import { collection, query, where, getDocs, deleteDoc, doc,addDoc } from "firebase/firestore";

const People = () => {
    const [members, setMembers] = useState([]);
    const currentUser = useUserStore((state) => state.currentUser);
    const userSchools = useUserStore((state) => state.userSchools) || [];  
    // Get the first school the user is associated with (assuming single school for now)
     const schoolId = userSchools.length > 0 ? userSchools[0].schoolId : null;
     const userRole = userSchools.length > 0 ? userSchools[0].userRole : "";
      const generateUserId = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };
    useEffect(() => {
        const fetchMembers = async () => {
            if (!schoolId) return;

            const schoolRef = collection(db, "schools");
            const schoolSnap = await getDocs(schoolRef);

            schoolSnap.docs.forEach(doc => {
                if (doc.id === schoolId) {
                    const data = doc.data();
                    if (data.members) {
                        console.log(`Members for School ID ${schoolId}:`, data.members);
                        setMembers(data.members); // ✅ Store members in state
                    } else {
                        console.log(`No members found for School ID ${schoolId}`);
                    }
                }
            });
        };

        fetchMembers();
    }, [schoolId]); // Re-run when schoolId changes


     // Function to add a new member
    const handleAddMember = async (email, phone) => {
        if (!schoolId || !email || !phone) {
            console.error("Missing schoolId, email, or phone");
            return;
        }
    

        try {
            const newMember = {
                email,
                phone,
                userId: generateUserId(), // Generate 10-digit ID
                role: "Guest", // Default role
                joinedAt: new Date()
            };

            const docRef = await addDoc(collection(db, "schools", schoolId, "members"), newMember);
            console.log("New member added:", { id: docRef.id, ...newMember });

            setMembers([...members, { id: docRef.id, ...newMember }]);
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    // Delete Member Function (Only Admins Can Delete)
    const handleDelete = async (memberId) => {
        if (userRole !== "admin") return;

        try {
            await deleteDoc(doc(db, "schools", schoolId, "members", memberId));
            setMembers(members.filter(member => member.id !== memberId));
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    };
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
                    <div className='tr_section'>
                        {members.map((member) => (
                            <div key={member.id} className='table_row'>
                                <ul className="list-group list-group-flush llist">
                                    <li className="li-item">
                                        <img className='people_img' src={acclogo} alt=""/>
                                        <div className="item-text text-truncate">{member.email ? member.email : "No Email"}</div>
                                        <div className='sub_name text-truncate'>{member.userId}</div>

                                        {/* Show delete icon only if the current user is an admin */}
                                        {userRole === "admin" && (
                                            <FontAwesomeIcon 
                                                className='trash_icon' 
                                                icon={faTrash} 
                                                onClick={() => handleDelete(member.id)} 
                                                style={{ cursor: "pointer", color: "red" }}
                                            />
                                        )}
                                    </li>
                                </ul>
                                <div className='navbarline1' />
                            </div>
                             
                        ))}
                       
         
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default People;