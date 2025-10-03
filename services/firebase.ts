// FIX: Use Firebase v8 compatibility imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
// FIX: Use v8 namespaced API to get auth service and provider.
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Add required OAuth scopes for Google Drive API access
googleProvider.addScope('https://www.googleapis.com/auth/drive.appdata');

// FIX: Export User type for use in other components, consistent with v8 API.
export type User = firebase.User;

export { auth, googleProvider };