// Authentication service

import axios from 'axios'
import axiosInstance from './MyAxios';

import UserService from './UserService';
import TokenService from './TokenService';


const API_URL = 'http://localhost:8080/api/auth/';

type RoleEnum = "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"

class AuthService {

    login(email: string, password: string) {
        // POST {email, password} & save login response details (including JWT) to Local Storage

        return axios
        .post(API_URL + "login", {
            email,
            password
        })
        .then(response => {
            if (response.data.accessToken) {
                // save to local storage
                TokenService.setUser(response.data);
            }

            return response.data;
        });
    }

    logout() {

         // remove user information from Local Storage
         TokenService.removeUser();
    }

    register(firstName: string, lastName: string, email: string, password: string, role: RoleEnum[]) {
        // POST {firstName, lastName, email, password, role}

        return axios.post(API_URL + "register", {
          firstName,
          lastName,
          email,
          password,
          role
        });
    }

    getCurrentUser() {
        // get stored user information from local storage
        return TokenService.getUser();
    }

    getRoles() {
        // get available roles from repository
        return axiosInstance.get(API_URL + "roles");
    }

}

export default new AuthService();