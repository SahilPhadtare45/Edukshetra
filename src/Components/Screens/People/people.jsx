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
import { collection, query, where, getDoc, updateDoc, doc,addDoc } from "firebase/firestore";

const People = () => {
     const { currentSchool } = useUserStore();
     const [members, setMembers] = useState([]);
     const [filteredMembers, setFilteredMembers] = useState([]); // For search results
     const [searchQuery, setSearchQuery] = useState("");

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
                    const timestamp = schoolData.createdAt?.seconds || Date.now(); // Use created timestamp or fallback
    
                    let updatedMembers = schoolData.members.map((member, index) => {
                        if (!member.memberId,member.memberId === "") {
                            return {
                                ...member,
                                memberId: `${timestamp.toString().slice(-6)}${(index + 1).toString().padStart(4, "0")}`
                            };
                        }
                        return member;
                    });
    
                    setMembers(updatedMembers);
                    setFilteredMembers(updatedMembers); // Initialize filtered members

                    // ✅ Only update Firestore if changes are made
                if (JSON.stringify(updatedMembers) !== JSON.stringify(schoolData.members)) {
                    await updateDoc(schoolRef, { members: updatedMembers });
                    console.log("Member IDs updated in Firestore!");
                }
            } else {
                console.log("No such school exists!");
            }
        } catch (error) {
            console.error("Error fetching members:", error.message);
        }
    };
    
        fetchMembers();
    }, [currentSchool]);
    console.log("Current School Data:", currentSchool);
    console.log("Current User Role:", currentSchool?.userRole);
    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member =>
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.memberId.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(filtered);
        }
    };

    const handleDelete = async (memberUid) => {
        if (currentSchool.userRole !== "Admin") {
            alert("You do not have permission to remove members!");
            return;
        }
    
        if (!currentSchool || !currentSchool.schoolId) {
            console.log("No school selected.");
            return;
        }
    
        try {
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnap = await getDoc(schoolRef);
    
            if (schoolSnap.exists()) {
                let schoolData = schoolSnap.data();
    
                // Remove the selected member from the members array
                let updatedMembers = schoolData.members.filter(member => member.uid !== memberUid);
                await updateDoc(schoolRef, { members: updatedMembers });
    
                 // Get the user's document from Users collection
            const userRef = doc(db, "Users", memberUid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                let userData = userSnap.data();

                // Remove only the current school from schoolData
                let updatedSchoolData = userData.schoolData.filter(school => school.schoolId !== currentSchool.schoolId);

                await updateDoc(userRef, {
                    schoolData: updatedSchoolData.length > 0 ? updatedSchoolData : null, // Keep other schools, remove only this one
                    deletedSchool: updatedSchoolData.length > 0 ? updatedSchoolData[0].schoolId : null // Assign a new school or null if none left
                });

                console.log("Member removed from school and Users collection!");
            }
                // Update state to reflect changes
                setMembers(updatedMembers);
                setFilteredMembers(updatedMembers);
                console.log("Member removed successfully!");
            }
        } catch (error) {
            console.error("Error removing member:", error.message);
            alert("Failed to remove member. Please try again.");
        }
    };
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
                        <input type="text" class="form-control nameinsr " id="floatingInput" placeholder="Search" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}/>
                        <label  for="floatingInput">Search&nbsp;<FontAwesomeIcon icon={faSearch} /></label>
                        <button class="btn btn-outline-secondary srbtn" type="button" id="button-addon1" onClick={handleSearch}>Search</button>
                    </div>
                
                    <div className='table_title' style={{display:"flex"}}>
                        <div style={{marginLeft:'4%',marginTop:'1%',fontWeight:'bold'}}>EMAIL</div>
                        <div style={{marginLeft:'54.5%',marginTop:'1%',fontWeight:'bold'}}>ID</div>
                    </div>
                    {/* Members List */}
                    <div className='tr_section'>
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member,index) => (
                                <div key={member.uid} className='table_row'>
                                    <ul className="list-group list-group-flush llist">
                                        <li className="li-item">
                                            <img className='people_img' src={acclogo} alt="profile" />
                                            <div className="item-text text-truncate">{member.email}</div>
                                            <div className='sub_name text-truncate'>{member.memberId}</div>

                                            {/* Show delete icon only if the current user is an admin */}
                                            {currentSchool.userRole === "Admin" && (
                                                <FontAwesomeIcon 
                                                    className='trash_icon' 
                                                    icon={faTrash} 
                                                    onClick={() => handleDelete(member.uid)}
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