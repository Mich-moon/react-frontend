import React from 'react';
import UserService from '../services/UserService';


// types and interfaces
type Role = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_MODERATOR";  // possible user role values

// type for User object
interface User {

    /** The unique identifier for the user */
    id: number;

    /** The user's first name */
    firstName:  string;

    /** The user's last name */
    lastName: string;

    /** The user's email */
    email: string;

    /** The user's password */
    password: string;

    /** The user's role */
    role: Role;
}

// explicitly define the typings for the componentDidMounts state
interface userState {
    users: User[]; // 'users' is a list with elements of type User
}

class User extends React.Component<{}, userState> {

    // constructor() - is invoked before the component is mounted.
     constructor(props: any){

         // declare state variables
         super(props)
         this.state = {
             users: []
         }
     }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
     componentDidMount(){
         UserService.getUsers().then((response) => {
             this.setState({ users: response.data})
         });
     }

    //  render() - lifecycle method that outputs HTML to the DOM.
     render (){
         return (
             <div>
                 <h1 className = "text-center"> Users List</h1>
                 <table className = "table table-striped">
                     <thead>
                         <tr>

                             <td> User Id </td>
                             <td> User First Name </td>
                             <td> User Last Name </td>
                             <td> User Email </td>
                         </tr>

                     </thead>
                     <tbody>
                         {
                             this.state.users.map(
                                 user =>
                                 <tr key = {user.id}>
                                      <td> {user.id}</td>
                                      <td> {user.firstName}</td>
                                      <td> {user.lastName}</td>
                                      <td> {user.email}</td>
                                 </tr>
                             )
                         }

                     </tbody>
                 </table>

             </div>

         )
     }
}

export default User