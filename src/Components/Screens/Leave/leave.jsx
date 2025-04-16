import React, { useState } from "react";
import "./leave.css";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import PageInfo from "../../Comman/pageinfo";
import { useUserStore } from "../../../Firebase/userstore";
import { db } from "../../../Firebase/firebase";
import { doc,getDoc,updateDoc,deleteDoc,arrayRemove, } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LeaveSchool = () => {
  const { currentUser, currentSchool, currentRole, setCurrentSchool } = useUserStore();
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const handleFinalConfirmation = async () => {
    try {
      const schoolId = currentSchool.schoolId;
      const schoolRef = doc(db, "schools", schoolId);
      const schoolSnap = await getDoc(schoolRef);
  
      if (!schoolSnap.exists()) {
        console.warn("School not found.");
        return;
      }
  
      const schoolData = schoolSnap.data();
      const members = schoolData.members || [];
  
      const memberUIDs = members.map((member) => member.uid);
      const adminUID = currentUser.uid;
  
      // ✅ Create a Set of all affected users including Admin
      const affectedUIDs = new Set([...memberUIDs, adminUID]);
  
      // ✅ Update schoolData of every affected user
      await Promise.all(
        Array.from(affectedUIDs).map(async (uid) => {
          const userRef = doc(db, "Users", uid);
          const userSnap = await getDoc(userRef);
  
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedSchoolData = (userData.schoolData || []).filter(
              (school) => school.schoolId !== schoolId
            );
  
            await updateDoc(userRef, {
              schoolData: updatedSchoolData,
            });
          }
        })
      );
  
      // ✅ Now delete the school
      await deleteDoc(schoolRef);
  
      // ✅ Clear local app state and navigate
      setCurrentSchool(null);
      navigate("/home");
      toast.success("School Removed Successfully");
    } catch (error) {
      console.error("Error removing school data:", error);
    }
  };
  
  

  return (
    <div className="leavepage">
        <Header />
        <Sidebar />
        <PageInfo />
    <div className="leave-school-page">
      <h2>Danger Zone</h2>

      <div className="danger-zone-box">
        {currentRole === "Admin" ? (
          <>
            <h3 className="danger-title">You are the Admin</h3>
            <p className="danger-warning">
              Leaving this school will <strong>permanently delete the school and all associated data</strong>, including:
            </p>
            <ul>
              <li>All students, teachers, and class records</li>
              <li>Attendance, marks, and assignments</li>
              <li>This action is <strong>irreversible</strong></li>
            </ul>
            <button
              className="danger-button"
              onClick={() => setConfirming(true)}
            >
              Delete School
            </button>
          </>
        ) : (
          <>
            <h3 className="danger-title">Leave School</h3>
            <p className="danger-warning">
              Leaving this school will <strong>permanently remove your account</strong> from the school database.
            </p>
            <p className="danger-warning">
              Your marks, class records, and participation will be deleted for this school.
            </p>
            <button
              className="danger-button"
              onClick={() => setConfirming(true)}
            >
              Leave School
            </button>
          </>
        )}
      </div>

      {/* Confirmation Popup */}
      {confirming && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <h4>Are you absolutely sure?</h4>
            <p>
              {currentRole === "Admin"
                ? "This action will permanently delete the school and cannot be undone."
                : "You will be removed from the school and all your data will be lost."}
            </p>
            <div className="popup-buttons">
              <button
                className="cancel-button"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleFinalConfirmation}
              >
                {currentRole === "Admin" ? "Delete School" : "Leave School"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default LeaveSchool;
