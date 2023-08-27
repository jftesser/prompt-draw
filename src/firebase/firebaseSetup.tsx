import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { getFunctions, httpsCallable , connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from "./creds";

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);
connectFunctionsEmulator(functions, "localhost", 5001);

export const getImage = httpsCallable(functions, 'getImage');
export const getVariant = httpsCallable(functions, 'getVariant');

export const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            console.log('signed in as', userCredential.user);
            const user = userCredential.user;
            return user;
            // ...
        })
        .catch((error) => {

            return error;
        });

}

export const signOut = async () => {
    await firebaseSignOut(auth);
};

export type ProtectedRouteProps = {
    isAuthenticated: boolean;
    redirect: JSX.Element;
    outlet: JSX.Element;
};

export const ProtectedRoute = ({ isAuthenticated, redirect, outlet }: ProtectedRouteProps) => {
    if (isAuthenticated) {
        return outlet;
    } else {
        return redirect;
    }
};

