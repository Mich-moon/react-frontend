import React from 'react';

import { Navigate } from "react-router-dom";

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";


// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'


// types for the component props
type Props = {};

type State = {
  redirect: string | null,
  userReady: boolean,
  currentUser: IUser | null
};


class Profile extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            redirect: null,
            userReady: false,
            currentUser: null
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const currentUser = AuthService.getCurrentUser();

        if (currentUser === null) {
            this.setState({ redirect: "/home" });  // store a path to redirect to
        } else {
            this.setState({ currentUser: currentUser, userReady: true })
        }
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { redirect, userReady, currentUser } = this.state;

        if (redirect) {
            return <Navigate to={redirect} />  // redirect page

        }

        return (
            <div className="container">
                {(userReady) ?
                    <div>
                        <header className="jumbotron">
                            <h3>
                                My Profile
                            </h3>

                        </header>

                        <img
                          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                          alt="profile-img"
                          className="profile-img-card my-4"
                        />

                        <hr className="pb-2"/>

                        <p>
                            <strong>Id:</strong>{" "}
                            {(currentUser != null) ? currentUser.id : null}

                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            {(currentUser != null) ? currentUser.email : null}
                        </p>
                        <p>
                            <strong>First Name:</strong>{" "}
                            {(currentUser != null) ? currentUser.firstName : null}
                        </p>
                        <p>
                            <strong>Last Name:</strong>{" "}
                            {(currentUser != null) ? currentUser.lastName : null}
                        </p>
                        <strong>Authorities:</strong>
                        <ul>
                            {currentUser != null && currentUser.roles.map((role: Role, index: number) =>
                                <li key={index}>
                                    {role.name}
                                </li>
                            )}
                        </ul>
                    </div>
                : null}
            </div>
        );
    }

}

export default Profile