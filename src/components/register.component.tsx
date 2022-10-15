import React from 'react';

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import AuthService from "../services/AuthService";


// types and interfaces
import { RoleEnum } from '../types/role.type'


// types for the component props
type Props = {};

type State = {

    /** The user's role(s) */
    role: RoleEnum[],

    /** Whether registration was successful */
    successful: boolean,

    /** feedback message to be displayed */
    message: string
};


class Register extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            role: ["ROLE_USER"],
            successful: false,
            message: ""
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleRegister = this.handleRegister.bind(this);
        this.login = this.login.bind(this);

    }

    validationSchema() {

        // create schema for validation
        return Yup.object().shape({
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
            confirmPassword: Yup.string()
                .required('Confirm Password is required')
                .oneOf([Yup.ref('password'), null], 'Confirm Password does not match'),
                acceptTerms: Yup.bool().oneOf([true], 'Accept Terms is required'),
        });
    }

    handleRegister(formValue: { firstname: string; lastname: string; email: string; password: string }) {

        // handle data from form submission
        const { successful } = this.state;

        const { firstname, lastname, email, password } = formValue; // get data from form

        this.setState({
            message: "",
            successful: false
        }); // update state variables

        // register user with firstname, lastname, email, password and ROLE_USER
        AuthService.register(
            firstname,
            lastname,
            email,
            password,
            this.state.role
        ).then(
            response => { // validation ok
                this.setState({
                    message: response.data.message,
                    successful: true
                });

                this.login(email, password);  // log in user after successful registration
            },
            error => { // validation not ok
                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    successful: false,
                    message: resMessage
                });
            }
        );
    }

    login(email: string, password: string) {
        // log in user with email and password
        AuthService.login(email, password).then(

            () => { // validation ok
                window.location.href="/user";  // redirect page and refresh browser
            },
            error => { // validation not ok
                const resMessage =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    message: resMessage
                });
            }
        );
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { successful, message } = this.state;

        const initialValues = {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        };

        return (
            <div className="col-md-12">
                <div className="card card-container">

                    <h3>Register</h3>
                    <span className="mb-4"></span>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={this.validationSchema}
                        onSubmit={this.handleRegister}  // onSubmit function executes if there are no errors
                    >
                        <Form className="text-start">
                            {!successful && (
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="firstname"> Firstname </label>
                                        <Field name="firstname" type="text" className="form-control" />
                                        <ErrorMessage
                                            name="firstname"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastname"> Lastname </label>
                                        <Field name="lastname" type="text" className="form-control" />
                                        <ErrorMessage
                                            name="lastname"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email"> Email </label>
                                        <Field name="email" type="email" className="form-control" />
                                        <ErrorMessage
                                            name="email"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password"> Password </label>
                                        <Field
                                            name="password"
                                            type="password"
                                            className="form-control"
                                        />
                                        <ErrorMessage
                                            name="password"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword"> Confirm Password </label>
                                            <Field
                                                name="confirmPassword"
                                                type="password"
                                                className="form-control"
                                            />
                                            <ErrorMessage
                                                name="confirmPassword"
                                                component="div"
                                                className="text-danger"
                                            />
                                    </div>
                                    <div className="form-group form-check">
                                        <Field
                                            name="acceptTerms"
                                            type="checkbox"
                                            className="form-check-input"
                                        />
                                        <label htmlFor="acceptTerms" className="form-check-label">
                                            I have read and agree to the Terms
                                        </label>
                                        <ErrorMessage
                                             name="acceptTerms"
                                             component="div"
                                             className="text-danger"
                                        />
                                    </div>

                                    <div className="form-group my-4">

                                        <button type="submit" className="btn btn-primary btn-block mb-4 w-100">
                                            Register
                                        </button>
                                        <button type="reset" className="btn btn-light w-100">
                                            Reset
                                        </button>

                                    </div>
                                </div>
                            )}

                            {/* feedback message display */}
                            {message && (
                                <div className="form-group">
                                    <div
                                        className={
                                            successful ? "alert alert-success" : "alert alert-danger"
                                        }
                                        role="alert"
                                    >
                                        {message}
                                    </div>
                                </div>
                            )}
                        </Form>
                    </Formik>
                </div>
            </div>
        );
    }

}

export default Register