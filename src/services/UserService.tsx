// Data service with methods for retrieving data from server

//import axios from 'axios'
//import authHeader from './AuthHeader';
import axiosInstance from './MyAxios';

// types and interfaces
import { Role } from '../types/role.type'


const USERS_REST_API_URL = 'http://localhost:8080/api/users/';
const TEST_REST_API_URL = 'http://localhost:8080/api/test/';


class UserService {

    // testing
    getPublicContent() {
        //return axios.get(TEST_REST_API_URL + 'all');
        return axiosInstance.get(TEST_REST_API_URL + 'all');
    }

    getUserBoard() {
        //return axios.get(TEST_REST_API_URL + 'user', { headers: authHeader() });
        return axiosInstance.get(TEST_REST_API_URL + 'user');

    }

    getModeratorBoard() {
        //return axios.get(TEST_REST_API_URL + 'mod', { headers: authHeader() });
        return axiosInstance.get(TEST_REST_API_URL + 'mod');
    }

    getAdminBoard() {
        //return axios.get(TEST_REST_API_URL + 'admin', { headers: authHeader() });
        return axiosInstance.get(TEST_REST_API_URL + 'admin');
    }


    //
    getUsers() {
        return axiosInstance.get(USERS_REST_API_URL);
    }

    getUser(id: number) {
        return axiosInstance.get(USERS_REST_API_URL + id);
    }

    deleteUser(id: number) {
        return axiosInstance.delete(USERS_REST_API_URL + id);
    }

    updateUser(u_id: number, u_firstName: string, u_lastName: string, u_email: string, u_password: string, u_roles: Role[]) {
        return axiosInstance.put(USERS_REST_API_URL + u_id, {
            firstName: u_firstName,
            lastName: u_lastName,
            email: u_email,
            password: u_password,
            roles: u_roles
        });
    }
}

export default new UserService();