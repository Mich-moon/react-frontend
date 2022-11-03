import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import ReactModal from 'react-modal';  // for modal

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { Role, RoleEnum } from '../types/role.type'
import { IUser, StoredUser } from '../types/user.type'

// types for the component props
interface Params {
    userID: string
};

type Props = WithRouterProps<Params>;

type State = {
    /** Details of currently logged in user */
    currentUser: StoredUser | null,

    /** Details of user whose details are to be edited */
    viewedUser: IUser | null,

    /** User roles available for the app */
    appRoles: Role[] | null,

    /** Whether to show loading circle animation */
    loading_bio: boolean,
    loading_password: boolean,
    loading_role: boolean,

    /** Whether flash message should be displayed */
    flash: boolean,

    /** Message to be flashed */
    flashMessage: string,

    /** type of flash message */
    flashType: Color,

    /** Whether modal should be displayed */
    modal: boolean,

    /** Message to be displayed by the modal */
    modalMessage: string,

    /** Indicates what function should be called on modal confirmation */
    modalAction: string,

    /** Object of type Role to be used for updating a user's roles */
    updateRole: Role | null

};


class EditUser extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            viewedUser: null,
            appRoles: null,
            loading_bio: false,
            loading_password: false,
            loading_role: false,
            flash: false,
            flashMessage: "",
            flashType: "info",
            modal: false,
            modalMessage: "",
            modalAction: "",
            updateRole: null
        };

        // bind methods so that they are accessible from the state inside of the render() method.
            this.getUser = this.getUser.bind(this);
            this.handleBioEdit = this.handleBioEdit.bind(this);
            this.handlePasswordEdit = this.handlePasswordEdit.bind(this);
            this.addRole = this.addRole.bind(this);
            this.removeRole = this.removeRole.bind(this);
            this.login = this.login.bind(this);
            this.mockLogin = this.mockLogin.bind(this);
            this.isFound = this.isFound.bind(this);

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { navigate } = this.props;  // params injected from HOC wrapper component

        this.getUser();

        // store details for the user accessing the page
        const currentUser = AuthService.getCurrentUser();
        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser });
            //console.log(currentUser);
        }

        // get the user roles available on the app
        AuthService.getRoles().then((response) => {
            this.setState({ appRoles: response.data.roles })
            //console.log(response.data.roles);
        });
    }

    getUser() {
        // get user details from database

        const { match, navigate } = this.props;  // params injected from HOC wrapper component
        const userID = parseInt(match.params.userID);

        UserService.getUser(userID).then((response) => {

            this.setState({ viewedUser: response.data.user })
            //console.log(response.data.user);

        }).catch((error) => {
            navigate("/home"); // redirect to home page
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
            bio_password: Yup.string()
                .required("This field is required!"),
        });
    }

    validationSchemaPassword() {

         // create schema for validation
         return Yup.object().shape({
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

    async handleBioEdit(formValue: { id: number; firstname: string; lastname: string; email: string; bio_password:string }) {
        // uses information from general info edit form to update user's general info

        const { id, firstname, lastname, email, bio_password } = formValue; // get data from form

        const { viewedUser, currentUser } = this.state;

        if (viewedUser != null && currentUser != null) {
            this.setState({
                loading_bio: true // start loading button animation
            });

            if (await this.mockLogin(currentUser.email, bio_password)) { // re-login (current user's credentials) successful

                this.updateUser(
                    id,
                    firstname,
                    lastname,
                    email,
                    "NA",
                    viewedUser.roles
                );

                if (currentUser.id === viewedUser.id ) {
                    this.login(currentUser.email, bio_password);  // log in user to continue their session
                }

            } else { // current user's login failed

                this.setState({
                    flash: true,
                    flashMessage: "Confirmation failed: Invalid user credentials",
                    flashType: "error"
                });

                // set timer on flash message
                setTimeout(() => {
                    this.setState({ flash: false, flashMessage: ""});
                }, 5000);
            }
        }

        this.setState({
            loading_bio: false // stop loading button animation
        });
    }

    async handlePasswordEdit(formValue: { password: string; newPassword: string }) {
        // uses information from password edit form to update user's password

        const { password, newPassword } = formValue; // get data from form

        const { viewedUser, currentUser } = this.state;

        if (viewedUser != null && currentUser != null) {

            this.setState({
                loading_password: true // start loading button animation
            });

            if (await this.mockLogin(currentUser.email, password)) { // re-login (current user's credentials) successful
                console.log("SUCCESS");

                UserService.updateUserPassword( viewedUser.id, newPassword )
                .then(
                    response => { // update successful

                        this.getUser(); // re-fetch user's details from database

                        this.setState({
                            flash: true,
                            flashMessage: response.data.message,
                            flashType: "success"
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
                            flashType: "error"
                        });

                        console.log(resMessage);
                    }
                );

                if (currentUser.id === viewedUser.id ) {
                    this.login(currentUser.email, newPassword);  // log in user to continue their session
                }

            } else { // current user's login failed

                this.setState({
                    flash: true,
                    flashMessage: "Confirmation failed: Invalid user credentials",
                    flashType: "error"
                });
            }

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: ""});
            }, 5000);

        }

        this.setState({
            loading_password: false // stop loading button animation
        });
    }

    updateUser(id: number, firstName: string, lastName: string, email: string, password: string, roles: Role[]) {
        // updates details of the user being viewed with information provided

        UserService.updateUser(
            id,
            firstName,
            lastName,
            email,
            password,
            roles
        ).then(
            response => { // update successful

                this.getUser(); // re-fetch user's details from database

                this.setState({
                    flash: true,
                    flashMessage: response.data.message,
                    flashType: "success"
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
                    flashType: "error"
                });
            }
        );

        // set timer on flash message
        setTimeout(() => {
            this.setState({ flash: false, flashMessage: ""});
        }, 5000);
    }

    mockLogin(email: string, password: string): Promise<boolean> {
        // checks if login with email and password would be successful

        let result = AuthService.mockLogin(email, password)
        .then(
            response => { // validation ok
                return true
            },
            error => { // validation not ok

                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();

                //console.log(resMessage);
                return false
            }
        ).then( (response) => { return response; } );

        return result;
    }


    login(email: string, password: string) {
        // log in user with email and password

        AuthService.login(email, password)
        .then(

            () => { // validation ok
                console.log("re-login success");
            },
            error => { // validation not ok

                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();

                console.log("re-login failed :");
                console.log(resMessage);
                AuthService.logout();
                window.location.href="/";  // redirect page
            }
        );
    }

    removeRole(role: Role | null) {
        // removes a given role from the roles of the user being viewed

        const { viewedUser, appRoles } = this.state;

        if (viewedUser != null && appRoles != null && role != null) {
            this.setState({
                loading_role: true
            });

            const newRoles = viewedUser.roles.filter((item, j) => role.id !== item.id);
            //console.log(role);
            //console.log(newRoles);

            this.updateUser(
                viewedUser.id,
                viewedUser.firstName,
                viewedUser.lastName,
                viewedUser.email,
                viewedUser.password,
                newRoles
            );
        }

        this.setState({loading_role: false, modal: false, modalMessage: "", modalAction: "", updateRole: null});
    }

    addRole(role: Role | null) {
        // adds a given role to the roles of the user being viewed

        const { viewedUser } = this.state;

        if (viewedUser != null && role != null) {
            this.setState({
                loading_role: true
            });

            this.updateUser(
                viewedUser.id,
                viewedUser.firstName,
                viewedUser.lastName,
                viewedUser.email,
                viewedUser.password,
                viewedUser.roles.concat( role )
            );
        }

        this.setState({loading_role: false, modal: false, modalMessage: "", modalAction: "", updateRole: null});
    }

    isFound(roles: Role[], role: string): boolean {
        // checks if a given role name is found in an array of roles
        //  and returns the result

        const result = roles.some(element => {
            if (element.name === role) {
                return true;
            }
            return false;
        })

        return result;
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, viewedUser, appRoles, loading_bio, loading_password,
                loading_role, flash, flashMessage, flashType,
                modal, modalMessage, modalAction, updateRole } = this.state;
        const { match, navigate } = this.props;  // props injected from HOC wrapper component

        const currentID = viewedUser === null ? 0 : viewedUser.id;
        const currentFirstname = viewedUser === null ? '' : viewedUser.firstName;
        const currentLastname = viewedUser === null ? '' : viewedUser.lastName;
        const currentEmail = viewedUser === null ? '' : viewedUser.email;

        const initialValuesBio = {
            id: currentID,
            firstname: currentFirstname,
            lastname: currentLastname,
            email: currentEmail,
            bio_password: "",
        };

        const initialValuesPassword = {
            password: "",
            newPassword: "",
            confirmPassword: "",
        };


        return (
            <div className="container">

                {/* back button */}
                <button
                    type="button"
                    className="btn btn-lg rounded-circle position-absolute mx-2 start-0"
                    onClick={() => navigate(-1)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Go back"
                >
                    <i className="bi bi-arrow-left-circle-fill align-self-center fs-3"></i>
                </button>

                 {/* flash message */}
                 <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                     <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                 </Fade>

                {/* Modal */}
                <ReactModal
                   isOpen={modal}
                   onRequestClose={() => this.setState({modal: false, modalMessage: "", modalAction: "", updateRole: null})}
                   ariaHideApp={false}
                   style={{content: {width: '400px', height: '200px', inset: '35%'},
                           overlay: {backgroundColor: 'rgba(44, 44, 45, 0.35)'}
                         }}
                >
                    <div className="my-4"> {modalMessage} </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger custom-mr-10"
                      onClick={() => modalAction === "removeRole" ?  this.removeRole( updateRole ? updateRole : null ) : ( modalAction === "addRole" ? this.addRole( updateRole ? updateRole : null ) : "") }>
                        <span> { modalAction === "removeRole" ?  "Remove role" : ( modalAction === "addRole" ? "Add role" : "unknown") } </span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger custom-mr-10"
                      onClick={() => this.setState({modal: false, modalMessage: "", modalAction: "", updateRole: null})}>
                        <span>Cancel</span>
                    </button>
                </ReactModal>

                {(currentUser && currentUser != null && viewedUser && viewedUser != null) ?
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
                                            <td> {viewedUser.id} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> First Name </strong> </td>
                                            <td> {viewedUser.firstName} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> Last Name </strong> </td>
                                            <td> {viewedUser.lastName} </td>
                                        </tr>
                                        <tr>
                                            <td> <strong> Email </strong> </td>
                                            <td> {viewedUser.email} </td>
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
                                            <div className="form-group pb-1 mt-2">
                                                <Field name="bio_password" type="password" className="form-control" placeholder="My Password"/>
                                                <ErrorMessage
                                                  name="bio_password"
                                                  component="div"
                                                  className="alert alert-danger"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary" disabled={loading_bio}>

                                            {/* loading animation */}
                                            {loading_bio ? (
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
                                    <div className="form-group pb-1 mb-2">
                                        <Field name="password" type="password" className="form-control" placeholder="My Current Password"/>
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

                                    <button type="submit" className="btn btn-primary" disabled={loading_password}>

                                        {/* loading animation */}
                                        {loading_password ? (
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

                        {( appRoles && currentUser != null && currentUser.roles.includes(appRoles[0].name) ) ? (
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
                                                  className="btn btn-sm btn-primary custom-mr-10"
                                                  disabled={ this.isFound(viewedUser.roles, role.name) }
                                                  onClick={() =>  this.setState({modal: true,
                                                                  modalMessage: "Are you sure you want to add "+role.name+" ?",
                                                                  modalAction: "addRole",
                                                                  updateRole: role
                                                           }) }
                                                >
                                                    Add Role
                                                </button>

                                                <button
                                                  type="button"
                                                  className="btn btn-sm btn-danger custom-mr-10"
                                                  disabled={ !this.isFound(viewedUser.roles, role.name) }
                                                  onClick={() =>  this.setState({modal: true,
                                                                  modalMessage: "Are you sure you want to remove "+role.name+" ?",
                                                                  modalAction: "removeRole",
                                                                  updateRole: role
                                                           }) }
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