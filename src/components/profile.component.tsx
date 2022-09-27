import React from 'react';

import { Navigate, Link } from "react-router-dom";

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { RoleEnum } from '../types/role.type'
import { StoredUser } from '../types/user.type'

// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
  redirect: string | null,
  userReady: boolean,
  currentUser: StoredUser | null
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
            this.setState({ currentUser: currentUser, userReady: true });
            console.log(currentUser);
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
                {(userReady && currentUser != null) ?
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
                            {currentUser.id}

                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            {currentUser.email}
                        </p>
                        <p>
                            <strong>First Name:</strong>{" "}
                            {currentUser.firstName}
                        </p>
                        <p>
                            <strong>Last Name:</strong>{" "}
                            {currentUser.lastName}
                        </p>
                        <strong>Authorities:</strong>
                        <ul>
                            {currentUser.roles.map((role: RoleEnum, index: number) =>
                                <li key={index}>
                                    {role}
                                </li>
                            )}
                        </ul>

                        <Link to={`/edituser/${currentUser.id}`} className="btn btn-sm btn-info admin-action">Edit My Details</Link>

                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(Profile)