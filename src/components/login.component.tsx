import React from 'react';
//import { Component } from "react";

import { Navigate } from "react-router-dom";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import AuthService from "../services/AuthService";


// types for the component props
type Props = {};

type State = {

    /** Whether to show loading circle animation */
    loading: boolean,

    /** feedback message to be displayed */
    message: string
};


class Login extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            loading: false,
            message: ""
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleLogin = this.handleLogin.bind(this);
    }

     validationSchema() {

         // create schema for validation
         return Yup.object().shape({
             email: Yup.string().required("This field is required!"),
             password: Yup.string().required("This field is required!"),
        });
     }

     handleLogin(formValue: { email: string; password: string }) {

          // handle data from form submission

          const { email, password } = formValue; // get data from form
          this.setState({
              loading: true
          });

          // log in user with email and password
          AuthService.login(email, password).then(
              () => { // validation ok

                  window.location.href="/user";  // redirect page
              },
              error => { // validation not ok
                  const resMessage =
                      (error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                      error.message ||
                      error.toString();

                  this.setState({
                      loading: false,
                      message: resMessage
                  });
              }
          );
     }

     //  render() - lifecycle method that outputs HTML to the DOM.
     render() {

          const { loading, message } = this.state;

          const initialValues = {
              email: "",
              password: "",
          };

          return(
              <div className="col-md-12">

                  <div className="card card-container">
                      <img
                          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                          alt="profile-img"
                          className="profile-img-card"
                      />
                      <Formik
                          initialValues={initialValues}
                          validationSchema={this.validationSchema}
                          onSubmit={this.handleLogin}
                      >
                          <Form>
                              <div className="form-group">
                                  <label htmlFor="email">Email</label>
                                  <Field name="email" type="text" className="form-control" />
                                  <ErrorMessage
                                      name="email"
                                      component="div"
                                      className="alert alert-danger"
                                  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="password">Password</label>
                                  <Field name="password" type="password" className="form-control" />
                                  <ErrorMessage
                                      name="password"
                                      component="div"
                                      className="alert alert-danger"
                                  />
                              </div>
                              <div className="form-group">
                                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>

                                      {/* loading circle animation */}
                                      {loading && (
                                          <span className="spinner-border spinner-border-sm"></span>
                                      )}
                                      <span>Login</span>
                                  </button>
                              </div>

                              {/* feedback message display */}
                              {message && (
                                  <div className="form-group">
                                      <div className="alert alert-danger" role="alert">
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

export default Login