import React, { Children, Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";


export type UserData = {
    name: string;
    email: string;
    phone: number;
    password: string;
    fcmToken: string;
    address: string;
    createdAt: string;
    id: number;
    roles: string;
    status: boolean;
    wallet_amount: number
}

export interface LoginContextInterface {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    role: string;
    setRole: React.Dispatch<React.SetStateAction<string>>;
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    notify: boolean;
    setNotify: React.Dispatch<React.SetStateAction<boolean>>;
    appToken: string,
    studentId: string;
    setStudentId: React.Dispatch<React.SetStateAction<string>>;
    optionsGet: any;
    options: any;
    userDetails: string;
    setUserDetails: React.Dispatch<React.SetStateAction<string>>
    centerId: any,
    setCenterId: React.Dispatch<React.SetStateAction<string>>
}

type LoginProviderProps = {
    children: React.ReactNode
}

export const LoginContext = createContext<Partial<LoginContextInterface>>({})

export default function LoginProvider({ children }: LoginProviderProps) {
    // const [user, setUser] = useState<User | any>()

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null | any>(null);
    const [role, setRole] = useState<string>('student');
    const [refresh, setRefresh] = useState<boolean | any>(false);
    const [appToken, setAppToken] = useState<string | undefined>('')
    const [notify, setNotify] = useState<boolean>(false);
    const [studentId, setStudentId] = useState<string | any>('');
    const [userDetails, setUserDetails] = useState<any>()
    const [centerId, setCenterId] = useState<any>()
    // const date = new Date();

    const options = { Authorization: `Bearer ${appToken}`, "Content-Type": "multipart/form-data" };
    const optionsGet = { Authorization: `Bearer ${appToken}`, "Content-Type": "application/json" };

    const getTokenFromLocalstorage = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // console.log("method call", token);
            if (token) {
                const decodedToken = jwtDecode<JwtPayload | undefined | any>(token);
                let defineRole: any = await AsyncStorage.getItem('role')
                console.log("defineRole: ", defineRole);

                const studentId = await AsyncStorage.getItem('studentId')
                const centerIdGet = await AsyncStorage.getItem('centerId')
                // console.log("context: studentId: ", studentId);
                setRole(defineRole)

                setAppToken(token)
                if (decodedToken && decodedToken.exp) {
                    setStudentId(studentId)
                    setCenterId(centerIdGet)
                    setUser(decodedToken as UserData); // Assuming result is the user data
                    setIsLoggedIn(true);
                } else {
                    await AsyncStorage.removeItem('userToken');
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.log('error on logical condition: ', error);
        }
    };

    // console.log("========================== login provider =================================================================");

    // console.log("studentId: ", studentId);
    // console.log("centerId: ", centerId);


    useEffect(() => {
        getTokenFromLocalstorage();
    }, [isLoggedIn]);

    return (
        <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, role, setRole, refresh, setRefresh, notify, setNotify, appToken, studentId, setStudentId, options, optionsGet, userDetails, setUserDetails, centerId, setCenterId }}>{children}</LoginContext.Provider>
    )
}

export const useLogin = (): Partial<LoginContextInterface | any> => {
    const context = useContext(LoginContext);
    if (context === undefined) {
        throw new Error("useLogin must be used within a LoginProvider");
    }
    return context;
};