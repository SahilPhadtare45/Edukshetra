  import { create } from "zustand";
  import { doc, getDoc, getDocs, collection, onSnapshot  } from "firebase/firestore";
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
    
    
    setCurrentSchool: (school) => {
      const current = get().currentSchool;
  
      if (!school || (current && current.schoolId === school.schoolId)) {
          console.warn("Duplicate school detected. Not updating currentSchool.");
          return;
      }
  
      set({ currentSchool: school });
  },
  
clearCurrentSchool: () => set({ currentSchool: null }),

    setLoading: (loading) => set({ isLoading: loading }), // Set loading state
    
    addSchool: (newSchool) => set((state) => ({ userSchools: [...state.userSchools, newSchool] })),
    setUserRole: (role) => set({ userRole: role }), // To set the role (admin, teacher, student)
    clearUser: () => set({ currentUser: null, isLoading: false, userSchools: [], userRole: "guest", }),
    
    fetchUserInfo: (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
        const docRef = doc(db, "Users", uid);

        // Unsubscribe from previous listener to avoid duplicates
        if (useUserStore.getState().unsubscribeUser) {
            useUserStore.getState().unsubscribeUser();
        }

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                set({
                    currentUser: { uid, ...docSnap.data() }, // Include UID with Firestore data
                    isLoading: false,
                });
            } else {
                console.warn("No user document found");
                set({ currentUser: null, isLoading: false });
            }
        });

        // Store unsubscribe function for cleanup
        set({ unsubscribeUser: unsubscribe });
    } catch (error) {
        console.error("Error fetching user data:", error);
        set({ currentUser: null, isLoading: false });
    }
},
    fetchUserSchools: async (uid) => {
      if (!uid) return;
  
      try {
          const userRef = doc(db, "Users", uid);
          const userSnap = await getDoc(userRef);
  
          let userJoinedSchools = [];
          if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.schoolData && Array.isArray(userData.schoolData)) {
                  userJoinedSchools = userData.schoolData;
              }
          }
  
          const schoolsRef = collection(db, "schools");
          const querySnapshot = await getDocs(schoolsRef);
          const schools = querySnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((school) =>
                  school.members?.some(member => member.uid === uid)
              );
  
          // **Map to store unique schools**
          const schoolMap = new Map();
  
          [...userJoinedSchools, ...schools].forEach((school) => {
              if (!schoolMap.has(school.schoolId)) {
                  schoolMap.set(school.schoolId, school);
              }
          });
  
          const uniqueSchools = Array.from(schoolMap.values());
  
          // **Prevent rejoining the same school**
          const currentSchool = get().currentSchool;
          if (!currentSchool || !uniqueSchools.some(s => s.schoolId === currentSchool.schoolId)) {
              set({ currentSchool: uniqueSchools[0] });
          }
  
          set({ userSchools: uniqueSchools });
      } catch (error) {
          console.error("Error fetching schools:", error);
          set({ userSchools: [] });
      }
  },
  fetchSchoolById: async (schoolId) => {
    try {
        const schoolDoc = await getDoc(doc(db, "schools", schoolId)); // Fetch school
        if (schoolDoc.exists()) {
            const schoolData = schoolDoc.data();
            console.log("Fetched School Data:", schoolData); // Debugging log

            // Ensure members field is an array
            if (!Array.isArray(schoolData.members)) {
                schoolData.members = [];
            }

            // Fetch detailed data of each member
            const membersWithDetails = await Promise.all(
                schoolData.members.map(async (member) => {
                    if (member.uid) {
                        const memberDoc = await getDoc(doc(db, "Users", member.uid));
                        return memberDoc.exists()
                            ? { uid: member.uid, ...memberDoc.data().name, email: memberDoc.data().email }
                            : { uid: member.uid, name: "Unknown", email: "No email found" }; // Handle missing data
                    }
                    return member;
                })
            );

            // Set the school data including member details
            const schoolWithMembers = {
                id: schoolId,
                name: schoolData.name,
                shortForm: schoolData.shortForm,
                members: membersWithDetails, // Store detailed members data
            };

            set({ currentSchool: schoolWithMembers }); // Update Zustand state
            return schoolWithMembers;
        } else {
            console.warn("No school found with the provided ID");
            return null;
        }
    } catch (error) {
        console.error("Error fetching school data:", error);
        return null;
    }
}
      }),
    { name: "user-store" } // Persist state to localStorage with key "user-store"
    )
);
