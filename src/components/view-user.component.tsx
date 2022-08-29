import React from 'react';

import { Navigate } from "react-router-dom";

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";


// types and interfaces
type RoleEnum = "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"

type Role = {
    id: number,
    name: RoleEnum
}

type IUser = {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    roles : Role[],
}

// types for the component props
type Props = {};

type State = {
  redirect: string | null,
  userReady: boolean,
  currentUser: IUser | null
}


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
                                <strong>{(currentUser != null) ? currentUser.email : null} </strong> Profile
                            </h3>

                        </header>
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
                                    {/*role*/}
                                </li>
                            )}
                        </ul>
                    </div>
                : null}
            </div>
        );
    }

}

export default ViewUser