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
    setUser: (user) => set({ currentUser: user, isLoading: false }), // Set user data
    // Set user and trigger schools fetch
    setUser: (user) => {
      set({ currentUser: user, isLoading: false });
      if (user) {
        get().fetchUserSchools(user.uid); // Fetch schools for the logged-in user
      }
    },
    
    setLoading: (loading) => set({ isLoading: loading }), // Set loading state
    userRole: 'guest', // Default role is 'guest'
    addSchool: (newSchool) => set((state) => ({ userSchools: [...state.userSchools, newSchool] })),
    clearUser: () => set({ currentUser: null, isLoading: false }), // Clear user data
    setUserRole: (role) => set({ userRole: role }), // To set the role (admin, teacher, student)
    clearUser: () => set({ currentUser: null, isLoading: false, userSchools: [] }),
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
                schools.push(schoolData);
              }
            });
            set({ userSchools: schools });
          } catch (error) {
            console.error("Error fetching schools:", error);
          }
        },
      }),
    { name: "user-store" } // Persist state to localStorage with key "user-store"
    )
);
