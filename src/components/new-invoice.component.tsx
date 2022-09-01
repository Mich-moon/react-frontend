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

type InvoiceItem = {
    description: string,
    price: number,
    quantity: number,
    amount: number
};

type State = {
    userReady: boolean,
    currentUser: IUser | null,
    loading: boolean,
    flash: boolean,
    flashMessage: string,
    flashType: Color,
    invoiceItems: InvoiceItem[],
    subtotal: number,
    tax: number,
    totalDue: number
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
            flashType: "info",
            invoiceItems: [{
                description: "",
                price: 0.00,
                quantity: 0.00,
                amount: 0.00
            }],
            subtotal: 0.00,
            tax: 0.00,
            totalDue: 0.00
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { navigate } = this.props;  // params injected from HOC wrapper component

        const currentUser = AuthService.getCurrentUser();

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser, userReady: true });
        }
    }

    validationSchema() {

        // create schema for validation
        return Yup.object().shape({
            companyFrom: Yup.string()
                .required("This field is required!"),
            streetAddressFrom: Yup.string()
                .required("This field is required!"),
            cityFrom: Yup.string()
                 .required("This field is required!"),
            zipFrom: Yup.string()
                 .required("This field is required!"),
            phoneFrom: Yup.string()
                 .required("This field is required!"),
            nameTo: Yup.string()
                 .required("This field is required!"),
            companyTo: Yup.string()
                 .required("This field is required!"),
            streetAddressTo: Yup.string()
                 .required("This field is required!"),
            cityTo: Yup.string()
                 .required("This field is required!"),
            stateTo: Yup.string()
                 .required("This field is required!"),
            zipTo: Yup.string()
                 .required("This field is required!"),
            phoneTo: Yup.string()
                 .required("This field is required!"),
            emailTo: Yup.string()
                 .required("This field is required!"),

        });

    }

    handleSubmit(formValue: { companyFrom: string; streetAddressFrom: string; cityFrom: string; zipFrom: string; phoneFrom: string;
                               nameTo: string; companyTo: string; streetAddressTo: string; cityTo: string; stateTo: string;
                               zipTo: string; phoneTo: string; emailTo: string; }) {

        // handle data from form submission
        const { companyFrom, streetAddressFrom, cityFrom, zipFrom, phoneFrom,
                nameTo, companyTo, streetAddressTo, cityTo, stateTo, zipTo, phoneTo, emailTo } = formValue; // get data from form

        console.log(companyFrom);

    }

    addItem() {
        // add a new item to the invoice

        let items = this.state.invoiceItems;
        items.push({
            description: "",
            price: 0.00,
            quantity: 0.00,
            amount: 0.00
        });
        this.setState({ invoiceItems: items });
    }

    removeItem(index: number) {
        // remove an item from the invoice

        let items = this.state.invoiceItems;
        console.log(items);

        if (items.length !== 1) {
            items.splice(index, 1);
            this.setState({ invoiceItems: items });

        } else {
            // flash message for failure
            this.setState({
                flash: true,
                flashMessage: "Invoice must have at least one item",
                flashType: "warning"
            });

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);
        }
    }

    subtotal() {

        let items = this.state.invoiceItems;

        let total = items.reduce( function(accumulator=0, currentValue) {

            if (currentValue != null) {
                return accumulator + currentValue.price;
            }
        }, 0);

        return total;
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser, loading, flash, flashMessage, flashType,
                invoiceItems, subtotal, tax, totalDue } = this.state;

        const initialValues = {
            companyFrom: "",
            streetAddressFrom: "",
            cityFrom: "",
            stateFrom: "",
            zipFrom: "",
            phoneFrom: "000-0000",
            nameTo: "",
            companyTo: "",
            streetAddressTo: "",
            cityTo: "",
            stateTo: "",
            zipTo: "",
            phoneTo: "000-0000",
            emailTo: ""
        };

        return (
            <div className="container mb-4">

                {/* flash message */}
                 <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                     <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                 </Fade>

                {(userReady && currentUser != null) ?
                    <div>
                        <header className="jumbotron">
                            <h3>
                                <strong> Invoice </strong>
                            </h3>
                        </header>
                        <div className="">

                            <Formik
                              initialValues={initialValues}
                              validationSchema={this.validationSchema}
                              onSubmit={this.handleSubmit}  // onSubmit function executes if there are no errors
                            >

                                <Form>
                                    <div className="row m-0">
                                        <div className="row m-0 col-12">
                                            <div className = "row mx-0 col-md-6 col-sm-12">

                                                {/* Bill from */}
                                                <div className="form-group col-md-12 pb-1">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-lg">
                                                    <Field name="companyFrom" type="text" className="form-control" placeholder="Company Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="streetAddressFrom" type="text" className="form-control" placeholder="Street Address"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="cityFrom" type="text" className="form-control" placeholder="City"/>
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <Field name="stateFrom" type="text" className="form-control" placeholder="State"/>
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <Field name="zipFrom" type="text" className="form-control" placeholder="Zip"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="phoneFrom" type="text" className="form-control" placeholder="Phone"/>
                                                </div>

                                                {/* Bill to */}
                                                <div className="form-group col-md-12 pb-1 mt-4">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="nameTo" type="text" className="form-control" placeholder="Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="companyTo" type="text" className="form-control" placeholder="Company Name"/>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <Field name="streetAddressTo" type="text" className="form-control" placeholder="Street Address"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="cityTo" type="text" className="form-control" placeholder="City"/>
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <Field name="stateTo" type="text" className="form-control" placeholder="State"/>
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <Field name="zipTo" type="text" className="form-control" placeholder="Zip"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="phoneTo" type="text" className="form-control" placeholder="Phone"/>
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <Field name="emailTo" type="text" className="form-control" placeholder="Email"/>
                                                </div>

                                            </div>

                                            <div className = "col-md-6 col-sm-12">
                                                <div className="border border-2 rounded-2 mx-2">
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



                                            {/* Items */}
                                            <div className = "row mx-0 col-md-12">

                                                <div className="form-group col-12 pb-1 mt-4">
                                                    <div className="form-control col-md-12 border border-2 rounded-2 bg-light py-2 d-flex">
                                                        <strong className="col-5"> Description </strong>
                                                        <strong className="col-2"> Price </strong>
                                                        <strong className="col-2"> Quantity </strong>
                                                        <strong className="col-3"> Amount </strong>
                                                    </div>
                                                </div>

                                                {invoiceItems.map((item: InvoiceItem, index: number) =>

                                                <div key={index} className="col-12 d-flex">
                                                    <div className="input-group-sm col-5">
                                                        <Field name={"value-desc-"+index} type="text" className="form-control text-start"/>
                                                    </div>
                                                    <div className="input-group-sm col-2">
                                                        <Field name={"value-price-"+index} type="text" className="form-control text-start"/>
                                                    </div>
                                                    <div className="input-group-sm col-2">
                                                        <Field name={"value-qty"+index} type="text" className="form-control text-start"/>
                                                    </div>
                                                    <div className="input-group-sm col-3">
                                                        <Field name={"value-amt"+index} type="text" className="form-control text-start"/>
                                                    </div>

                                                    <button
                                                      type="button"
                                                      id="delete-item-btn"
                                                      className="btn p-0"
                                                      onClick={() => this.removeItem(index)}
                                                    >
                                                        <i className="bi bi-trash align-self-center fs-5"></i>
                                                    </button>

                                                </div>

                                                )}

                                            </div>

                                            <div className = "row mx-0 col-12 pt-2 px-4 d-flex">

                                                {/* add item button */}
                                                <div className = "row col-md-8 col-sm-6 flex-fill">

                                                    <button
                                                      type="button"
                                                      id="invoice-add-item-btn"
                                                      className="btn btn-sm btn-primary rounded-pill px-4 py-2 col-md-4 col-sm-8 my-auto"
                                                      onClick={() => this.addItem()}
                                                    >
                                                        <i className="bi bi-plus-circle align-self-center"></i>
                                                        <span className="mx-1"></span>
                                                        <span className="align-self-center">Add Item</span>
                                                    </button>

                                                </div>

                                                {/* invoice summaries */}
                                                <div className = "row col-md-4 col-sm-6">

                                                    <div className="row d-flex">
                                                        <div className="col-6 text-start">
                                                            <span className="text-uppercase"> subtotal </span>
                                                        </div>
                                                        <div className="col-6 text-end">
                                                            <span> {this.subtotal()} </span>
                                                        </div>
                                                    </div>

                                                    <div className="row d-flex">
                                                        <div className="col-6 text-start">
                                                            <span className="text-uppercase"> tax </span>
                                                        </div>
                                                        <div className="col-6 text-end">
                                                            <span> {tax} </span>
                                                        </div>
                                                    </div>


                                                    <div className="row d-flex">
                                                        <div className="col-6 text-start">
                                                            <span className="text-uppercase fw-bold"> total due </span>
                                                        </div>
                                                        <div className="col-6 text-end fw-bold">
                                                            <span> {totalDue} </span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* control buttons */}
                                            <div className = "row mx-0 col-12 pt-4 px-4 d-flex">

                                                <div className="row col-md-6 col-sm-12 flex-fill">
                                                    <button
                                                      type="button"
                                                      id="invoice-discard-btn"
                                                      className="btn btn-sm btn-light rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto me-auto"
                                                    >
                                                        <i className="bi bi-x-circle align-self-center"></i>
                                                        <span className="mx-1"></span>
                                                        <span className="align-self-center">Discard</span>
                                                    </button>
                                                </div>

                                                <div className="row col-md-6 col-sm-12">

                                                    <button
                                                      type="button"
                                                      id="invoice-draft-btn"
                                                      className="btn btn-sm btn-outline-secondary rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto mx-4 ms-auto"
                                                    >
                                                        <i className="bi bi-check align-self-center"></i>
                                                        <span className="mx-1"></span>
                                                        <span className="align-self-center">Draft</span>
                                                    </button>

                                                    <button
                                                      type="submit"
                                                      id="invoice-save-btn"
                                                      className="btn btn-sm btn-success rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto"
                                                    >
                                                        <i className="bi bi-check-circle align-self-center"></i>
                                                        <span className="mx-1"></span>
                                                        <span className="align-self-center">Save</span>
                                                    </button>

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

