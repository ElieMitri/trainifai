"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Dumbbell,
  Home,
  User,
  Utensils,
  X,
  ArrowLeft,
  BadgePlus,
  Link,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  onSnapshot as onCollectionSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Make sure these are correctly initialized
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Notification from "../components/Notification";
import axios from "axios";

const parseMealPlan = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let currentSection = null;

  const totalStopKeywords = ["total macronutrient breakdown", "note:"];

  for (let line of lines) {
    const lower = line.toLowerCase();

    // Stop at final totals or notes
    if (totalStopKeywords.some((k) => lower.startsWith(k))) break;

    // New section
    const sectionMatch = line.match(/^(Breakfast|Lunch|Dinner|Snack):\s*$/i);
    if (sectionMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: sectionMatch[1],
        items: [],
        macros: {},
      };
      continue;
    }

    // Meal item
    if (line.startsWith("- ")) {
      if (currentSection) {
        currentSection.items.push(line.replace("- ", "").trim());
      }
      continue;
    }

    // Macronutrient breakdown
    if (currentSection) {
      const calMatch = line.match(/Calories:\s*(\d+)\s*kcal/i);
      const proteinMatch = line.match(/Protein:\s*(\d+)\s*g/i);
      const carbsMatch = line.match(/Carbohydrates:\s*(\d+)\s*g/i);
      const fatsMatch = line.match(/Fats:\s*(\d+)\s*g/i);

      if (calMatch) currentSection.macros.calories = parseInt(calMatch[1]);
      if (proteinMatch)
        currentSection.macros.protein = parseInt(proteinMatch[1]);
      if (carbsMatch) currentSection.macros.carbs = parseInt(carbsMatch[1]);
      if (fatsMatch) currentSection.macros.fats = parseInt(fatsMatch[1]);
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
};

