import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyB40MyBSxszQ3-T4mflll-4krvrdgtS3DE",
    authDomain: "reviewy-ec3a4.firebaseapp.com",
    projectId: "reviewy-ec3a4",
    storageBucket: "reviewy-ec3a4.appspot.com",
    messagingSenderId: "314519147649",
    appId: "1:314519147649:web:a13b3789270c4504476980"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore()

export const storage = getStorage()