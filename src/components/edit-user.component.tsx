import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'

// types for the component props
interface Params {
    userID: string
};

type Props = WithRouterProps<Params>;

type State = {
    /** */
    userReady: boolean,

    /** Details of currently logged in user */
    currentUser: IUser | null,

    /** User roles available for the app */
    appRoles: Role[] | null,

    /** Whether to show loading circle animation */
    loading: boolean,

    /** Whether flash message should be displayed */
    flash: boolean,

    /** Message to be flashed */
    flashMessage: string,

    /** type of flash message */
    flashType: Color

};


class EditUser extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            userReady: false,
            currentUser: null,
            appRoles: null,
            loading: false,
            flash: false,
            flashMessage: "",
            flashType: "info"
        };

        // bind methods so that they are accessible from the state inside of the render() method.
            this.handleBioEdit = this.handleBioEdit.bind(this);
            this.handlePasswordEdit = this.handlePasswordEdit.bind(this);
            this.addRole = this.addRole.bind(this);
            this.removeRole = this.removeRole.bind(this);

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

        AuthService.getRoles().then((response) => {
            this.setState({ appRoles: response.data.roles })
            //console.log(response.data.roles);
        });

    }

    validationSchemaBio() {

         // create schema for validation
        return Yup.object().shape({
            id: Yup.number()
                .required("This field is required!"),
            firstname: Yup.string()
                .test(
                    "len",
                    "The firstname must be between 1 and 20 characters.",
                    (val: any) =>
                        val &&
                        val.toString().length >= 1 &&
                        val.toString().length <= 20
                )
                .required("This field is required!"),
            lastname: Yup.string()
                .test(
                    "len",
                    "The lastname must be between 1 and 20 characters.",
                    (val: any) =>
                        val &&
                        val.toString().length >= 1 &&
                        val.toString().length <= 20
                )
                .required("This field is required!"),
            email: Yup.string()
                .email("This is not a valid email.")
                .required("This field is required!"),
        });
    }

    validationSchemaPassword() {

         // create schema for validation
         return Yup.object().shape({
             email: Yup.string()
                 .required("This field is required!"),
             password: Yup.string()
                 .test(
                    "len",
                    "The password must be between 6 and 40 characters.",
                    (val: any) =>
                        val &&
                        val.toString().length >= 6 &&
                        val.toString().length <= 40
                    )
                .required("This field is required!"),
             newPassword: Yup.string()
                 .test(
                    "len",
                    "The password must be between 6 and 40 characters.",
                    (val: any) =>
                        val &&
                        val.toString().length >= 6 &&
                        val.toString().length <= 40
                    )
                .required("This field is required!"),
             confirmPassword: Yup.string()
                .required('Confirm Password is required')
                .oneOf([Yup.ref('newPassword'), null], 'Confirm Password does not match'),
        });
    }

    handleBioEdit(formValue: { id: number; firstname: string; lastname: string; email: string; }) {

        // handle data from form submission
        const { id, firstname, lastname, email } = formValue; // get data from form

        const { currentUser } = this.state;

        if (currentUser != null) {
            this.setState({
                loading: true
            });

            this.updateUser(
                id,
                firstname,
                lastname,
                email,
                currentUser.password,
                currentUser.roles
            );
        }

    }

    handlePasswordEdit(formValue: { email: string; password: string; newPassword: string }) {

        // handle data from form submission
        const { email, password, newPassword } = formValue; // get data from form

        const { currentUser } = this.state;

        if (currentUser != null) {

            this.setState({
                loading: true // start loading button animation
            });

            // log in user with email and password
            AuthService.login(email, password).then(
                () => { // validation ok

                    this.updateUser(
                        currentUser.id,
                        currentUser.firstName,
                        currentUser.lastName,
                        email,
                        newPassword,
                        currentUser.roles
                    );

                },
                error => { // validation not ok
                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();

                    this.setState({
                        flash: true,
                        flashMessage: resMessage,
                        flashType: "error",
                        loading: false
                    });

                    // set timer on flash message
                    setTimeout(() => {
                        this.setState({ flash: false, flashMessage: "" });
                    }, 5000);
                }
            );
        }
    }

    updateUser(id: number, firstName: string, lastName: string, email: string, password: string, roles: Role[]) {


        UserService.updateUser(
            id,
            firstName,
            lastName,
            email,
            password,
            roles
        ).then(
            response => { // update successful

                this.setState({
                    flash: true,
                    flashMessage: response.data.message,
                    flashType: "success",
                    loading: false
                });
            },
            error => { // update not successful
                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    flash: true,
                    flashMessage: resMessage,
                    flashType: "error",
                    loading: false
                });
            }
        );

        // set timer on flash message
        setTimeout(() => {
            this.setState({ flash: false, flashMessage: ""});
        }, 5000);
    }

    removeRole(role: Role) {

        const { currentUser } = this.state;
        if (currentUser != null) {
            this.setState({
                loading: true
            });

            this.updateUser(
                currentUser.id,
                currentUser.firstName,
                currentUser.lastName,
                currentUser.email,
                currentUser.password,
                currentUser.roles.splice( currentUser.roles.indexOf(role), 1 )
            );
        }

    }

    addRole(role: Role) {

    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser, appRoles, loading, flash, flashMessage, flashType } = this.state;
        const { match } = this.props;  // props injected from HOC wrapper component

        const currentID = currentUser === null ? 0 : currentUser.id;
        const currentFirstname = currentUser === null ? '' : currentUser.firstName;
        const currentLastname = currentUser === null ? '' : currentUser.lastName;
        const currentEmail = currentUser === null ? '' : currentUser.email;
        const currentEmail2 = currentUser === null ? '' : currentUser.email;

        const initialValuesBio = {
            id: currentID,
            firstname: currentFirstname,
            lastname: currentLastname,
            email: currentEmail
        };

        const initialValuesPassword = {
            email: currentEmail2,
            password: "",
            newPassword: "",
            confirmPassword: "",
        };


        return (
            <div className="container">

                 {/* flash message */}
                 <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                     <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                 </Fade>

                {(userReady && currentUser != null) ?
                    <div>
                        <header className="jumbotron">
                            <h3>
                                <strong> Edit User Page </strong>
                            </h3>
                        </header>

                        <img
                          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                          alt="profile-img"
                          className="profile-img-card my-4"
                        />

                        <hr className="pb-2"/>

                        {/* Edit general user details */}
                        <h4 className="mb-4"> Biography </h4>
                        <div className="row">
                            <div className = "col-md-6 col-sm-12">
                                <table className = "table table-striped">

                                    <thead>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td> <strong> Id:</strong> </td>
                                            <td> {currentUser.id} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> First Name </strong> </td>
                                            <td> {currentUser.firstName} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> Last Name </strong> </td>
                                            <td> {currentUser.lastName} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> Email </strong> </td>
                                            <td> {currentUser.email} </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-md-6 col-sm-12">
                                <Formik
                                    initialValues={initialValuesBio}
                                    validationSchema={this.validationSchemaBio}
                                    onSubmit={this.handleBioEdit}  // onSubmit function executes if there are no errors
                                >
                                    <Form>
                                        <div>
                                            <div className="form-group pb-1">
                                                <Field name="id" type="text" className="form-control" placeholder="ID" disabled/>
                                            </div>
                                            <div className="form-group pb-1">
                                                <Field name="firstname" type="text" className="form-control" placeholder="First Name"/>
                                                <ErrorMessage
                                                  name="firstname"
                                                  component="div"
                                                  className="alert alert-danger"
                                                />
                                            </div>
                                            <div className="form-group pb-1">
                                                <Field name="lastname" type="text" className="form-control" placeholder="Last Name"/>
                                                <ErrorMessage
                                                  name="lastname"
                                                  component="div"
                                                  className="alert alert-danger"
                                                />
                                            </div>
                                            <div className="form-group pb-1">
                                                <Field name="email" type="email" className="form-control" placeholder="Email"/>
                                                <ErrorMessage
                                                  name="email"
                                                  component="div"
                                                  className="alert alert-danger"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary" disabled={loading}>

                                            {/* loading animation */}
                                            {loading ? (
                                                <span>
                                                    <span className="spinner-grow spinner-grow-sm mr-4"></span>
                                                    Loading..
                                                </span>
                                            ): (
                                                <span>Submit</span>
                                            )}

                                        </button>
                                    </Form>
                                </Formik>
                            </div>
                        </div>

                        <hr className="pb-2"/>

                        {/* Edit password */}
                        <h4 className="mb-4"> Password </h4>
                        <div className="col-md-6 col-sm-12">
                            <Formik
                              initialValues={initialValuesPassword}
                              validationSchema={this.validationSchemaPassword}
                              onSubmit={this.handlePasswordEdit}  // onSubmit function executes if there are no errors
                            >
                                <Form>
                                    <div className="form-group pb-1">
                                        <Field name="email" type="email" className="form-control" disabled/>
                                        <ErrorMessage
                                          name="email"
                                          component="div"
                                          className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group pb-1">
                                        <Field name="password" type="password" className="form-control" placeholder="Current Password"/>
                                        <ErrorMessage
                                          name="password"
                                          component="div"
                                          className="alert alert-danger"
                                        />
                                    </div>

                                    <div className="form-group pb-1">
                                        <Field name="newPassword" type="password" className="form-control" placeholder="New Password"/>
                                        <ErrorMessage
                                          name="newPassword"
                                          component="div"
                                          className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group pb-1">
                                        <Field name="confirmPassword" type="password" className="form-control" placeholder="Confirm Password"/>
                                        <ErrorMessage
                                          name="confirmPassword"
                                          component="div"
                                          className="text-danger"
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>

                                        {/* loading animation */}
                                        {loading ? (
                                            <span>
                                                <span className="spinner-grow spinner-grow-sm mr-4"></span>
                                                Loading..
                                            </span>
                                        ): (
                                            <span>Submit</span>
                                        )}

                                    </button>
                                </Form>
                            </Formik>
                        </div>

                        <hr className="pb-2"/>

                        {/* Edit User Roles */}
                        <h4 className="mb-4"> User Roles </h4>

                        {( appRoles && currentUser != null /* && currentUser.roles.includes(appRoles[0]) */ ) ? (
                        <div>
                            <table className = "table table-striped">
                                <thead>
                                    <tr>
                                        <td> <strong> Available Roles </strong> </td>
                                        <td> <strong> Actions </strong> </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appRoles.map((role: Role, index: number) =>
                                        <tr key={index}>
                                            <td>
                                                <button className="btn btn-outline-info btn-sm rounded-pill disabled">
                                                    {role.name}
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                  type="button"
                                                  className="btn btn-sm btn-primary admin-action"
                                                  disabled={!(currentUser.roles.includes(role))}
                                                  onClick={() => this.addRole(role)}
                                                >
                                                    Add Role
                                                </button>

                                                <button
                                                  type="button"
                                                  className="btn btn-sm btn-danger admin-action"
                                                  disabled={currentUser.roles.includes(role)}
                                                  onClick={() => this.removeRole(role)}
                                                >
                                                    Remove Role
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        ) : (
                            <p> Only available for admin </p>
                        )}

                    </div>

                : null}
            </div>
        );
    }

}

export default withRouter(EditUser)