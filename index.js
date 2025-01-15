/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc , serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js"
import { doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
/* === Firebase Setup === */

const firebaseConfig = {
    apiKey: "AIzaSyD2P2XxCOckAq0-lVzCKLl1PtQbC1ACKZY",
    authDomain: "hotcold-9560f.firebaseapp.com",
    projectId: "hotcold-9560f",
    storageBucket: "hotcold-9560f.firebasestorage.app",
    messagingSenderId: "976156553",
    appId: "1:976156553:web:13d580649bcd48ce4dd358"
};

const app = initializeApp(firebaseConfig);

/* Initialize Firebase Auth after initializing the app */
const auth = getAuth(app);
const db = getFirestore(app);
console.log(auth);

/* === UI === */

/* == UI - Elements == */

const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")
const fetchButtonEl = document.getElementById("fetch-btn")

const userGreetingEl = document.getElementById("user-greeting")

const userProfilePictureEl = document.getElementById("user-profile-picture")

const signOutButtonEl = document.getElementById("sign-out-btn");

const viewLoggedOut = document.getElementById("logged-out-view");
const viewLoggedIn = document.getElementById("logged-in-view");

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn");

const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");

const signInButtonEl = document.getElementById("sign-in-btn");
const createAccountButtonEl = document.getElementById("create-account-btn");

/* == UI - Event Listeners == */

postButtonEl.addEventListener("click", postButtonPressed)
fetchButtonEl.addEventListener("click", fetchButtonPressed)

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);
signOutButtonEl.addEventListener("click", authSignOut);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView()
        showProfilePicture(userProfilePictureEl, user)
    } else {
        showLoggedOutView()
    }
 })
 

console.log(app.options.projectId);

showLoggedOutView();

/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    console.log("Sign in with Google");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            showLoggedInView();
        } else {
            showLoggedOutView();
        }
    });
}

function authSignInWithEmail() {
    console.log("Sign in with email and password");

    const email = emailInputEl.value;
    const password = passwordInputEl.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            showLoggedInView();
        })
        .catch((error) => {
            console.error(error.message);
        });
}

function authCreateAccountWithEmail() {
    const email = emailInputEl.value;
    const password = passwordInputEl.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up
            showLoggedInView();
        })
        .catch((error) => {
            console.error(error.message);
        });
}

function authSignOut() {
    signOut(auth).then(() => {
        showLoggedOutView();
    }).catch((error) => {
        console.error(error);
    });
}

function showProfilePicture(imgElement, user) {
    if (user.photoURL) {
        imgElement.src = user.photoURL;
    } else {
        imgElement.src = "assets/images/default-profile-picture.jpeg";
    }
}

function showUserGreeting(element, user) {
    if (user.displayName) {
        const firstName = user.displayName.split(' ')[0];
        element.textContent = `Hi ${firstName}`;
    } else {
        element.textContent = "Hey friend, how are you?";
    }
}




/* == Functions - UI Functions == */

async function addPostToDB(postBody, user) {
    try {
        const document = await addDoc(collection(db, "posts"), {
            body: postBody,
            userId: user.uid, 
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", document.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}


function postButtonPressed() {
    const postBody = textareaEl.value;
    const user = auth.currentUser; 
   
    if (postBody && user) {
        addPostToDB(postBody, user); 
        clearInputField(textareaEl);
    } else {
        console.error("User not logged in or post body is empty.");
    }
}

async function fetchButtonPressed() {
    const user = auth.currentUser; 
    const postsRef = collection(db, "posts");
    
    if (user) {
        try {
            const querySnapshot = await getDocs(postsRef);
            if (!querySnapshot.empty) {
                let postsHTML = "";
                querySnapshot.forEach((doc) => {
                    const body = doc.data().body || "N/A";
                    const timestamp = doc.data().createdAt;
                    const date = timestamp ? timestamp.toDate().toLocaleString() : "N/A";
                    postsHTML += `
                        <div style="
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            padding: 10px;
                            margin: 10px 0;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        ">
                            <p>${date}</p>
                            <p>${body}</p>
                        </div>
                    `;
                });
                document.getElementById("post").innerHTML = postsHTML;
            } else {
                console.error("No documents");
                document.getElementById("post").innerHTML = "None.";
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    } else {
        console.error("User not logged in");
    }
}
function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
 }
 
 
 function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
 }
 
 
 function showView(view) {
    view.style.display = "flex"
 }
 
 
 function hideView(view) {
    view.style.display = "none"
 }
 
