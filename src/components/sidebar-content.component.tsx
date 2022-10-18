import React from 'react';

import { Routes, Route, Link } from "react-router-dom";

import BoardUser from "./board-user.component";
import BoardModerator from "./board-moderator.component";
import BoardAdmin from "./board-admin.component";
import Settings from "./settings.component";

import AuthService from "../services/AuthService";


// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'


// styles
const styles = {
  sidebarLink: {
    display: "block",
    padding: "15px 1px",
    color: "white",
    textDecoration: "none"
  },
  divider: {
    height: "1px",
    backgroundColor: "#757575"
  },
  content: {
    height: "100%",
    width: "250px",
    backgroundColor: "#525252",
    color: "white"
  }
};


// types for the component props
type Props =  {};

type State = {
    showModeratorBoard: boolean,
    showAdminBoard: boolean,
    currentUser: IUser | undefined,
    activeItem: string
};

class SidebarContent extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
            activeItem: "dashboard"
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

    }


    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, showModeratorBoard, showAdminBoard, activeItem } = this.state;


        return (
            <div style={styles.content}>

                <nav className="sidebar" id="sidebar">

                    <div style={styles.sidebarLink}>
                        MENU
                    </div>

                    <div style={styles.divider}></div>

                    <div className="navbar-nav mr-auto" style={styles.sidebarLink}>

                        <li
                            className={`nav-item side-item px-2 ${activeItem === "home" && 'sidebar-active'}`}
                            onClick={() => this.setState({activeItem: "home"})}
                        >
                            <Link to={"/home"} className="nav-link">
                                <i className="bi bi-house-door align-self-center"></i>
                                <span className="mx-1"></span>
                                Home
                            </Link>
                        </li>

                        {showModeratorBoard && (
                            <li
                                className={`nav-item side-item px-2 ${activeItem === "invoices" && 'sidebar-active'}`}
                                onClick={() => this.setState({activeItem: "invoices"})}
                            >
                                <Link to={"/mod"} className="nav-link">
                                    <i className="bi bi-file-earmark-ruled align-self-center"></i>
                                    <span className="mx-1"></span>
                                    Invoices Board
                                </Link>
                            </li>
                        )}

                        {showAdminBoard && (
                            <li
                                className={`nav-item side-item px-2 ${activeItem === "members" && 'sidebar-active'}`}
                                onClick={() => this.setState({activeItem: "members"})}
                            >
                                <Link to={"/admin"} className="nav-link">
                                    <i className="bi bi-people align-self-center"></i>
                                    <span className="mx-1"></span>
                                    Members Board
                                </Link>
                            </li>
                        )}

                        {currentUser && (
                            <li
                                className={`nav-item side-item px-2 ${activeItem === "dashboard" && 'sidebar-active'}`}
                                onClick={() => this.setState({activeItem: "dashboard"})}
                            >
                                <Link to={"/user"} className="nav-link">
                                    <i className="bi bi-speedometer2 align-self-center"></i>
                                    <span className="mx-1"></span>
                                    My Dashboard
                                </Link>
                            </li>
                        )}

                        {currentUser && (
                            <li
                                className={`nav-item side-item px-2 ${activeItem === "settings" && 'sidebar-active'}`}
                                onClick={() => this.setState({activeItem: "settings"})}
                           >
                                <Link to={"/settings"} className="nav-link">
                                    <i className="bi bi-gear align-self-center"></i>
                                    <span className="mx-1"></span>
                                    Settings
                                </Link>
                            </li>
                        )}
                    </div>

                </nav>


            </div>
        );

    }
}

export default SidebarContent;