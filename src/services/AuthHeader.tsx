//  a helper function to generate http Authorization header for accessing authorized resources

import TokenService from './TokenService';


export default function authHeader() {

    const userStr = TokenService.getUser(); // get stored user information from local storage

    let user = null;

    if (userStr)

    if (userStr && userStr.accessToken) { // if user item is present and is a logged in user with accessToken (JWT)

        return { Authorization: 'Bearer ' + userStr.accessToken }; // return HTTP Authorization header.

    } else {
        return { Authorization: '' };   // return empty object
    }
}