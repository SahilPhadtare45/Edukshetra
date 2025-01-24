
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useUserStore } from '../store/userStore'; // Update path as necessary

export const updateRole = async (newRole) => {
    const db = getFirestore();
    const currentUser = useUserStore.getState().currentUser; // Get the current user from Zustand
    const userRef = doc(db, "Users", currentUser.uid); // Get current user's reference

    try {
        // Fetch the user's school data
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            throw new Error("User not found.");
        }
        const userData = userSnap.data();

        // Update the role in schoolData
        const updatedSchoolData = {
            ...userData.schoolData,
            guest: newRole, // Change the role based on user action
        };

        // Save updated role to Firebase
        await setDoc(userRef, { schoolData: updatedSchoolData }, { merge: true });

        // Update the role in Zustand store
        useUserStore.getState().updateRole(newRole);

        // Optionally show a confirmation
        alert(`Role updated to ${newRole}`);
    } catch (error) {
        console.error("Error updating role:", error);
        alert("Failed to update role. Please try again.");
    }
};