import React from 'react';

import { Navigate, Link } from "react-router-dom";

import AuthService from "../services/AuthService";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { RoleEnum } from '../types/role.type'
import { StoredUser } from '../types/user.type'

// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
  userReady: boolean,
  currentUser: StoredUser | null
};


class Profile extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            userReady: false,
            currentUser: null
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const currentUser = AuthService.getCurrentUser();
        const { navigate } = this.props;  // params injected from HOC wrapper component

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser, userReady: true });
            console.log(currentUser);
        }
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser } = this.state;

        return (
            <div className="container mb-4">
                {(userReady && currentUser != null) ?
                    <div>
                        <header className="jumbotron bg-dark text-light py-4">
                            <h3>
                                My Profile
                            </h3>
                        </header>

                        <hr className="pb-2"/>

                        <div className="row">

                            {/* picture box */}
                            <div className="card col-md-5 col-sm-12 mb-auto">

                                <img
                                  src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                                  alt="profile-img"
                                  className="profile-img-card my-4"
                                />

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

                                <Link to={`/edituser/${currentUser.id}`} className="btn btn-sm btn-info rounded-pill p-2 px-4 mx-auto">Edit My Details</Link>

                            </div>

                            <div className="col-md-6 col-sm-12">

                                <div className="card">
                                    <div className="card-header mb-4">
                                        <strong> My Authorities</strong>
                                    </div>

                                    <ul className="list-no-style">
                                        {currentUser.roles.map((role: RoleEnum, index: number) =>
                                            <li key={index}>
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                <span className="mx-2"></span>
                                                {role}
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="card">
                                    <div className="card-header mb-4">
                                        <strong> My Invoices </strong>
                                    </div>

                                    <div className="d-flex flex-column">
                                        <div className="d-flex justify-content-between px-2 mb-3">
                                            <div className="">
                                                <i className="bi bi-record-circle rounded-circle bg-draft px-1 custom-mr-10"></i>
                                                <span className="bg-draft-outline rounded-pill p-1 px-4">Drafts</span>
                                            </div>
                                            <div className="bg-light text-dark rounded-pill p-1 px-4">
                                                #
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between px-2 mb-3">
                                            <div className="">
                                                <i className="bi bi-record-circle rounded-circle bg-pending px-1 custom-mr-10"></i>
                                                <span className="bg-pending-outline rounded-pill p-1 px-4">Pending</span>
                                            </div>
                                            <div className="bg-light text-dark rounded-pill p-1 px-4">
                                                #
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between px-2 mb-3">
                                            <div className="">
                                                <i className="bi bi-record-circle rounded-circle bg-approved px-1 custom-mr-10"></i>
                                                <span className="bg-approved-outline rounded-pill p-1 px-4">Approved</span>
                                            </div>
                                            <div className="bg-light text-dark rounded-pill p-1 px-4">
                                                #
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between px-2 mb-3">
                                            <div className="">
                                                <i className="bi bi-record-circle rounded-circle bg-paid px-1 custom-mr-10"></i>
                                                <span className="bg-paid-outline rounded-pill p-1 px-4">Paid</span>
                                            </div>
                                            <div className="bg-light text-dark rounded-pill p-1 px-4">
                                                #
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(Profile)