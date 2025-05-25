import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../../Firebase/firebase"; // Ensure correct Firebase import
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import "./classwork.css";
import { useUserStore } from '../../../Firebase/userstore';

const Classwork = () => {
    
    const [classworkList, setClassworkList] = useState([]);
    const { currentUser, currentSchool, currentRole } = useUserStore();
    const navigate = useNavigate();
    console.log("📌 Zustand currentSchool:", currentSchool);
    console.log("📌 Zustand currentUser:", currentUser);
    console.log("📌 Zustand currentRole:", currentRole);
    
    useEffect(() => {
        console.log("🟢 useEffect triggered!");
    
        if (!currentSchool || !currentSchool.schoolId) {
            console.log("❌ currentSchool or schoolId is missing:", currentSchool);
            return;
        }
    
        console.log("🔍 Fetching data for schoolId:", currentSchool.schoolId);
    }, [currentSchool, currentUser, currentRole]);
    
    useEffect(() => {
        if (!currentSchool || !currentSchool.schoolId) return;

        const schoolRef = doc(db, "schools", currentSchool.schoolId);

        const unsubscribe = onSnapshot(schoolRef, (snapshot) => {
            if (!snapshot.exists()) {
                console.log("❌ No school document found!");
                setClassworkList([]);
                return;
            }

            const schoolData = snapshot.data();
            console.log("✅ Full School Data:", schoolData);

            const allClasswork = schoolData.classwork || [];
            console.log("📌 All Classwork Data:", allClasswork);

            // Find current user in members
const currentUserData = schoolData.members?.find((member) => member.uid === currentUser?.uid);
console.log("👤 Current User Data:", currentUserData);

// ✅ Fix: Allow Admins to see all classwork even if they're not in members
let filteredClasswork = [];

if (currentRole === "Admin") {
    console.log("🟢 Admin detected, displaying all classwork");
    filteredClasswork = allClasswork; // Admin sees everything
} else if (currentUserData) { 
    // ✅ If user exists in members, filter by their classes
    const userClasses = currentUserData.classes?.map((cls) => cls.className) || [];
    console.log("📌 User Classes:", userClasses);

    filteredClasswork = allClasswork.filter((cw) => {
        console.log(`🔍 Checking classwork ${cw.classworkTitle} assigned to:`, cw.to);
        return userClasses.includes(cw.to);
    });
} else {
    console.log("❌ User not found in members and is not an admin.");
    filteredClasswork = []; // If the user is missing from members and not admin, no access
}

console.log("✅ Filtered Classwork List:", filteredClasswork);
setClassworkList(filteredClasswork);
        });

        return () => unsubscribe();
    }, [currentSchool, currentUser, currentRole]);

    return (
        <div className="classworkpage">
            <Header />
            <Sidebar />
            <PageInfo />
            <div className="classwork">
                <div className="contain">
                {currentRole !== "Student" && (
                    <button className="createbg" onClick={() => navigate("/creatework")}>
                        <div className="cricon">
                            <FontAwesomeIcon className="createicon" icon={faPlus} />
                        </div>
                        <p>Create</p>
                    </button>
                )}
                <div className="work-container">
                    {classworkList.length > 0 ? (
                        classworkList.map((cw, index) => (
                            <div className="work-card" key={index} onClick={() => navigate(`/classwork/${cw.id}`)}>
                                <div className="head">
                                    <div className="content">{cw.assignedByEmail} posted a Classwork</div>
                                    <div className="timeposted">
                                        {new Date(cw.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="con-title">{cw.classworkTitle}</div>
                            </div>
                        ))
                    ) : (
                        <p>No classwork available</p>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default Classwork;
