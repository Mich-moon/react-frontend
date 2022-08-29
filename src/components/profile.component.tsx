import React from 'react';

import { Redirect } from "react-router-dom";

import AuthService from "../services/AuthService";
import UserServiceService from "../services/UserService";


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
  currentUser: IUser || { accessToken: string }
};


class Profile extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            redirect: null,
            userReady: false,
            currentUser: { accessToken: "" }
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const currentUser = AuthService.getCurrentUser();

        if (!currentUser) {
            this.setState({ redirect: "/home" });  // store a path to redirect to
        } else {
            this.setState({ currentUser: currentUser, userReady: true })
        }
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />  // redirect page

        }

        const { currentUser } = this.state;

        return (
            <div className="container">
                {(this.state.userReady) ?
                    <div>
                        <header className="jumbotron">
                            <h3>
                                <strong>{currentUser.username}</strong> Profile
                            </h3>
                        </header>
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
                            {currentUser.first}
                        </p>
                        <p>
                            <strong>Last Name:</strong>{" "}
                            {currentUser.lastName}
                        </p>
                        <strong>Authorities:</strong>
                        <ul>
                            {currentUser.roles &&
                            currentUser.roles.map((role, index) => <li key={index}>{role}</li>)}
                        </ul>
                    </div>
                : null}
            </div>
        );
    }

}

export default Profile