import { create } from "zustand";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { auth, db } from "../Firebase/firebase.js"; // Ensure the firebase config is imported

// Creating Zustand store to manage user data and loading state
export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  userSchools: [], // New state to hold schools data
  setUser: (user) => set({ currentUser: user, isLoading: false }), // Set user data
  setLoading: (loading) => set({ isLoading: loading }), // Set loading state
  userRole: 'guest', // Default role is 'guest'
  clearUser: () => set({ currentUser: null, isLoading: false }), // Clear user data
  setUserRole: (role) => set({ userRole: role }), // To set the role (admin, teacher, student)
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
  
    try {
      const docRef = doc(db, "Users", uid); // Ensure the document path matches Firestore structure
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({
          currentUser: { uid, ...docSnap.data() }, // Include UID with Firestore data
          isLoading: false,
        });
      } else {
        console.warn("No user document found");
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ currentUser: null, isLoading: false });
    }
  },
  fetchUserSchools: async (uid) => {
    if (!uid) return;
  
    try {
      const schoolsRef = collection(db, "schools");
      const querySnapshot = await getDocs(schoolsRef);
      const schools = [];
  
      querySnapshot.forEach((doc) => {
        if (doc.data().userId === uid) {
          schools.push(doc.data());
        }
      });
      set({ userSchools: schools });
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  },
}));