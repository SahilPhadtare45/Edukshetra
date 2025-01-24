  import { create } from "zustand";
  import { doc, getDoc, getDocs, collection } from "firebase/firestore";
  import { auth, db } from "../Firebase/firebase.js"; // Ensure the firebase config is imported
  import { setPersistence, browserLocalPersistence } from "firebase/auth";
  import { persist } from "zustand/middleware";

  // Ensure persistence for Firebase Authentication
  setPersistence(auth, browserLocalPersistence);


  // Creating Zustand store to manage user data and loading state
  export const useUserStore = create(
    persist(
      (set,get) => ({  
    currentUser: null,
    isLoading: true,
    userSchools: [], // New state to hold schools data
    currentSchool: null, // The currently selected or active school
    setSchools: (userSchools) => set({ userSchools }),  // Add this action to set the schools
    updateRole: (role) => set({ userRole: role }),
    setUser: (user) => set({ currentUser: user, isLoading: false }), // Set user data

    // Set user and trigger schools fetch
    setUser: (user) => {
      set({ currentUser: user, isLoading: false });
      if (user) {
        get().fetchUserSchools(user.uid); // Fetch schools for the logged-in user
      }
    },
    
   // Inside your useUserStore file
setCurrentSchool: (school) => set({ currentSchool: school }),
clearCurrentSchool: () => set({ currentSchool: null }),

    setLoading: (loading) => set({ isLoading: loading }), // Set loading state
    
    addSchool: (newSchool) => set((state) => ({ userSchools: [...state.userSchools, newSchool] })),
    setUserRole: (role) => set({ userRole: role }), // To set the role (admin, teacher, student)
    clearUser: () => set({ currentUser: null, isLoading: false, userSchools: [], userRole: "guest", }),
    
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
              const schoolData = doc.data();
              if (schoolData.userId === uid) {
                schools.push({
                  ...schoolData,
                  password: schoolData.password, // Ensure password is included
              });
              }
            });
            set({ userSchools: schools });
          } catch (error) {
            console.error("Error fetching schools:", error);
          }
        },
        fetchSchoolById: async (schoolId) => {
          try {
            const schoolDoc = await getDoc(doc(db, "schools", schoolId)); // Use Firestore's doc path
            if (schoolDoc.exists()) {
              return schoolDoc.data(); // Return the school data
            } else {
              console.warn("No school found with the provided ID");
              return null;
            }
          } catch (error) {
            console.error("Error fetching school data:", error);
            return null;
          }
        },
      }),
    { name: "user-store" } // Persist state to localStorage with key "user-store"
    )
);