function Page() {
  const router = useRouter();
  // Renamed to "Page" (React component names should start with uppercase)
  const [generatedMealPlan, setGeneratedMealPlan] = useState(false);
  const [error, setError] = useState("");
  const [mealPlans, setMealPlans] = useState(null);
  const [calories, setCalories] = useState(2000);
  const [dietType, setDietType] = useState("balanced");
  const [mealPlan, setMealPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [parsedPlan, setParsedPlan] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
  });

  const showNotification = (message, type = "info") => {
    setNotification({
      visible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     console.log("Auth state changed:", currentUser.uid); // Log the actual user first

  //     setUser(currentUser); // Update state

  //     if (currentUser) {
  //       const fetchUserData = async () => {
  //         try {
  //           const userDocRef = doc(db, "personMacros", currentUser.uid);
  //           const userDocSnap = await getDoc(userDocRef);

  //           if (userDocSnap.exists()) {
  //             console.log("User data fetched:", userDocSnap.data());
  //             setUserData(userDocSnap.data());
  //             setLoading(false);
  //           } else {
  //             console.warn("No such user found!");
  //             setUserData(null);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching user data:", error);
  //           setUserData(null);
  //         }
  //       };

  //       fetchUserData();
  //     } else {
  //       setUserData(null);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  const toggleNutritionCard = () => {
    setIsMinimized(!isMinimized);
  };

  const generateMealPlan = () => {
    return {
      weekStart: new Date().toISOString().split("T")[0], // Today's date
      createdAt: Timestamp.now(), // Timestamp for Firebase
      meals: [
        {
          day: "Monday",
          breakfast: {
            name: "Oatmeal",
            calories: 250,
            protein: 8,
            carbs: 45,
            fats: 5,
          },
          lunch: {
            name: "Chicken Salad",
            calories: 400,
            protein: 35,
            carbs: 30,
            fats: 12,
          },
          dinner: {
            name: "Grilled Fish",
            calories: 450,
            protein: 40,
            carbs: 20,
            fats: 15,
          },
        },
        {
          day: "Tuesday",
          breakfast: {
            name: "Scrambled Eggs",
            calories: 300,
            protein: 20,
            carbs: 5,
            fats: 20,
          },
          lunch: {
            name: "Turkey Wrap",
            calories: 450,
            protein: 30,
            carbs: 50,
            fats: 10,
          },
          dinner: {
            name: "Pasta",
            calories: 500,
            protein: 25,
            carbs: 60,
            fats: 15,
          },
        },
        {
          day: "Wednesday",
          breakfast: {
            name: "Pancakes",
            calories: 350,
            protein: 10,
            carbs: 60,
            fats: 8,
          },
          lunch: {
            name: "Caesar Salad",
            calories: 350,
            protein: 25,
            carbs: 15,
            fats: 20,
          },
          dinner: {
            name: "Steak",
            calories: 600,
            protein: 50,
            carbs: 10,
            fats: 30,
          },
        },
        {
          day: "Thursday",
          breakfast: {
            name: "Smoothie",
            calories: 200,
            protein: 15,
            carbs: 30,
            fats: 5,
          },
          lunch: {
            name: "Quinoa Bowl",
            calories: 400,
            protein: 25,
            carbs: 50,
            fats: 10,
          },
          dinner: {
            name: "Tacos",
            calories: 500,
            protein: 30,
            carbs: 50,
            fats: 20,
          },
        },
        {
          day: "Friday",
          breakfast: {
            name: "Toast & Avocado",
            calories: 350,
            protein: 10,
            carbs: 40,
            fats: 15,
          },
          lunch: {
            name: "Soup & Sandwich",
            calories: 400,
            protein: 25,
            carbs: 45,
            fats: 12,
          },
          dinner: {
            name: "Sushi",
            calories: 450,
            protein: 35,
            carbs: 55,
            fats: 10,
          },
        },
        {
          day: "Saturday",
          breakfast: {
            name: "Yogurt & Granola",
            calories: 300,
            protein: 15,
            carbs: 50,
            fats: 8,
          },
          lunch: {
            name: "Pizza",
            calories: 600,
            protein: 30,
            carbs: 70,
            fats: 25,
          },
          dinner: {
            name: "BBQ Chicken",
            calories: 550,
            protein: 45,
            carbs: 35,
            fats: 18,
          },
        },
        {
          day: "Sunday",
          breakfast: {
            name: "Bagel & Cream Cheese",
            calories: 400,
            protein: 12,
            carbs: 60,
            fats: 15,
          },
          lunch: {
            name: "Pasta Salad",
            calories: 450,
            protein: 20,
            carbs: 55,
            fats: 18,
          },
          dinner: {
            name: "Roast Beef",
            calories: 600,
            protein: 50,
            carbs: 25,
            fats: 30,
          },
        },
      ],
    };
  };

  const saveMealPlan = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("You must be logged in to save a meal plan.");
      return;
    }

    const mealPlan = generateMealPlan();

    try {
      // Save the meal plan under the user's subcollection
      const docRef = await addDoc(
        collection(db, "mealPlans", currentUser.uid, "weeklyPlans"),
        mealPlan
      );
      // console.log("Meal plan saved with ID: ", docRef.id);

      // Update the user's document to indicate a meal plan was generated
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        generatedMealPlan: true,
      });

      // alert("Meal plan saved and user updated!");
      showNotification("Meal plan generated successfully!", "success");
    } catch (error) {
      console.error("Error saving meal plan or updating user:", error);
      alert("Failed to save meal plan.");
    }
  };

  // const generateAndSaveMealPlan = async () => {
  //   if (!user) {
  //     alert("No user found!");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // 1. Get user data from Firestore
  //     const userRef = doc(db, "users", user.uid);
  //     const userSnap = await getDoc(userRef);
  //     const userData = userSnap.data();

  //     // 2. Send userData to backend
  //     const response = await fetch("http://localhost:5001/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userData }),
  //     });

  //     const result = await response.json();

  //     if (response.ok && result.mealPlan) {
  //       // 3. Save the meal plan to Firestore from frontend
  //       await addDoc(collection(db, "mealPlans"), {
  //         userId: user.uid,
  //         mealPlan: result.mealPlan,
  //         createdAt: serverTimestamp(),
  //       });

  //       alert("Meal plan saved successfully!");
  //     } else {
  //       alert("Failed to generate meal plan.");
  //     }
  //   } catch (error) {
  //     console.error("Error generating meal plan:", error);
  //     alert("Something went wrong.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const fetchMealPlans = async () => {
  //     if (!user) {
  //       console.warn("No user found");
  //       return;
  //     }

  //     try {
  //       // Fetch meal plans from the subcollection 'weeklyPlans' for the current user
  //       const mealPlansRef = collection(
  //         db,
  //         "mealPlans",
  //         user.uid,
  //         "weeklyPlans"
  //       );
  //       const mealPlansSnapshot = await getDocs(mealPlansRef);

  //       // Map over the fetched documents and set the state
  //       const fetchedMealPlans = mealPlansSnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       setMealPlans(fetchedMealPlans); // Update the state with the fetched meal plans
  //     } catch (error) {
  //       console.error("Error fetching meal plans:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchMealPlans();
  // }, [user]);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserData(null);
        setMealPlans([]);
        setTodaysMeals([]);
        setLoading(false);
        return;
      }

      // Real-time listener for user profile (optional, if needed)
      const profileRef = doc(db, "users", currentUser.uid);
      const unsubscribeUser = onSnapshot(profileRef, (profileSnap) => {
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          // console.log("User profile updated:", profileData);
          // Optional: store profile data separately
          // setUserProfile(profileData);
          if (profileData.generatedMealPlan === true) {
            setGeneratedMealPlan(true);
          } else {
            setGeneratedMealPlan(false);
          }

          if (profileData.paid === true) {
            // setGeneratedMealPlan(true);
          } else {
            // setGeneratedMealPlan(false);
            router.push("/");
          }
        }
      });

      // Real-time listener for personMacros
      const userMacrosRef = doc(db, "personMacros", currentUser.uid);
      const unsubscribeMacros = onSnapshot(userMacrosRef, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        } else {
          console.warn("No personMacros found.");
          setUserData(null);
        }
      });

      // Real-time listener for mealPlans
      const mealPlansRef = collection(
        db,
        "mealPlans",
        currentUser.uid,
        "weeklyPlans"
      );
      const unsubscribeMeals = onCollectionSnapshot(
        mealPlansRef,
        (snapshot) => {
          const fetchedMealPlans = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMealPlans(fetchedMealPlans);

          // Determine today's meals
          const today = new Date();
          const dayOfWeek = today.toLocaleString("default", {
            weekday: "long",
          });
          const todaysMeals = [];

          for (const plan of fetchedMealPlans) {
            for (const meal of plan.meals) {
              if (meal.day === dayOfWeek) {
                todaysMeals.push(meal);
                break;
              }
            }
          }

          setTodaysMeals(todaysMeals);
          setGeneratedMealPlan(todaysMeals.length > 0);
          setLoading(false);
        },
        (error) => {
          console.error("Real-time meal plan error:", error);
          setMealPlans([]);
          setTodaysMeals([]);
          setGeneratedMealPlan(false);
          setLoading(false);
        }
      );

      // Cleanup all listeners
      return () => {
        unsubscribeUser();
        unsubscribeMacros();
        unsubscribeMeals();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // console.log(todaysMeals[0].day);

  // const generateAiMealPlan = async () => {
  //   try {
  //     // Start the loading state and reset error
  //     setLoading(true);
  //     setError(""); // Reset any existing error messages

  //     // Log user data to see what you're sending
  //     console.log("Sending user data to backend:", userData);

  //     // Extract the relevant user data
  //     const relevantData = {
  //       calories: userData.calories,
  //       protein: userData.protein,
  //       carbs: userData.carbs,
  //       fats: userData.fats,
  //     };

  //     // Log the relevant data to ensure it's an object, not a string
  //     console.log("Sending relevant data:", relevantData);

  //     // Make the API request to generate the meal plan
  //     const response = await axios.post(
  //       "http://localhost:3001/generate", // Backend endpoint
  //       relevantData, // Send relevant data as an object (no need to stringify it)
  //       {
  //         headers: {
  //           "Content-Type": "application/json", // Ensuring the request content type is correct
  //         },
  //       }
  //     );

  //     // Check if the response contains the expected data
  //     if (response.data && response.data.mealPlan) {
  //       const generatedPlan = response.data.mealPlan;
  //       setMealPlan(generatedPlan); // Set the meal plan state

  //       // Optionally, save the generated meal plan to Firebase
  //       const mealPlanRef = doc(db, "mealPlans", user.id); // Assuming you have user.id to associate the plan
  //       await setDoc(mealPlanRef, {
  //         ...relevantData, // Include relevant data in Firebase
  //         mealPlan: generatedPlan,
  //         createdAt: new Date(),
  //       });

  //       console.log("Meal plan saved to Firebase");
  //     } else {
  //       // If the response is invalid or missing mealPlan
  //       setError("Failed to generate meal plan. No data returned.");
  //     }
  //   } catch (error) {
  //     // Handle errors with a detailed message
  //     setError("Failed to generate meal plan. Please try again.");
  //     console.error("Error generating meal plan:", error.message);

  //     // Log error details if the error response is available
  //     if (error.response) {
  //       console.error("Error response from backend:", error.response.data);
  //     }
  //   } finally {
  //     // Set loading to false regardless of success or failure
  //     setLoading(false);
  //   }
  // };

  const generateAiMealPlan = async () => {
    try {
      setLoading(true);
      setError("");
      setMealPlan(""); // Clear existing plan

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.uid) {
        setError("You must be logged in to generate and save a meal plan.");
        setLoading(false);
        return;
      }

      // Validate user input
      const isValid =
        userData &&
        typeof userData.calories === "number" &&
        typeof userData.protein === "number" &&
        typeof userData.carbs === "number" &&
        typeof userData.fats === "number";

      if (!isValid) {
        setError("Invalid user data. Please check your input values.");
        setLoading(false);
        return;
      }

      const relevantData = {
        calories: userData.calories,
        protein: userData.protein,
        carbs: userData.carbs,
        fats: userData.fats,
      };

      console.log("📦 Sending relevant data:", relevantData);

      const response = await axios.post(
        "http://localhost:3001/generate",
        relevantData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Response from backend:", response.data);

      const generatedPlan = response?.data?.mealPlan;

      if (typeof generatedPlan === "string") {
        setMealPlan(generatedPlan);

        try {
          const mealPlanRef = doc(db, "mealPlans", currentUser.uid);
          await setDoc(mealPlanRef, {
            ...relevantData,
            mealPlan: generatedPlan,
            createdAt: new Date(),
          });

          console.log("✅ Meal plan saved to Firebase");
        } catch (firebaseError) {
          console.error("🔥 Firebase save error:", firebaseError);
          setError("Meal plan generated, but failed to save it.");
        }
      } else {
        const fallbackMessage =
          "Failed to generate meal plan. Unexpected response format.";
        console.error("❌ Unexpected response:", response?.data ?? "No data");
        setMealPlan("");
        setError(fallbackMessage);
      }
    } catch (err) {
      console.log("🔥 Full error object:", err);

      let errorMsg =
        "An unknown error occurred while generating the meal plan.";

      try {
        if (err && typeof err === "object") {
          if (err.response?.data?.error) {
            errorMsg = String(err.response.data.error);
          } else if (typeof err.message === "string") {
            errorMsg = err.message;
          } else {
            errorMsg = JSON.stringify(err);
          }
        } else if (typeof err === "string") {
          errorMsg = err;
        }
      } catch (parseError) {
        errorMsg = "Error while parsing the error object.";
      }

      const safeMessage =
        typeof errorMsg === "string" ? errorMsg : "Unknown error";

      console.error("❌ Error generating meal plan:", safeMessage);
      setError(safeMessage);
      setMealPlan("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        try {
          const mealPlanRef = doc(db, "mealPlans", user.uid);
          const docSnap = await getDoc(mealPlanRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(data.mealPlan);
            const rawMealPlan = data?.mealPlan;

            if (typeof rawMealPlan === "string") {
              setMealPlan(rawMealPlan); // Optional: store raw text

              const structured = parseMealPlan(rawMealPlan);
              setParsedPlan(structured); // Assuming you have this state

              console.log("✅ Structured meal plan loaded", structured);
            } else {
              console.log("ℹ No valid meal plan string found.");
            }
          } else {
            console.log("ℹ No meal plan document found.");
          }
        } catch (err) {
          console.error("❌ Error fetching structured meal plan:", err);
          setError("Failed to load your saved meal plan.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/createPlan">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
        </div>
      </nav>

      {loading ? (
        <></>
      ) : (
        <>
          <div className="nf_fixed_container">
            <div className={`nf_card ${isMinimized ? "nf_minimized" : ""}`}>
              <div className="nf_header">
                <h3 className="nf_title">Daily Nutrition</h3>
                <button className="nf_toggle_btn" onClick={toggleNutritionCard}>
                  <span className="nf_icon">{isMinimized ? "▼" : "▲"}</span>
                </button>
              </div>
              {!isMinimized && (
                <div className="nf_content">
                  <div className="nf_stat_row">
                    <span className="nf_stat_label">Calories</span>
                    <span className="nf_stat_value">{userData.calories}</span>
                    {/* <span className="nf_stat_remaining">850 remaining</span> */}
                  </div>
                  <div className="nf_divider"></div>
                  <div className="nf_macro_grid">
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Protein</span>
                      <span className="nf_macro_value">
                        {userData.protein}g
                      </span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_protein_fill"
                          style={{ width: "65%" }}
                        ></div>
                      </div> */}
                      {/* <span className="nf_macro_remaining">42g left</span> */}
                    </div>
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Carbohydrates</span>
                      <span className="nf_macro_value">{userData.carbs}g</span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_carbs_fill"
                          style={{ width: "70%" }}
                        ></div>
                      </div> */}
                      {/* <span className="nf_macro_remaining">68g left</span> */}
                    </div>
                    <div className="nf_macro_item">
                      <span className="nf_macro_label">Fats</span>
                      <span className="nf_macro_value">{userData.fats}g</span>
                      {/* <div className="nf_progress_bar">
                        <div
                          className="nf_progress_fill nf_fats_fill"
                          style={{ width: "55%" }}
                        ></div>
                      </div>
                      <span className="nf_macro_remaining">29g left</span> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="clear"></div>

          {parsedPlan.map((section, index) => (
            <React.Fragment key={index}>
              <div className="meal-section" style={{ color: "white" }}>
                <h3 className="meal-title">{section.title}</h3>
                <ul className="meal-items-list">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="meal-item">
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Macronutrients */}
                {section.macros && (
                  <div className="meal-macros">
                    <p>Calories: {section.macros.calories} kcal</p>
                    <p>Protein: {section.macros.protein}g</p>
                    <p>Carbs: {section.macros.carbs}g</p>
                    <p>Fats: {section.macros.fats}g</p>
                  </div>
                )}
              </div>
              <div className="clear"></div>
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
}

export default Page; // Ensure you're exporting "Page"