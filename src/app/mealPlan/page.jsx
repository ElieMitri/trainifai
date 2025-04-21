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
  Instagram,
  Mail,
} from "lucide-react";
import { GiMeal } from "react-icons/gi";
import { FaTiktok } from "react-icons/fa";
import PrivacyModal from "../components/PrivacyModal";
import TermsModal from "../components/TermsModal";
// import {
//   Activity,
//   Dumbbell,
//   Home,
//   User,
//   Utensils,
//   X,
//   Crown,
//   Settings,
//   LogOut,
//   Instagram,
//   Mail,
// } from "lucide-react";
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

const parseMealPlan = (rawText) => {
  const sections = rawText
    .split(
      /(?=Breakfast:|Snack:|Lunch:|Dinner:|Total Macronutrient breakdown for the day:)/g
    )
    .map((s) => s.trim());

  const result = [];

  sections.forEach((section) => {
    const titleMatch = section.match(/^(Breakfast|Snack|Lunch|Dinner)/i);
    const isTotal = section.startsWith("Total Macronutrient");

    if (titleMatch) {
      const title = titleMatch[0];

      const items = section
        .split("Estimated Macronutrient breakdown:")[0]
        .replace(`${title}:`, "")
        .trim()
        .split("-")
        .map((i) => i.trim())
        .filter(Boolean);

      const macrosMatch = section.match(
        /Calories:\s*(\d+)\s*kcal[\s\S]*?Protein:\s*(\d+)g[\s\S]*?Carbohydrates:\s*(\d+)g[\s\S]*?Fats:\s*(\d+)g/
      );

      result.push({
        title,
        items,
        macros: macrosMatch
          ? {
              calories: `${macrosMatch[1]} kcal`,
              protein: `${macrosMatch[2]}g`,
              carbs: `${macrosMatch[3]}g`,
              fats: `${macrosMatch[4]}g`,
            }
          : null,
      });
    } else if (isTotal) {
      const macrosMatch = section.match(
        /Calories:\s*(\d+)\s*kcal[\s\S]*?Protein:\s*(\d+)g[\s\S]*?Carbohydrates:\s*(\d+)g[\s\S]*?Fats:\s*(\d+)g/
      );

      result.push({
        title: "Total for the Day",
        macros: macrosMatch
          ? {
              calories: `${macrosMatch[1]} kcal`,
              protein: `${macrosMatch[2]}g`,
              carbs: `${macrosMatch[3]}g`,
              fats: `${macrosMatch[4]}g`,
            }
          : null,
      });
    }
  });

  return result;
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
  const [parsedPlan, setParsedPlan] = useState("");
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(true);

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

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.uid) {
        setError("You must be logged in to generate and save a meal plan.");
        setLoading(false);
        return;
      }

      const today = new Date().toDateString();

      // ✅ FIXED: Use 'today' as document ID inside 'allMeals' subcollection
      const mealPlanRef = doc(
        db,
        "mealPlans",
        currentUser.uid,
        "allMeals",
        today
      );
      const existingMealDoc = await getDoc(mealPlanRef);

      if (existingMealDoc.exists()) {
        const data = existingMealDoc.data();
        const savedDay = data.createdDay;

        if (savedDay !== today) {
          // It's a new day — reset the saved plan
          await setDoc(mealPlanRef, {}, { merge: true }); // clear contents
          setMealPlan(""); // clear UI state
        } else {
          // Already has a plan for today — return early or allow regeneration
          // return; // Optional: uncomment if you want to block regeneration
        }
      }

      setMealPlan(""); // Clear existing plan in UI state

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
          await setDoc(mealPlanRef, {
            ...relevantData,
            mealPlan: generatedPlan,
            createdAt: new Date(),
            createdDay: today, // 👈 Save date string
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user?.uid) return;

      const today = new Date().toDateString();

      // const tomorrow = new Date();
      // tomorrow.setDate(tomorrow.getDate() + 1);
      // const fakeToday = tomorrow.toDateString();

      const mealPlanRef = doc(db, "mealPlans", user.uid, "allMeals", today); // 👈 doc for today only

      // 👇 Real-time Firestore listener for today’s plan
      const unsubscribePlan = onSnapshot(
        mealPlanRef,
        (docSnap) => {
          if (!docSnap.exists()) {
            console.log("ℹ️ No meal plan found for today.");
            setMealPlan("");
            setParsedPlan([]);
            setShowGenerateButton(true); // 👈 show "Generate" if no plan
            return;
          }

          const data = docSnap.data();
          const rawMealPlan = data?.mealPlan;
          const savedDay = data?.createdDay;

          if (
            typeof rawMealPlan === "string" &&
            rawMealPlan.trim().length > 0
          ) {
            setMealPlan(rawMealPlan);
            setParsedPlan(parseMealPlan(rawMealPlan));

            console.log("✅ Structured meal plan loaded");

            if (savedDay !== today) {
              setShowGenerateButton(true); // 👈 it's an old plan, allow regenerate
            } else {
              setShowGenerateButton(false); // 👈 plan is fresh, hide the button
            }
          } else {
            console.log("ℹ️ Meal plan exists but is not a valid string.");
            setMealPlan("");
            setParsedPlan([]);
            setShowGenerateButton(true);
          }
        },
        (err) => {
          console.error("❌ Firestore listener error:", err);
          setError("Failed to load your saved meal plan.");
          setShowGenerateButton(true);
        }
      );

      // Cleanup: unsubscribe Firestore listener on auth change
      return unsubscribePlan;
    });

    // Cleanup: unsubscribe auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (mealPlan && typeof mealPlan === "string") {
      const structured = parseMealPlan(mealPlan);
      setParsedPlan(structured);
    }
  }, [mealPlan]);

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
          {mealPlan ? (
            <div className="mealWrapper">
              <div className="clear"></div>
              {/* {mealPlan} */}
              {/* {Array.isArray(parsedPlan) &&
                parsedPlan.map((section, index) => (
                  <React.Fragment key={index}>
                    <div className="meal-section">
                      <h3 className="meal-title">{section.title}</h3>
                      <ul className="meal-list">
                        {section.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="clear"></div>
                  </React.Fragment>
                ))} */}
              {Array.isArray(parsedPlan) &&
                parsedPlan.map((section, index) => (
                  <React.Fragment key={index}>
                    <div className="meal-section">
                      <h3 className="meal-title">{section.title}</h3>

                      {section.items && (
                        <ul className="meal-list">
                          {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}

                      {section.macros && (
                        <div className="meal-macros">
                          <p>
                            <strong>Calories:</strong> {section.macros.calories}{" "}
                            | <strong>Protein:</strong> {section.macros.protein}{" "}
                            | <strong>Carbs:</strong> {section.macros.carbs} |{" "}
                            <strong>Fats:</strong> {section.macros.fats}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="clear"></div>
                  </React.Fragment>
                ))}
            </div>
          ) : (
            <>
              {showGenerateButton && (
                <div className="generate-button-wrapper">
                  <button
                    onClick={generateAiMealPlan}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    Generate Today's Meal
                    <GiMeal className="meal" />
                  </button>
                </div>
              )}
            </>
          )}
          {loading && (
            <div className="loading-message">
              🍽️ Generating your meal plan, please wait...
            </div>
          )}

          <footer className="footer">
            <div className="container footer-grid">
              <div className="footer-section">
                <div className="footer-logo">TrainifAI</div>
                <div className="footer-text">
                  © 2025 TrainifAI. All rights reserved.
                </div>
              </div>

              {/* <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/workoutPlan">Workouts</a>
              </li>
              <li>
                <a href="/mealPlan">Meal Plans</a>
              </li>
            </ul>
          </div> */}

              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li>
                    <a href="/FAQ">FAQ</a>
                  </li>
                  {/* <li>
                <a href="/contact">Contact</a>
              </li> */}
                  <li>
                    <a href="/TermsOfServices">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/PrivacyPolicy">Privacy Policy</a>
                  </li>
                </ul>
              </div>

              <PrivacyModal
                isOpen={showPrivacy}
                onClose={() => setShowPrivacy(false)}
              />
              <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
              />

              <div className="footer-section">
                <h4>Stay Connected</h4>
                <div className="social-icons">
                  <a
                    href="https://instagram.com/trainif.ai"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Instagram />
                  </a>
                  <a
                    href="https://tiktok.com/trainif.ai"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaTiktok className="tiktokLogo" />
                  </a>
                  <a href="mailto:trainifai@gmail.com.com">
                    <Mail />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default Page; // Ensure you're exporting "Page"
