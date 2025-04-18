"use client";

import React, { useState, useEffect } from "react";
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
import { Notebook as Robot, Save, Trash2, Pencil } from "lucide-react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Notification from "../components/Notification";
// import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const muscleGroupsMap = {
  Push: ["chest", "shoulders", "arms"],
  Pull: ["back", "arms"],
  Legs: ["legs"],
  Upper: ["chest", "back", "shoulders", "arms"],
  Lower: ["legs", "glutes"],
  "Full Body": ["chest", "back", "legs", "core", "arms", "shoulders"],
  Glutes: ["glutes"],
  "Core + Conditioning": ["core"],
  "Glutes + Core": ["glutes", "core"],
};

const exerciseDatabase = {
  chest: [
    "Bench Press",
    "Incline Dumbbell Press",
    "Push-Ups",
    "Chest Flyes",
    "Decline Press",
    "Dumbbell Chest Press",
    "Cable Chest Flyes",
    "Chest Dips",
    "Machine Chest Press",
    "Pec Deck Machine",
    "Close-Grip Bench Press",
    "Landmine Chest Press",
  ],
  back: [
    "Pull-Ups",
    "Bent Over Rows",
    "Lat Pulldowns",
    "Face Pulls",
    "Seated Cable Rows",
    "T-Bar Rows",
    "Barbell Rows",
    "Dumbbell Rows",
    "Single-Arm Dumbbell Row",
    "Inverted Rows",
    "Deadlifts",
    "Hyperextensions",
    "Shrugs",
    "Renegade Rows",
    "Kettlebell Swings",
  ],
  legs: [
    "Squats",
    "Deadlifts",
    "Lunges",
    "Leg Press",
    "Leg Extensions",
    "Leg Curls",
    "Bulgarian Split Squats",
    "Step-Ups",
    "Hip Thrusts",
    "Glute Bridges",
    "Calf Raises",
    "Romanian Deadlifts",
    "Walking Lunges",
    "Sumo Squats",
    "Box Jumps",
    "Kettlebell Swings",
    "Smith Machine Squats",
  ],
  shoulders: [
    "Military Press",
    "Lateral Raises",
    "Front Raises",
    "Shrugs",
    "Arnold Press",
    "Upright Rows",
    "Reverse Pec Deck",
    "Face Pulls",
    "Dumbbell Shoulder Press",
    "Cable Lateral Raises",
    "Barbell Shoulder Press",
    "Dumbbell Front Raise",
    "Cable Front Raise",
    "Overhead Dumbbell Triceps Extension",
  ],
  arms: [
    "Bicep Curls",
    "Tricep Extensions",
    "Hammer Curls",
    "Diamond Push-Ups",
    "Concentration Curls",
    "Preacher Curls",
    "EZ Bar Curls",
    "Cable Tricep Pushdowns",
    "Overhead Tricep Extensions",
    "Close-Grip Bench Press",
    "Barbell Curls",
    "Tricep Dips",
    "Cable Bicep Curls",
    "Chin-Ups",
    "Zottman Curls",
    "Tricep Kickbacks",
  ],
  core: [
    "Planks",
    "Crunches",
    "Russian Twists",
    "Leg Raises",
    "Mountain Climbers",
    "Ab Wheel Rollouts",
    "Bicycle Crunches",
    "V-Ups",
    "Flutter Kicks",
    "Side Planks",
    "Hanging Leg Raises",
    "Cable Woodchoppers",
    "Lying Leg Raises",
    "Toe Touches",
    "Reverse Crunches",
    "Plank with Leg Lift",
  ],
  glutes: [
    "Hip Thrusts",
    "Glute Bridges",
    "Cable Kickbacks",
    "Bulgarian Split Squats",
    "Sumo Deadlifts",
    "Frog Pumps",
    "Step-Ups",
    "Glute Kickbacks",
    "Cable Glute Bridges",
    "Single-Leg Hip Thrusts",
    "Hip Abductions",
    "Walking Lunges",
    "Kettlebell Swings",
    "Glute Ham Raises",
    "Barbell Hip Thrusts",
    "Squats",
  ],
};

