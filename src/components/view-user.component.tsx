import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
type Role = {
    id: number,
    name: "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"
};

type IUser = {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    roles : Role[]
};

// types for the component props
interface Params {
    userID: string
};

type Props = WithRouterProps<Params>;

type State = {
    userReady: boolean,
    currentUser: IUser | null
};


class ViewUser extends React.Component<Props, State> {

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

        const { match, navigate } = this.props;  // params injected from HOC wrapper component
        const userID = parseInt(match.params.userID);

        UserService.getUser(userID).then((response) => {

            this.setState({ currentUser: response.data.user, userReady: true })
            //console.log(response.data.user);

        }).catch((error) => {
            navigate("/home"); // redirect to home page
        });
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser } = this.state;
        const { match } = this.props;  // props injected from HOC wrapper component

        return (
            <div className="container">
                {(userReady && currentUser != null) ?
                    <div>
                        <header className="jumbotron">
                            <h3>
                                <strong>{currentUser.email} </strong> Profile
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
                            {currentUser.firstName}
                        </p>
                        <p>
                            <strong>Last Name:</strong>{" "}
                            {currentUser.lastName}
                        </p>
                        <strong>Authorities:</strong>
                        <ul>
                            {currentUser.roles.map((role: Role, index: number) =>
                                <li key={index}>
                                    {role.name}
                                </li>
                            )}
                        </ul>

                        <Link to={`/edituser/${currentUser.id}`} className="btn btn-sm btn-info admin-action">Edit</Link>

                    </div>
                : null}
            </div>
        );
    }

}

export default withRouter(ViewUser)