// type for user

import { Role } from './role.type'
import { RoleEnum } from './role.type'


export type IUser = {

    /** The unique identifier for the user */
    id: number,

    /** The user's email */
    email: string,

    /** The user's first name */
    firstName: string,

    /** The user's last name */
    lastName: string,

    /** The user's password */
    password: string,

    /** The user's role(s) */
    roles : Role[]
};


// user type for api response - AuthService.getCurrentUser()
export type StoredUser = {

    /** message accompanying API response */
    message: string,

    /** type of the access token */
    tokenType: "Bearer",

    /** value of the access token */
    accessToken: string,

    /** value of the refresh token */
    refreshToken: string,

    /** The unique identifier for the user */
    id: number,

    /** The user's email */
    email: string,

    /** The user's first name */
    firstName: string,

    /** The user's last name */
    lastName: string,

    /** The user's role(s) */
    roles : RoleEnum[]
};