export default function WorkoutBot() {
  const [weeklyWorkout, setWeeklyWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [todaysExercises, setTodaysExercises] = useState([]);
  const [currentDay, setCurrentDay] = useState("");
  const [hasWorkouts, setHasWorkouts] = useState(false);
  const [doesntHaveWorkouts, setDoesntHaveWorkouts] = useState(false);
  // const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
  });
  const [formData, setFormData] = useState({});

  const [gender, setGender] = useState(null);
  const [userTrainingDays, setUserTrainingDays] = useState(null);

  const [selectedExercises, setSelectedExercises] = useState({});
  const [workoutState, setWorkoutState] = useState(weeklyWorkout);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedExerciseFirebase, setSelectedExercisefirbase] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // const handleClick = (event, workoutDay, exerciseName) => {
  //   setAnchorEl(event.currentTarget);
  //   setSelectedDay(workoutDay);
  //   setSelectedExercise(exerciseName);
  //   console.log(anchorEl);
  // };

  const handleClick = (event, workoutDay, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedDay(workoutDay); // Set selected day
    setSelectedExercise(exerciseName); // Set selected exercise name
  };
  const handleClickFirebase = (event, exerciseName) => {
    setAnchorEl(event.currentTarget); // Set anchor element to the clicked icon
    setSelectedExercisefirbase(exerciseName); // Set selected exercise name
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  // Handle input change for weight, reps, and RIR
  const handleInputChange = (e, exerciseId) => {
    const { name, value } = e.target;

    // Update formData for the specific exercise
    setFormData((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [name]: value,
      },
    }));
    console.log(formData);
  };

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

  // Generate the workout plan
  const generateWorkout = () => {
    setLoading(true);

    const userGender = gender;
    const workoutDays = userTrainingDays;

    const allSplits = {
      male: {
        3: ["Full Body", "Full Body", "Full Body"],
        4: ["Upper", "Lower", "Upper", "Lower"],
        5: ["Push", "Pull", "Legs", "Upper", "Lower"],
      },
      female: {
        3: ["Lower", "Upper", "Full Body"],
        4: ["Lower", "Upper", "Glutes + Core", "Full Body"],
        5: ["Glutes", "Upper", "Lower", "Core + Conditioning", "Full Body"],
      },
    };

    const selectedSplit = allSplits[userGender][workoutDays];

    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Define rest day indexes based on training days
    const restDayIndexes = {
      3: [1, 3, 5, 6], // Tue, Thu, Sat, Sun
      4: [2, 5, 6], // Wed, Sat, Sun
      5: [3, 6], // Thu, Sun
    };

    const restDays = restDayIndexes[workoutDays];

    const trainingDays = weekDays.map((dayName, i) => {
      if (restDays.includes(i)) {
        return {
          day: dayName,
          split: "Rest",
          exercises: [],
        };
      } else {
        const split = selectedSplit.shift(); // Get next split in order
        return {
          day: dayName,
          split: split,
          exercises: [],
        };
      }
    });

    trainingDays.forEach((day) => {
      if (day.split === "Rest") return;

      const muscleGroups = muscleGroupsMap[day.split];

      muscleGroups.forEach((group) => {
        const exercises = exerciseDatabase[group];
        const selectedExercises = exercises
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        selectedExercises.forEach((exercise) => {
          day.exercises.push({
            name: exercise,
            sets: Math.floor(Math.random() * 2) + 3, // 3–4 sets
            reps: [8, 10, 12][Math.floor(Math.random() * 3)],
            weight: 0,
          });
        });
      });
    });

    setWeeklyWorkout({
      name: `Workout Plan - Week ${new Date().toLocaleDateString()}`,
      workouts: trainingDays,
    });

    setLoading(false);
  };

  // Save workout to Firebase
  const saveToFirebase = async () => {
    if (!weeklyWorkout) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in.");
      alert("You need to be logged in to save a workout.");
      return;
    }

    try {
      setLoading(true);
      // Use currentUser.uid for the document path
      const docRef = await addDoc(
        collection(db, "workouts", currentUser.uid, "weeklyWorkouts"),
        weeklyWorkout
      );

      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        lastWorkout: new Date().toLocaleDateString(),
        createdWorkout: true,
      });

      // alert(`Workout saved successfully! Document ID: ${docRef.id}`);
      setHasWorkouts(true);
      setDoesntHaveWorkouts(false);
      showNotification("Workout saved successfully!", "success");
    } catch (error) {
      console.error("Error saving workout: ", error);
      alert("Error saving workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch workouts from Firestore on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const userDataRef = doc(db, "personDetails", firebaseUser.uid);
        const userDataSnap = await getDoc(userDataRef);
        if (userDataSnap.exists()) {
          console.log(userDataSnap.data().gender);
          console.log(userDataSnap.data().days);
          setGender(userDataSnap.data().gender);
          setUserTrainingDays(userDataSnap.data().days);
        } else {
          console.log("No user doc found");
        }

        // 🔥 Get user doc from Firestore (assuming users/{uid} structure)
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // console.log(userSnap.data());
        } else {
          console.log("No user doc found");
        }
      }
    });

    return () => unsubscribe(); // clean up listener
  }, []);

  // Fetch workouts from Firestore and set today's exercises
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true); // Start loading state

        // Set up a real-time listener using onSnapshot
        const workoutsRef = collection(
          db,
          "workouts",
          user.uid,
          "weeklyWorkouts"
        );

        const unsubscribeSnapshot = onSnapshot(workoutsRef, (snapshot) => {
          const fetchedWorkouts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (fetchedWorkouts.length === 0) {
            // No workouts found, handle accordingly
            setDoesntHaveWorkouts(true);
            setWorkouts([]); // Reset workouts to empty in case no workouts exist
          } else {
            // Found workouts, update state
            setWorkouts(fetchedWorkouts[0].workouts);
            console.log(fetchedWorkouts[0].workouts);
          }

          const day = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
          setCurrentDay(day); // Set the current day for comparison

          // Find today's workout from the fetched workouts
          const todayWorkout = fetchedWorkouts
            .map((workout) => workout.workouts)
            .flat()
            .find((workout) => workout.day === day);

          if (todayWorkout) {
            setTodaysExercises(todayWorkout.exercises);
            console.log("Today's exercises:", todayWorkout.exercises);
            console.log(day);
            setHasWorkouts(true);
          } else {
            setDoesntHaveWorkouts(true);
          }

          setLoading(false); // Stop loading once data is fetched
        });

        // Cleanup on component unmount
        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe(); // Clean up onAuthStateChanged listener
  }, []);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  //   console.log(formData);
  // };

  const calculateNextWeight = (exercise) => {
    // Ensure rir and reps are properly accessed, and use fallback if undefined
    const rir = formData[exercise.name]?.rir || 0;
    const reps = formData[exercise.name]?.reps || 0;
    const weight = formData[exercise.name]?.weight || 0;

    // Calculate the difference in RIR and reps
    const rirDiff = 2 - rir; // Assuming 2 is the target RIR
    const repDiff = 8 - reps; // Assuming 8 is the target reps

    // Calculate adjustments based on RIR and reps
    const rirAdjustment = rirDiff * 0.02; // 2% per RIR
    const repAdjustment = repDiff * 0.025; // 2.5% per rep

    // Total adjustment
    const totalAdjustment = rirAdjustment + repAdjustment;

    // Calculate and log the new weight
    const newWeight = weight * (1 + totalAdjustment);

    console.log(newWeight.toFixed(2));

    return +newWeight.toFixed(2); // Ensure the result is a number with two decimals
  };

  const handleEditExercise = (exerciseDay, exerciseName) => {
    console.log(`You clicked on: ${exerciseDay}`);
    console.log(`You clicked on: ${exerciseName}`);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    const theExercise = theWorkoutDay.exercises.find(
      (e) => e.name === exerciseName
    );

    console.log(theExercise);
    handleClick();
  };

  const handleExerciseClick = (exerciseDay, exerciseName) => {
    // console.log(`You clicked on: ${exerciseDay}`);
    // console.log(`You clicked on: ${exerciseName}`);

    console.log(weeklyWorkout.workouts);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    if (!theWorkoutDay) return;

    theWorkoutDay.exercises = theWorkoutDay.exercises.filter(
      (e) => e.name !== exerciseName
    );

    // console.log(theWorkoutDay.day);
    // console.log(theExercise.name);

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== exerciseDay) return workout;
        return {
          ...workout,
          exercises: workout.exercises.filter((e) => e.name !== exerciseName),
        };
      }),
    }));
  };
  const handleExerciseClickFirebase = () => {
    // console.log(`You clicked on: ${exerciseDay}`);
    // console.log(`You clicked on: ${exerciseName}`);

    console.log(selectedExerciseFirebase);
    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === exerciseDay
    );

    if (!theWorkoutDay) return;

    theWorkoutDay.exercises = theWorkoutDay.exercises.filter(
      (e) => e.name !== exerciseName
    );

    // console.log(theWorkoutDay.day);
    // console.log(theExercise.name);

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== exerciseDay) return workout;
        return {
          ...workout,
          exercises: workout.exercises.filter((e) => e.name !== exerciseName),
        };
      }),
    }));
  };

  const handleExerciseChange = (e) => {
    setSelectedExercise(e.target.value);
  };

  // Handle day change
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  const handleAddExercise = () => {
    console.log("Selected Exercise: ", selectedExercise);
    console.log("Selected Day: ", selectedDay);
    console.log("Weekly Workout: ", weeklyWorkout.workouts);

    const workoutIndex = weeklyWorkout.workouts.findIndex(
      (w) => w.day === selectedDay
    );

    if (workoutIndex === -1) {
      showNotification(
        `Day ${selectedDay} not found in workout plan.`,
        "error"
      );
      return;
    }

    const theWorkoutDay = weeklyWorkout.workouts[workoutIndex];

    if (theWorkoutDay.exercises.includes(selectedExercise)) {
      showNotification(
        `${selectedExercise} is already added to ${selectedDay}`,
        "error"
      );
      return;
    }

    // Check if the selected day is a rest day
    if (theWorkoutDay.split.toLowerCase() === "rest") {
      showNotification(`Can't add an exercise to a rest day!`, "error");
      return;
    }

    // Make a copy of the workouts array
    const updatedWorkouts = [...weeklyWorkout.workouts];

    const addedExercise = {
      name: selectedExercise,
      sets: Math.floor(Math.random() * 2) + 3, // 3–4 sets
      reps: [8, 10, 12][Math.floor(Math.random() * 3)],
      weight: 0,
    };

    // Update the exercises array for the selected day
    updatedWorkouts[workoutIndex] = {
      ...theWorkoutDay,
      exercises: [...theWorkoutDay.exercises, addedExercise],
    };

    // Update the state immutably
    setWeeklyWorkout({
      ...weeklyWorkout,
      workouts: updatedWorkouts,
    });

    showNotification(`Updated your workout!`, "success");
  };

  const handleSetChange = (e) => {
    setSets(e.target.value);
    console.log("Selected sets:", e.target.value);
  };

  const handleRepChange = (e) => {
    setReps(e.target.value);
    console.log("Selected reps:", e.target.value);
  };
  const updateRepsAndSets = () => {
    console.log(selectedDay);
    console.log(selectedExercise);

    const theWorkoutDay = weeklyWorkout.workouts.find(
      (w) => w.day === selectedDay
    );

    if (!theWorkoutDay) return;

    const theExercise = theWorkoutDay.exercises.find(
      (e) => e.name === selectedExercise
    );

    if (!theExercise) return;

    setWeeklyWorkout((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) => {
        if (workout.day !== selectedDay) return workout;

        return {
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.name === selectedExercise ? { ...e, sets, reps } : e
          ),
        };
      }),
    }));
    showNotification(`Updated sets and reps!`, "success");
    handleClose();
  };

  const updateRepsAndSetsFirebase = async () => {
    try {
      console.log("Day:", currentDay);
      console.log("Exercise:", selectedExerciseFirebase);

      const weeklyWorkoutsCollectionRef = collection(
        db,
        "workouts",
        user.uid,
        "weeklyWorkouts"
      );

      const snapshot = await getDocs(weeklyWorkoutsCollectionRef);

      if (snapshot.empty) {
        console.error("No weeklyWorkout document found");
        return;
      }

      const workoutDoc = snapshot.docs[0];
      const docRef = workoutDoc.ref;
      const data = workoutDoc.data();

      const workouts = data.workouts || [];

      const updatedWorkouts = workouts.map((workout) => {
        if (workout.day !== currentDay) return workout;

        const updatedExercises = workout.exercises.map((ex) => {
          if (ex.name !== selectedExerciseFirebase) return ex;
          return { ...ex, sets, reps };
        });

        return { ...workout, exercises: updatedExercises };
      });

      await updateDoc(docRef, {
        workouts: updatedWorkouts,
      });

      showNotification(`Updated sets and reps!`, "success");
      handleClose();
    } catch (error) {
      console.error("Error updating sets/reps:", error);
      showNotification("Error updating workout", "error");
    }
  };

  return (
    <div>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={hideNotification}
      />
      <nav className="nav-meal">
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

      <div className="workoutWrapper">
        <div className="workoutCard">
          <div className="workoutCards">
            {doesntHaveWorkouts && (
              <div>
                <div className="header">
                  <Robot size={32} className="headerIcon" />
                  <h1 className="headerTitle">Workout Bot</h1>
                </div>

                <button
                  onClick={generateWorkout}
                  disabled={loading}
                  className="generateButton"
                >
                  <Robot size={20} />
                  {loading ? "Generating..." : "Generate Weekly Workout Plan"}
                </button>

                {/* Render weekly workout after it is generated */}
                {weeklyWorkout && (
                  <div className="weeklyWorkout">
                    <div className="weeklyWorkoutHeader">
                      <button
                        onClick={saveToFirebase}
                        disabled={loading}
                        className="saveButton"
                      >
                        <Save size={20} />
                        Save Workout
                      </button>
                    </div>
                    {/* Display the generated workout */}

                    <div className="workoutDays">
                      <select
                        id="day-select"
                        value={selectedDay}
                        onChange={handleDayChange}
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <div className="selectExercise">
                        <select
                          name="exercise"
                          id="exercise-select"
                          value={selectedExercise}
                          onChange={handleExerciseChange}
                        >
                          <option value="">Add Exercise</option>

                          <optgroup label="Chest">
                            <option value="Bench Press">Bench Press</option>
                            <option value="Incline Press">Incline Press</option>
                            <option value="Decline Press">Decline Press</option>
                            <option value="Dumbbell Flyes">
                              Dumbbell Flyes
                            </option>
                            <option value="Cable Crossovers">
                              Cable Crossover
                            </option>
                            <option value="Push-Ups">Push-Ups</option>
                          </optgroup>

                          <optgroup label="Back">
                            <option value="Pull-Ups">Pull-Up</option>
                            <option value="Rows">Row</option>
                            <option value="Lat Pulldowns">Lat Pulldown</option>
                            <option value="Seated Cable Rows">
                              Seated Cable Row
                            </option>
                            <option value="Deadlifts">Deadlift</option>
                            <option value="T-Bar Rows">T-Bar Row</option>
                          </optgroup>

                          <optgroup label="Arms">
                            <option value="Bicep Curls">Bicep Curl</option>
                            <option value="Tricep Pushdowns">
                              Tricep Pushdown
                            </option>
                            <option value="Hammer Curls">Hammer Curl</option>
                            <option value="Preacher Curls">
                              Preacher Curl
                            </option>
                            <option value="Skull Crushers">
                              Skull Crushers
                            </option>
                            <option value="Overhead Tricep Extension">
                              Overhead Tricep Extension
                            </option>
                          </optgroup>

                          <optgroup label="Legs">
                            <option value="Squats">Squat</option>
                            <option value="Leg Press">Leg Press</option>
                            <option value="Lunges">Lunges</option>
                            <option value="Leg Extension">Leg Extension</option>
                            <option value="Leg Curls">Leg Curl</option>
                            <option value="Step-Ups">Step-Ups</option>
                          </optgroup>

                          <optgroup label="Core">
                            <option value="Plank">Plank</option>
                            <option value="Crunches">Crunches</option>
                            <option value="Leg Raises">Leg Raises</option>
                            <option value="Russian Twists">
                              Russian Twist
                            </option>
                            <option value="Ab Wheel Rollout">
                              Ab Wheel Rollout
                            </option>
                            <option value="Mountain Climbers">
                              Mountain Climbers
                            </option>
                          </optgroup>

                          <optgroup label="Glutes">
                            <option value="Hip Thrusts">Hip Thrust</option>
                            <option value="Glute Bridge">Glute Bridge</option>
                            <option value="Cable Kickbacks">
                              Cable Kickbacks
                            </option>
                            <option value="Deadlifts">Deadlift</option>
                            <option value="Bulgarian Split Squats">
                              Bulgarian Split Squat
                            </option>
                            <option value="Frog Pumps">Frog Pumps</option>
                          </optgroup>
                        </select>

                        <button
                          className="addExercise"
                          onClick={handleAddExercise}
                        >
                          Add
                        </button>
                      </div>
                      {weeklyWorkout.workouts.map((workoutDay, index) => (
                        <div key={index} className="workoutDay">
                          <h3>{workoutDay.day}</h3>
                          {workoutDay.exercises.length > 0 ? (
                            <div className="exercises">
                              {workoutDay.exercises.map((exercise, exIndex) => (
                                <div key={exIndex} className="exercise">
                                  <p className="exerciseTitle">
                                    {exercise.name}
                                  </p>
                                  <p className="exerciseDetails">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                  <Trash2
                                    className="deleteTrash"
                                    onClick={() =>
                                      handleExerciseClick(
                                        workoutDay.day,
                                        exercise.name
                                      )
                                    }
                                  />
                                  <Pencil
                                    className="pencil"
                                    onClick={(event) =>
                                      handleClick(
                                        event,
                                        workoutDay.day,
                                        exercise.name
                                      )
                                    }
                                  />
                                  <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                      "aria-labelledby": "basic-button",
                                    }}
                                  >
                                    <MenuItem>
                                      <div className="menuWrapper">
                                        <select
                                          name="sets"
                                          id="sets"
                                          className="menuselect"
                                          value={sets}
                                          onChange={handleSetChange}
                                        >
                                          <option value="">Sets</option>
                                          {[...Array(5)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>

                                        <select
                                          name="reps"
                                          id="reps"
                                          className="menuselect"
                                          value={reps}
                                          onChange={handleRepChange}
                                        >
                                          <option value="">Reps</option>
                                          {[...Array(15)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="addReps"
                                          onClick={updateRepsAndSets}
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </MenuItem>
                                  </Menu>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No exercises for this day.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasWorkouts ? (
              <div className="grid gap-6">
                {/* <p>{currentDay}</p> */}
                {workouts.length > 0 ? (
                  <div className="space-y-3">
                    {/* {workouts.map((day, index) => ( */}
                    <div>
                      <div className="workoutCardwrapper">
                        <h3 className="exerciseDayTitle">{currentDay}</h3>
                        {todaysExercises.length > 0 ? (
                          <div className="space-y-3">
                            {[...todaysExercises]
                              .sort((a, b) => {
                                const musclePriorityByGender = {
                                  male: [
                                    "chest",
                                    "back",
                                    "arms",
                                    "shoulders",
                                    "legs",
                                    "glutes",
                                    "core",
                                  ],
                                  female: [
                                    "glutes",
                                    "legs",
                                    "core",
                                    "back",
                                    "shoulders",
                                    "arms",
                                    "chest",
                                  ],
                                };

                                const priority =
                                  musclePriorityByGender[gender] ||
                                  musclePriorityByGender.male;

                                const getMuscleGroup = (exerciseName) => {
                                  for (const group in exerciseDatabase) {
                                    if (
                                      exerciseDatabase[group].includes(
                                        exerciseName
                                      )
                                    ) {
                                      return group;
                                    }
                                  }
                                  return "core"; // fallback group
                                };

                                const aGroup = getMuscleGroup(a.name);
                                const bGroup = getMuscleGroup(b.name);

                                return (
                                  priority.indexOf(aGroup) -
                                  priority.indexOf(bGroup)
                                );
                              })
                              .map((exercise, exIndex) => (
                                <div key={exIndex} className="exercise">
                                  <p className="exerciseTitle">
                                    {exercise.name}
                                  </p>
                                  <p className="exerciseDetails">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                  <Pencil
                                    className="pencil"
                                    onClick={(event) => {
                                      handleClickFirebase(event, exercise.name);
                                    }}
                                  />
                                  <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                      "aria-labelledby": "basic-button",
                                    }}
                                  >
                                    <MenuItem>
                                      <div className="menuWrapper">
                                        <select
                                          name="sets"
                                          id="sets"
                                          className="menuselect"
                                          value={sets}
                                          onChange={handleSetChange}
                                        >
                                          <option value="">Sets</option>
                                          {[...Array(5)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>

                                        <select
                                          name="reps"
                                          id="reps"
                                          className="menuselect"
                                          value={reps}
                                          onChange={handleRepChange}
                                        >
                                          <option value="">Reps</option>
                                          {[...Array(15)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                              {i + 1}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          className="addReps"
                                          onClick={updateRepsAndSetsFirebase}
                                        >
                                          Update
                                        </button>
                                      </div>
                                    </MenuItem>
                                  </Menu>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p>No exercises planned for this day.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No workouts available.</p>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
