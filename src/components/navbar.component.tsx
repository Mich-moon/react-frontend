import React from 'react';

import { Routes, Route, Link } from "react-router-dom";


import logo from './logo.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import AuthService from "./services/AuthService";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import NotFound from "./components/page-not-found.component";

import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";


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
    showModeratorBoard: boolean,
    showAdminBoard: boolean,
    currentUser: IUser | undefined
}


class App extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.logOut = this.logOut.bind(this);
        this.state = {
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
        };
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

            //EventBus.on("logout", this.logOut);
    }

    // componentDidMount() - lifecycle method to execute code when the
    // component gets destroyed or unmounted from the DOM (Document Object Model).
    componentWillUnmount() {
        //EventBus.remove("logout", this.logOut);
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

            <div className="App">

                {/* NAVIGATION BAR */}

                <nav className="navbar navbar-expand navbar-dark bg-dark">

                    <Link to={"/"} className="navbar-brand">
                        SpringReact
                    </Link>

                    <div className="navbar-nav mr-auto">

                        <li className="nav-item">
                            <Link to={"/home"} className="nav-link">
                                Home
                            </Link>
                        </li>

                        {showModeratorBoard && (
                            <li className="nav-item">
                                <Link to={"/mod"} className="nav-link">
                                    Moderator Board
                                </Link>
                            </li>
                        )}

                        {showAdminBoard && (
                            <li className="nav-item">
                                <Link to={"/admin"} className="nav-link">
                                    Admin Board
                                </Link>
                            </li>
                        )}

                        {currentUser && (
                            <li className="nav-item">
                                <Link to={"/user"} className="nav-link">
                                    User Board
                                </Link>
                            </li>
                        )}

                    </div>

                    {currentUser ? (

                        <div className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link to={"/profile"} className="nav-link">
                                    {currentUser.email}
                                </Link>
                            </li>

                            <li className="nav-item">
                                <a href="/login" className="nav-link" onClick={this.logOut}>
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

                </nav>

                {/* Defining all routes for app */}
                <div className="container mt-3">

                    <Routes>
                        { /* You don't need to use an exact prop... all paths match exactly by default. */}
                        <Route path="/" element={ <Home/> } />
                        <Route path="/home" element={ <Home/> } />

                        <Route path="/login" element={ <Login/> } />
                        <Route path="/register" element={ <Register/> } />
                        <Route path="/profile" element={ <Profile/> } />
                        <Route path="/user" element={ <BoardUser/> } />
                        <Route path="/mod" element={ <BoardModerator/> } />
                        <Route path="/admin" element={ <BoardAdmin/> } />
                        <Route path="*" element={ <NotFound/> } />     {/* fallback for unmatched route */}
                    </Routes>
                </div>

            </div>
        );

    }
}

export default App;
