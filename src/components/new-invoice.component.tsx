import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import AuthService from "../services/AuthService";

import styles from "../css/alert.module.css";

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
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    userReady: boolean,
    currentUser: IUser | null,
    loading: boolean,
    flash: boolean,
    flashMessage: string,
    flashType: Color
};

class CreateInvoice extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            userReady: false,
            currentUser: null,
            loading: false,
            flash: false,
            flashMessage: "",
            flashType: "info"
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { navigate } = this.props;  // params injected from HOC wrapper component

        const currentUser = AuthService.getCurrentUser();

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser, userReady: true })
        }
    }

    validationSchema() {

    }

    handleSubmit() {

    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser, loading, flash, flashMessage, flashType } = this.state;

        const initialValues = {
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
                                <strong> Create Invoice </strong>
                            </h3>
                        </header>
                        <div className="">

                            <Formik
                              initialValues={initialValues}
                              validationSchema={this.validationSchema}
                              onSubmit={this.handleSubmit}  // onSubmit function executes if there are no errors
                            >

                                <Form>
                                    <div className="row">
                                        <div className="row col-12">

                                            <div className = "row col-md-6 col-sm-12 pr-2">

                                                {/* Bill from */}
                                                <div className="form-group col-md-12 pb-1">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-lg">
                                                    <Field name="company-from" type="text" className="form-control" placeholder="Company Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="street-address-from" type="text" className="form-control" placeholder="Street Address"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="city-from" type="text" className="form-control" placeholder="City"/>
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <Field name="state-from" type="text" className="form-control" placeholder="State"/>
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <Field name="zip-from" type="text" className="form-control" placeholder="Zip"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="phone-from" type="text" className="form-control" placeholder="Phone"/>
                                                </div>

                                                {/* Bill to */}
                                                <div className="form-group col-md-12 pb-1 mt-4">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="name-to" type="text" className="form-control" placeholder="Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="company-to" type="text" className="form-control" placeholder="Company Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="street-address-to" type="text" className="form-control" placeholder="Street Address"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="city-to" type="text" className="form-control" placeholder="City"/>
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <Field name="state-to" type="text" className="form-control" placeholder="State"/>
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <Field name="zip-to" type="text" className="form-control" placeholder="Zip"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="phone-to" type="text" className="form-control" placeholder="Phone"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="email-to" type="text" className="form-control" placeholder="Email"/>
                                                </div>

                                            </div>

                                            <div className = "col-md-6 col-sm-12">
                                                <div className="border border-2 rounded-2">
                                                    <table className="table table-bordered-dark mb-0">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th> INVOICE # </th>
                                                                <th> DATE </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td> 001 </td>
                                                                <td> 8/29/2022 </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="row col-12">
                                            <div className = "row col-md-12 pr-2">

                                                {/* Items */}
                                                <div className="form-group col-md-12 pb-1 mt-4">
                                                    <div className="form-control col-md-12 border border-2 rounded-2 bg-light py-2 d-flex">
                                                        <strong className="col-md-6"> Description </strong>
                                                        <strong className="col-md-2"> Price ($) </strong>
                                                        <strong className="col-md-2"> Quantity </strong>
                                                        <strong className="col-md-2"> Amount ($) </strong>
                                                    </div>
                                                </div>

                                                <div className="input-group-sm col-md-12 d-flex">
                                                    <Field name="email-to" type="text" className="form-control text-start"/>
                                                    <Field name="email-to" type="text" className="form-control text-start"/>
                                                    <Field name="email-to" type="text" className="form-control text-start"/>
                                                    <Field name="email-to" type="text" className="form-control text-start"/>
                                                </div>


                                            </div>

                                        </div>

                                    </div>
                                </Form>
                            </Formik>

                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(CreateInvoice)

