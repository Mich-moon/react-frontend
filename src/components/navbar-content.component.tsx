import React from 'react';

import { Routes, Route, Link } from "react-router-dom";

import Login from "./login.component";
import Register from "./register.component";
import Home from "./home.component";
import Profile from "./profile.component";
import NotFound from "./page-not-found.component";

import BoardUser from "./board-user.component";
import BoardModerator from "./board-moderator.component";
import BoardAdmin from "./board-admin.component";

import AuthService from "../services/AuthService";


// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'


// types for the component props
type Props = {};

type State = {
    showModeratorBoard: boolean,
    showAdminBoard: boolean,
    currentUser: IUser | undefined
};


class NavContent extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.logOut = this.logOut.bind(this);

    }

    // componentDidMount() - lifecycle method to execute code when the
    // component is already placed in the DOM (Document Object Model).
    // This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered
    componentDidMount() {

        const user = AuthService.getCurrentUser();
        if (user) {
            this.setState({
                currentUser: user,
                showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
                showAdminBoard: user.roles.includes("ROLE_ADMIN"),
            });
        }

    }

    logOut() {
        AuthService.logout();
        this.setState({
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
        });
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

        return (

            <div className="d-flex d-inline w-100 justify-content-between">

                <Link to={"/"} className="navbar-brand">
                    SpringReact
                </Link>

                {currentUser ? (

                    <div className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <Link to={"/profile"} className="nav-link">
                                {currentUser.email}
                            </Link>
                        </li>

                        <li className="nav-item">
                            <a href="/" className="nav-link" onClick={this.logOut}>
                                LogOut
                            </a>
                        </li>
                    </div>

                ) : (

                    <div className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <Link to={"/login"} className="nav-link">
                                Login
                            </Link>

                        </li>
                        <li className="nav-item">
                            <Link to={"/register"} className="nav-link">
                                Sign Up
                            </Link>
                        </li>
                    </div>
                )}
            </div>
        );

    }
}

export default NavContent;
