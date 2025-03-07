import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion,getDoc } from "firebase/firestore";
import { db } from "../../../Firebase/firebase";
import { useUserStore } from "../../../Firebase/userstore";
import Header from "../../Comman/header";
import Sidebar from "../../Comman/sidebar";
import "./classworkDetails.css";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dnj7emmrm/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

const ClassworkDetails = () => {
    const { classworkId } = useParams();
    const { currentUser, currentSchool, currentRole } = useUserStore();
    const [classwork, setClasswork] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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
    if (!uploadFile || !classwork) return;

    setUploading(true);
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
        
        // 🔥 Fetch the latest school document snapshot
        const schoolSnapshot = await getDoc(schoolRef);
        if (!schoolSnapshot.exists()) {
            console.error("School document does not exist!");
            setUploading(false);
            return;
        }

        const schoolData = schoolSnapshot.data();
        const allClasswork = schoolData.classwork || {}; // ✅ Ensure classwork is an object

        // ✅ Fetch the existing classwork entry, or create an empty object if it doesn't exist
        const currentClasswork = allClasswork[classworkId] || {};

        // ✅ Ensure uploads array exists, then append the new upload
        const updatedUploads = [...(currentClasswork.uploads || []), {
            fileUrl,
            uploadedBy: currentUser.email,
        }];

        // ✅ Update ONLY the `uploads` field inside the correct classwork ID
        await updateDoc(schoolRef, {
            [`classwork.uploads`]: updatedUploads, // 👈 This ensures ONLY uploads is modified
        });

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

    return (
        <div className="classworkDetailsPage">
            <Header />
            <Sidebar />
            <div className="classworkDetails">
                <h2>{classwork.classworkTitle}</h2>
                <p>{classwork.classworkContent}</p>
                <p><strong>Assigned By:</strong> {classwork.assignedByEmail}</p>
                <p><strong>Due Date:</strong> {classwork.dueDate ? new Date(classwork.dueDate).toLocaleString() : "No due date"}</p>
    
                {/* Display Attachments */}
                {classwork.attachments?.length > 0 && (
                    <div className="attachments">
                        <h3>Attachments:</h3>
                        <ul>
                            {classwork.attachments.map((file, index) => (
                                <li key={index}>
                                    <a href={file} target="_blank" rel="noopener noreferrer">View File {index + 1}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
    
                {/* Student Uploads - Visible only to Creator */}
                {/* Display Student Uploads - Only visible to assignedByUID */}
{classwork.uploads && classwork.uploads.length > 0 && currentUser.uid === classwork.assignedByUID && (
    <div className="uploads">
        <h3>Student Submissions:</h3>
        <ul>
            {classwork.uploads.map((file, index) => (
                <li key={index}>
                    📄 
                    <a 
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "blue", textDecoration: "underline", marginLeft: "5px" }}
                    >
                        View File {index + 1}
                    </a>
                    <span> (Uploaded by: {file.uploadedBy})</span>
                </li>
            ))}
        </ul>
    </div>
)}

    
                {/* Upload Section - Only for Students & if allowed */}
                {isStudent && classwork.allowUploads && (
                    <div className="upload-section">
                        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
                        <button onClick={handleFileUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload File"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassworkDetails;