import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion,getDoc } from "firebase/firestore";
import { db } from "../../../Firebase/firebase";
import { useUserStore } from "../../../Firebase/userstore";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import "./classworkDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dnj7emmrm/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

const ClassworkDetails = () => {
    const { classworkId } = useParams();
    const { currentUser, currentSchool, currentRole } = useUserStore();
    const [classwork, setClasswork] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    useEffect(() => {
        if (!currentSchool || !currentSchool.schoolId || !classworkId) return;
    
        const schoolRef = doc(db, "schools", currentSchool.schoolId);
        
        const unsubscribe = onSnapshot(schoolRef, (snapshot) => {
            if (!snapshot.exists()) return;
    
            const schoolData = snapshot.data();
            const allClasswork = schoolData.classwork ? Object.values(schoolData.classwork) : [];
    
            // Use find() safely
            const selectedClasswork = allClasswork.find(cw => cw.id === classworkId);
    
            if (selectedClasswork) {
                setClasswork(selectedClasswork);
            } else {
                console.log("❌ Classwork not found!");
            }
        });
    
        return () => unsubscribe();
    }, [currentSchool, classworkId]);
    
    const handleFileUpload = async () => {
        if (!uploadFile || !classwork || uploading || uploadComplete) return; // Prevent duplicate execution
    
        setUploading(true);
        setUploadComplete(false); // Reset upload completion

        try {
            // Upload file to Cloudinary
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("resource_type", "raw");
    
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            const fileUrl = data.secure_url;
    
            // Reference to the school document
            const schoolRef = doc(db, "schools", currentSchool.schoolId);
            const schoolSnapshot = await getDoc(schoolRef);
    
            if (!schoolSnapshot.exists()) {
                console.error("School document does not exist!");
                setUploading(false);
                return;
            }
    
            const schoolData = schoolSnapshot.data();
            const updatedClasswork = schoolData.classwork.map((cw) =>
                cw.id === classworkId
                    ? { 
                        ...cw, 
                        uploads: cw.uploads 
                            ? [...cw.uploads, { fileUrl, uploadedBy: currentUser.email }]
                            : [{ fileUrl, uploadedBy: currentUser.email }]
                    }
                    : cw
            );
    
            // Update only the specific classwork array
            await updateDoc(schoolRef, { classwork: updatedClasswork });
    
           
            
    
            setUploadFile(null);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("File upload error:", error);
        } finally {
            setUploading(false);
        }
    };
      
    
    if (!classwork) return <p>Loading classwork details...</p>;

    const isStudent = currentRole === "Student";
    const isCreator = currentUser.uid === classwork.assignedByUID;
    console.log("Uploads Data:", classwork.uploads);
    console.log("Current User Email:", currentUser.email);
    console.log("Current User UID:", currentUser.uid);
    
    return (
        <div className="classworkDetailsPage">
            <Header />
            <Sidebar />
            <div className="classworkDetails">
                <div style={{display:"flex"}}>
                <div className="iconbg">
                <FontAwesomeIcon className="clipicon" icon={faClipboardList} />
                </div>
                <h2 className="clswork-title text-truncate">{classwork.classworkTitle}</h2>
                </div>
                <p style={{marginTop:"-1%",marginLeft:"8.5%"}}>Assigned By: {classwork.assignedByEmail}</p>
                <p className="due-date">Due Date: {classwork.dueDate ? new Date(classwork.dueDate).toLocaleString() : "No due date"}</p>
<div style={{display:"flex"}}>
                <pre className="clswrk-con" >
                    <div className="clswrk-text">
                        {classwork.classworkContent}
                    </div>
                </pre>
                <div className="upload-sec">   
    {isStudent && classwork.allowUploads ? (
        <div className="upload-section">
            <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
            <button onClick={handleFileUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload File"}
            </button>
        </div>
    ) : isStudent ? (
        <p>Upload option is disabled</p>
    ) : isCreator ? ( 
        <p>Student's Submissions will be uploaded here</p>
    ) : null}

{/* Display Student Uploads - Visible to Assigned Teacher & Student Themselves */}
{classwork.uploads && classwork.uploads.length > 0 && (
    <div className="uploads">
        <h5 style={{marginLeft:"5%"}}>Student Submissions:</h5>
        <ul>
            {classwork.uploads
                .filter(file => file.uploadedBy === currentUser.email || currentUser.uid === classwork.assignedByUID)
                .map((file, index) => (
                    <li key={index}>
                         
                        <a 
                            className="btn btn-outline-secondary"
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            View File {index + 1}
                        </a>
                        <span> (Uploaded by: {file.uploadedBy})</span>
                    </li>
                ))}
        </ul>
    </div>
)}


</div>
</div>
    {/* Display Attachments */}
    {classwork.attachments?.length > 0 && (
                    <div className="attachments">
                        <h3>Attachments:</h3>
                        <ul>
                            {classwork.attachments.map((file, index) => (
                                <li key={index}>
                                    <a href={file} target="_blank" className="btn btn-outline-secondary" rel="noopener noreferrer">View File {index + 1}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                

{isStudent && classwork.uploads && classwork.uploads.filter(file => file.uploadedBy === currentUser.email).length > 0 && (
    <p className="upload-no">
        ✅ You have uploaded {classwork.uploads.filter(file => file.uploadedBy === currentUser.email).length} file(s).
    </p>
)}

            </div>
        </div>
    );
};

export default ClassworkDetails;