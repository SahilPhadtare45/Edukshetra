import React, { useState } from "react";
import { db } from "../../../Firebase/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../Firebase/userstore";
import "../Dashboard/Addcomplaints.css";
const AddComplaints = ({ schoolId }) => {
    const [complaintText, setComplaintText] = useState("");
    const currentUser = useUserStore((state) => state.currentUser);
    const currentRole = useUserStore((state) => state.currentRole);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!complaintText.trim()) {
            alert("Please enter a complaint.");
            return;
        }

        try {
            const schoolRef = doc(db, "schools", schoolId);
            await updateDoc(schoolRef, {
                complaints: arrayUnion({
                    id: Date.now().toString(), // Unique ID for the complaint
                    senderId: currentUser?.uid,
                    senderEmail: currentUser?.email,
                    senderRole: currentRole,
                    message: complaintText,
                    status: "Pending",
                    replies: [],
                    timestamp: new Date()
                }),
            });

            setComplaintText(""); // Clear input field
            alert("Complaint submitted successfully!");
        } catch (error) {
            console.error("Error submitting complaint:", error);
        }
    };

    return (
        <div className="add-complaint">
            <h6>Submit a Complaint</h6>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Write your complaint..."
                    className="txt-area"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AddComplaints;