  import { create } from "zustand";
  import { doc, getDoc, getDocs, collection, onSnapshot, query, where  } from "firebase/firestore";
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
    currentRole: null, // New state for current role
    schoolData: null, // ✅ New state for storing school data
    teachersCount: 0, // ✅ New state for teachers count
    studentsCount: 0, // ✅ New state for students count

    
    // ✅ Fetch school data and count teachers/students
    fetchSchoolData: async (schoolId) => {
        try {
            if (!schoolId) {
                console.error("fetchSchoolData: No school ID provided");
                return;
            }
    
            const schoolDocRef = doc(db, "schools", schoolId);
            const schoolDocSnap = await getDoc(schoolDocRef);
    
            if (schoolDocSnap.exists()) {
                const schoolData = schoolDocSnap.data();
    
                const members = schoolData.members || [];
    
                const teachersCount = members.filter(m => m.userRole === "Teacher").length;
                const studentsCount = members.filter(m => m.userRole === "Student").length;
    
                set({
                    schoolData: schoolData, 
                    currentSchool: { ...schoolData, schoolId }, // Ensure `currentSchool` is updated
                    teachersCount,
                    studentsCount
                });
    
                console.log("✅ Zustand School Data Updated:", useUserStore.getState().schoolData);
            } else {
                console.warn("⚠️ No school found with ID:", schoolId);
            }
        } catch (error) {
            console.error("❌ Error fetching school data:", error);
        }
    },
    
    
    // Set user and trigger schools fetch
    setUser: (user) => {
        set({ currentUser: user, isLoading: false });
        if (user) {
            get().fetchUserInfo(user.uid); // Fetch user data
            get().fetchUserSchools(user.uid); // Fetch schools for the logged-in user
    
            // After fetching user info, ensure to fetch and refresh role for the current school
            const schoolId = get().currentSchool?.schoolId;
            if (schoolId) {
                get().refreshUserRole(schoolId, user.uid, get().fetchRoleForSchool);
            }
        }
    },
    
     // Set current school and fetch role
    setCurrentSchool: (school) => {
    console.log("🏫 Attempting to set Current School:", school);

    if (!school || school.schoolId === get().currentSchool?.schoolId) {
        console.warn("⚠️ Duplicate school detected. Not updating currentSchool.");
        return;
    }

    set({ currentSchool: school });
    console.log("✅ Current School Set in Zustand:", get().currentSchool);

    const userId = get().currentUser?.uid;
    console.log("👤 Current User ID:", userId);

    if (userId) {
        console.log("📌 Calling fetchRoleForSchool with:", school.schoolId, userId);
        get().fetchRoleForSchool(school.schoolId, userId); // Call the function
    } else {
        console.error("❌ User is not logged in, cannot fetch role.");
    }
},


    setRole: (role) => set({ currentRole: role }),
    
    // ✅ Add this function to refresh the role
    refreshUserRole: async (schoolId, userId, fetchRoleForSchool) => {
        const userRole = await fetchRoleForSchool(schoolId, userId);
        set({ currentRole: userRole });
    },

    fetchRoleForSchool: async (schoolId, userId) => {
        try {
            if (!schoolId || !userId) {
                console.error("Invalid schoolId or userId:", schoolId, userId);
                return "No Role Assigned";
            }
    
            const schoolDocRef = doc(db, "schools", schoolId);
            const schoolDocSnap = await getDoc(schoolDocRef);
    
            if (!schoolDocSnap.exists()) {
                console.warn("School not found:", schoolId);
                return "No Role Assigned";
            }
    
            const schoolData = schoolDocSnap.data();
            const members = Array.isArray(schoolData.members) ? schoolData.members : [];
    
            // Normalize email comparison
            const currentUserEmail = auth.currentUser?.email?.toLowerCase();
            const creatorEmail = schoolData.createdBy?.toLowerCase();
    
            if (creatorEmail === currentUserEmail) {
                useUserStore.getState().setRole("Admin");
                return "Admin";
            }
    
            const userMember = members.find(member =>
                String(member.uid).trim() === String(userId).trim()
            );
    
            if (userMember) {
                const role = userMember.userRole || "No Role Assigned";
                useUserStore.getState().setRole(role);
                return role;
            }
    
            console.warn("User not found in members list:", userId);
            return "No Role Assigned";
    
        } catch (error) {
            console.error("Error fetching role:", error);
            return "Error";
        }
    },
    
    
    
    

    clearCurrentSchool: () => set({ currentSchool: null }),

    setLoading: (loading) => set({ isLoading: loading }), // Set loading state
    
   
        
    fetchUserInfo: (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false, userRole: "Guest" });

    try {
        const docRef = doc(db, "Users", uid);

        // Unsubscribe from previous listener to avoid duplicates
        if (useUserStore.getState().unsubscribeUser) {
            useUserStore.getState().unsubscribeUser();
        }

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                set({
                    currentUser: { uid, ...userData }, // Include UID with Firestore data
                    userRole: userData.schoolData?.[0]?.userRole || "Guest",
                    isLoading: false,
                });
                console.log("Updated Zustand State:", useUserStore.getState()); // Debugging log

            } else {
                console.warn("No user document found");
                set({ currentUser: null,userRole: "Guest", isLoading: false });
            }
        });

        // Store unsubscribe function for cleanup
        set({ unsubscribeUser: unsubscribe });
    } catch (error) {
        console.error("Error fetching user data:", error);
        set({ currentUser: null, userRole: "Guest", isLoading: false });
    }
},

addSchool: (newSchool) => 
    set((state) => ({ userSchools: [...state.userSchools, newSchool] })),

fetchUserSchools: async (uid) => {
    if (!uid) return;

    try {
        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);

        let userJoinedSchools = [];
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (Array.isArray(userData.schoolData)) {
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

        // Ensure the current school is still valid
        if (!get().currentSchool || !uniqueSchools.some(s => s.id === get().currentSchool?.id)) {
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
},
// Clear user session
clearUser: () => {
    if (get().unsubscribeUser) {
        get().unsubscribeUser();
    }
    set({ currentUser: null, currentRole: null, isLoading: false, userSchools: [] });
},
}),    { name: "user-store" } // Persist state to localStorage with key "user-store"
    )
);
