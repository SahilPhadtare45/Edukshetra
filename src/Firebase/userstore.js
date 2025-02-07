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
    setSchools: (schools) => set({ userSchools: Array.isArray(schools) ? schools : [] }),
    updateRole: (role) => set({ userRole: role }),

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
         // Fetch the user's document from the 'users' collection
         const userRef = doc(db, "Users", uid);
         const userSnap = await getDoc(userRef);
 
         let userJoinedSchools = [];
         if (userSnap.exists()) {
             const userData = userSnap.data();
             if (userData.schoolData && Array.isArray(userData.schoolData)) {
                 userJoinedSchools = userData.schoolData; // Extract stored schools
             }
         }
          const schoolsRef = collection(db, "schools");
          const querySnapshot = await getDocs(schoolsRef);
          const schools = querySnapshot.docs
              .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
              }))
              .filter((school) => Array.isArray(school.members) && school.members.includes(uid)); // Ensure filtering works
  
              // Combine fetched schools and user's joined schools
          const combinedSchools = [...schools, ...userJoinedSchools];
          console.log("Fetched Schools:", combinedSchools); // Debugging log
          set({ userSchools: Array.isArray(combinedSchools) ? combinedSchools : [] }); // Ensures an array is set
        } catch (error) {
          console.error("Error fetching schools:", error);
          set({ userSchools: [] }); // Prevents null issues
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
