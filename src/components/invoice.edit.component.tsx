import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade
import LoadingOverlay from 'react-loading-overlay-ts';
import ReactModal from 'react-modal';  // for modal

import AuthService from "../services/AuthService";
import InvoiceService from "../services/InvoiceService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { Role } from '../types/role.type'
import { IUser, StoredUser } from '../types/user.type'
import { InvoiceData, InvoiceItem, InvoiceItemUnique, IStatus } from '../types/invoice.type'


// types for the component props
interface Params {
    /** invoice id passed as a url param */
    invoiceID: string
};

type Props = WithRouterProps<Params>; // type for the higher order component used

interface InvProps extends Props {
    /** invoice id passed as a prop */
    invid: string;  // adding to HOC prop type
}

type State = {
    currentUser: StoredUser | null,

    /** User roles available for the app */
    appRoles: Role[] | null,

    loading: boolean,
    flash: boolean,
    flashMessage: string,
    flashType: Color,

    /** Whether modal should be displayed */
    modal: boolean,

    /** Message to be displayed by the modal */
    modalMessage: string,

    /** Indicates what function should be called on modal confirmation */
    modalAction: string,

    /** Object of type Role to be used for updating a user's roles */
    statusUpdate: IStatus | null

    /** Details for the invoice being viewed */
    invoice: InvoiceData | null,

    items: InvoiceItemUnique[],
    lastItemID: number,
    subtotal: string,
    tax: string,
    taxRate: string,
    totalDue: string,
    invoiceNum: string,
    invoiceDate: string
};


class EditInvoice extends React.Component<InvProps, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: InvProps) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            appRoles: null,
            loading: false,
            flash: false,
            flashMessage: "",
            flashType: "info",
            modal: false,
            modalMessage: "",
            modalAction: "",
            statusUpdate: null,
            invoice: null,
            items: [{
                id: 0,
                description: "",
                price: "0.00",
                quantity: "0",
                amount: "0.00"
            } as InvoiceItemUnique],
            lastItemID: 0,
            subtotal: "0.00",
            tax: "0.00",
            taxRate: "0.00",
            totalDue: "0.00",
            invoiceNum: "0000",
            invoiceDate: "00-00-0000"
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.getInvoiceDetails = this.getInvoiceDetails.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.newDesc = this.newDesc.bind(this);
        this.newPrice = this.newPrice.bind(this);
        this.newQty = this.newQty.bind(this);
        this.calculateSubtotal = this.calculateSubtotal.bind(this);
        this.handleItemChange = this.handleItemChange.bind(this);
        this.calculateAmountDue = this.calculateAmountDue.bind(this);
        this.changeInvoiceStatus = this.changeInvoiceStatus.bind(this);
        this.deleteInvoice = this.deleteInvoice.bind(this);
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { navigate } = this.props;  // params injected from HOC wrapper component

        this.getInvoiceDetails();

        // store details for the user accessing the page
        const currentUser = AuthService.getCurrentUser();
        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser });
        }

        // get the user roles available on the app
        AuthService.getRoles().then((response) => {
            this.setState({ appRoles: response.data.roles })
        });

        // get date and format it
        const today = new Date();
        const yyyy = String( today.getFullYear() );
        const mm = (today.getMonth() + 1) > 9 ? String( today.getMonth() + 1 ) : "0" + String( (today.getMonth() + 1 ) ); // Months start at 0!
        const dd = today.getDate() > 10 ? String( today.getDate() ) : "0" + String( today.getDate() );
        const formattedToday = dd + "/" + mm + "/" + yyyy;

        this.setState({ invoiceDate: formattedToday });

    }

    getInvoiceDetails() {
        // get invoice details from database

        const { invid, match } = this.props;  // params injected from HOC wrapper component

        let invoiceID;
        if (this.props.invid !== "#") { // id NOT provided in url
            invoiceID = parseInt(invid); // get id from props

        } else { // id provided in the url
            invoiceID = parseInt(match.params.invoiceID); // get id from url param
        }

        // get invoice data
        InvoiceService.getInvoice(invoiceID).then((response) => {
            this.setState({
                invoice: response.data.invoice,
                invoiceNum: response.data.invoice.id,
                items: response.data.invoice.items,
                subtotal: response.data.invoice.subtotal,
                tax: response.data.invoice.tax,
                taxRate: response.data.invoice.taxRate,
                totalDue: response.data.invoice.totalDue
            });
            //console.log(response.data.invoice)

        }).catch((error) => {
            const resMessage =
                (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();

            console.log(resMessage);
        });
    }

    validationSchema() {

        // create schema for validation
        return Yup.object().shape({
            companyFrom: Yup.string()
                .required("This field is required!"),
            streetFrom: Yup.string()
                .required("This field is required!"),
            cityFrom: Yup.string()
                 .required("This field is required!"),
            stateFrom: Yup.string()
                 .required("This field is required!"),
            zipFrom: Yup.string()
                 .required("This field is required!"),
            phoneFrom: Yup.string()
                 .required("This field is required!"),
            nameTo: Yup.string()
                 .required("This field is required!"),
            companyTo: Yup.string()
                 .required("This field is required!"),
            streetTo: Yup.string()
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
                 .email("This is not a valid email!")
                 .required("This field is required!"),
            comments: Yup.string().when("comments", (val, schema) => {
                //if comments exist then apply max, otherwise do not
                if(val?.length > 0) {
                    return Yup.string().max(200, "max 200 words").required("Required");
                }
                else {
                    return Yup.string().notRequired();
                }
            }),
            formitems: Yup.array()
                .of(
                    Yup.object().shape({
                        description: Yup.string()
                            .required("Description is required"),
                        price: Yup.string()
                            .required("Price is required")
                            .matches(/^\d*[.{1}\d*]\d*$/, "Must be only digits"),
                        quantity: Yup.string()
                            .required("Quantity is required")
                            .matches(/^0*[1-9]\d*$/, "Must be integer greater than 0"),
                        amount: Yup.string()
                            .required("Amount is required")
                            .matches(/^\d*[.{1}\d*]\d*$/, "Must be only digits"),
                    })
                )
                .required("Invalid invoice item(s)"),
        },  [
                ["comments", "comments"],
            ] //cyclic dependency
        );
    }

    handleSubmit(formValue: { companyFrom: string; streetFrom: string; cityFrom: string; stateFrom: string; zipFrom: string; phoneFrom: string;
                               nameTo: string; companyTo: string; streetTo: string; cityTo: string; stateTo: string;
                               zipTo: string; phoneTo: string; emailTo: string; comments: string }) {

        // handle data from form submission
        const { companyFrom, streetFrom, cityFrom, stateFrom, zipFrom, phoneFrom,
                nameTo, companyTo, streetTo, cityTo, stateTo, zipTo, phoneTo, emailTo,
                comments } = formValue; // get data from form

        const { currentUser, items, invoice,
               subtotal, tax, taxRate, totalDue } = this.state;

        this.setState({ loading: true });

        if (currentUser != null && invoice != null) {
            let createdBy = currentUser.id;

            InvoiceService.updateInvoice(invoice.id, {companyFrom, streetFrom, cityFrom, stateFrom, zipFrom, phoneFrom,
                                         nameTo, companyTo, streetTo, cityTo, stateTo, zipTo,
                                         phoneTo, emailTo, items, comments, createdBy,
                                         subtotal, taxRate, tax, totalDue})
            .then(
                response => { // update successful

                    this.setState({
                        flash: true,
                        flashMessage: "Invoice updated successfully!",
                        flashType: "success",
                        loading: false
                    }, () => { this.getInvoiceDetails(); });
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
                    console.log(resMessage);
                }
            );

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: ""});
            }, 5000);
        }
    }

    changeInvoiceStatus(){
        // change the invoice's status

        const { invoice, statusUpdate } = this.state;

        if (invoice != null && statusUpdate != null) {

            InvoiceService.updateInvoiceStatus(invoice.id, statusUpdate)
            .then(
                response => { // status update successful

                    this.setState({
                        flash: true,
                        flashMessage: "Invoice saved successfully as " + statusUpdate,
                        flashType: "success",
                        loading: false
                    }, () => { this.getInvoiceDetails(); });
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
                        flashMessage: "Error: failed to update status to " + statusUpdate,
                        flashType: "error",
                        loading: false
                    });

                    console.log("Failed");
                    console.log(resMessage);
                }
            );
        }
        this.setState({modal: false, modalMessage: "", modalAction: "", statusUpdate: null});
    }

    deleteInvoice() {
        // delete invoice from database

        const { navigate } = this.props;  // params injected from HOC wrapper component
        const { invoice } = this.state;

        if (invoice != null) {

            InvoiceService.deleteInvoice(invoice.id).then(

                (response) => { // success

                    this.setState({
                        invoice: null,
                    }, () => { navigate("/user"); });

                },
                error => { // failure

                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();

                    console.log(resMessage);
                }
            );
        }
    }

    addItem(): InvoiceItemUnique[] {
        // add a new item to the invoice and return the result

        const { items, lastItemID } = this.state;
        const newList = items.concat({
            id: lastItemID + 1,
            description: "",
            price: "0.00",
            quantity: "0",
            amount: "0.00"
        });

        this.setState({ items: newList, lastItemID: lastItemID + 1 });
        console.log("addItem()");
        console.log(newList);
        return newList
    }

    removeItem(index: number): InvoiceItemUnique[] {
        // remove an item from the invoice and return the result

        const { items } = this.state;

        if (items.length !== 1) {
            const newList = items.filter((item, j) => index !== j);
            console.log("removeItem()");
            console.log(newList);

            this.setState({ items: newList }, () => {
                //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
                //  use a callback when an action should be performed immediately after setting state.

                let subTotal = this.calculateSubtotal(newList);
                if (subTotal !== "CALC_FAILED") {
                    this.calculateAmountDue(subTotal); // recalculate amount due
                }

            });
            return newList

        } else {
            // flash message for failure
            this.setState({
                flash: true,
                flashMessage: "At least one invoice item is required",
                flashType: "warning"
            });

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);

            return []
        }
    }

    newDesc(desc: string, index: number) {
        // update the description value of invoice item at the given index
        const { items } = this.state;
        let temp = items;

        try {
            temp[index].description = desc;
            this.setState({items: temp}, () => {
                //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
                //  use a callback when an action should be performed immediately after setting state.
                this.handleItemChange(temp);
            });
        } catch { console.log("error"); }
    }

    newPrice(pr: string, index: number) {
        // update the price value of invoice item at the given index
        const { items } = this.state;
        let temp = items;

        try {
            temp[index].price = pr;
            this.setState({items: temp}, () => {
                //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
                //  use a callback when an action should be performed immediately after setting state.
                this.handleItemChange(temp);
            });
        } catch { console.log("error"); }
    }

    newQty(qty: string, index: number) {
        // update the quantity value of invoice item at the given index
        const { items } = this.state;
        let temp = items;

        try {
            temp[index].quantity = qty;
            this.setState({items: temp}, () => {
                //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
                //  use a callback when an action should be performed immediately after setting state.
                this.handleItemChange(temp);
            });
        } catch { console.log("error"); }
    }

    handleItemChange(newList: InvoiceItemUnique[]) {
        // update invoice items maintained in state - for calculation purposes

        for (let i in newList) {

            try {
                let price = parseFloat(newList[i].price);
                let quantity = parseInt(newList[i].quantity);

                if ( !isNaN(price) && !isNaN(quantity) ) {
                    newList[i].amount = String( ( price * quantity ).toFixed(2) );
                    console.log("price "+price+"* qty "+quantity+"= "+newList[i].amount);
                }
            } catch {
                console.log("error");
            }
        }

        let subTotal = this.calculateSubtotal(newList);

        if (subTotal !== "CALC_FAILED") {

            let amountDue = this.calculateAmountDue(subTotal); // recalculate amount due
            if (amountDue !== "CALC_FAILED") {
                this.setState({ items: newList });
            }
        }
    }

    calculateSubtotal(items: InvoiceItem[]): string {
        // sum the amounts of all invoice items

        let total = 0.00;

        items.forEach(element => {

            try {
                total += parseFloat(element.amount);
            } catch {
                total += 0.00;
            }
        });

        try {
            this.setState({subtotal: String( total.toFixed(2) )});
            return String( total.toFixed(2) );
        } catch {}

        return "CALC_FAILED"
    }

    calculateAmountDue(subtotal: string): string {
        // calculate total amount due by adding tax to the subtotal

        const { taxRate } = this.state;

        try {
            let subtotalFloat = parseFloat(subtotal);
            let taxRateFloat = parseFloat(taxRate);

            if ( !isNaN(subtotalFloat) && !isNaN(taxRateFloat) ) {
                let tax = subtotalFloat * taxRateFloat;
                let amountDue = subtotalFloat + tax;

                this.setState({totalDue: String( amountDue.toFixed(2) )});
                this.setState({tax: String( tax.toFixed(2) )});
                return String( amountDue.toFixed(2) )
            }
        } catch {}

        return "CALC_FAILED"

    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, appRoles, loading, flash, flashMessage, flashType,
                modal, modalMessage, modalAction, statusUpdate,
                invoice, items, lastItemID, subtotal, tax, totalDue, invoiceNum, invoiceDate } = this.state;

        const initialValues = {
            companyFrom: invoice === null ? "" : invoice.companyFrom,
            streetFrom: invoice === null ? "" : invoice.streetFrom,
            cityFrom: invoice === null ? "" : invoice.cityFrom,
            stateFrom: invoice === null ? "" : invoice.stateFrom,
            zipFrom: invoice === null ? "" : invoice.zipFrom,
            phoneFrom: invoice === null ? "" : invoice.phoneFrom,
            nameTo: invoice === null ? "" : invoice.nameTo,
            companyTo: invoice === null ? "" : invoice.companyTo,
            streetTo: invoice === null ? "" : invoice.streetTo,
            cityTo: invoice === null ? "" : invoice.cityTo,
            stateTo: invoice === null ? "" : invoice.stateTo,
            zipTo: invoice === null ? "" : invoice.zipTo,
            phoneTo: invoice === null ? "" : invoice.phoneTo,
            emailTo: invoice === null ? "" : invoice.emailTo,
            formitems: items,
            comments: invoice === null ? "" : invoice.comments
        };


        return (
            <div className="container mb-4">

                <LoadingOverlay
                    active={loading}
                    spinner
                    text='Loading...'
                >

                    {/* flash message */}
                     <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                         <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                     </Fade>


                    {/* Modal */}
                    <ReactModal
                       isOpen={modal}
                       onRequestClose={() => this.setState({modal: false, modalMessage: "", modalAction: "", statusUpdate: null})}
                       ariaHideApp={false}
                       style={{content: {width: '400px', height: '200px', inset: '35%'},
                               overlay: {backgroundColor: 'rgba(44, 44, 45, 0.35)'}
                             }}
                    >
                        <div className="my-4"> {modalMessage} </div>

                        {/* status selection */}
                        {(modalAction === "changeStatus" && currentUser !== null && appRoles !== null) ?
                        <Formik
                              initialValues={{ status : null }}
                              onSubmit={() => {} }
                        >
                        {({ values, errors, touched, setFieldValue }) => (
                            <div className="pb-2">
                                <hr className="w-50"></hr>
                                <div className="form-check">
                                    <input
                                      checked={values.status === "DRAFT"}
                                      onChange={() => setFieldValue("status", "DRAFT")}
                                      className="form-check-input" type="radio" name="radioStatus" id="radioStatus1">
                                    </input>
                                    <label className="form-check-label" htmlFor="radioStatus1"> DRAFT </label>
                                </div>
                                <div className="form-check">
                                    <input
                                      checked={values.status === "PENDING"}
                                      onChange={() => setFieldValue("status", "PENDING")}
                                      className="form-check-input" type="radio" name="radioStatus" id="radioStatus2"></input>
                                    <label className="form-check-label" htmlFor="radioStatus2"> PENDING </label>
                                </div>
                                <div className="form-check">
                                    <input
                                      checked={values.status === "APPROVED"}
                                      disabled={ !currentUser.roles.includes(appRoles[1].name) }
                                      onChange={() => setFieldValue("status", "APPROVED")}
                                      className="form-check-input" type="radio" name="radioStatus" id="radioStatus3"></input>
                                    <label className="form-check-label" htmlFor="radioStatus3"> APPROVED </label>
                                </div>
                                <div className="form-check">
                                    <input
                                      checked={values.status === "PAID"}
                                      disabled={ !currentUser.roles.includes(appRoles[1].name) }
                                      onChange={() => setFieldValue("status", "PAID")}
                                      className="form-check-input" type="radio" name="radioStatus" id="radioStatus4"></input>
                                    <label className="form-check-label" htmlFor="radioStatus4"> PAID </label>
                                </div>
                                <button
                                  className="btn btn-sm btn-dark mt-3"
                                  onClick={() => {this.setState({ statusUpdate: values.status })} }
                                >
                                    Confirm selection
                                </button>
                                <hr className="w-50"></hr>
                            </div>
                        )}
                        </Formik>
                        : null}

                        <button
                          type="button"
                          className="btn btn-sm btn-danger custom-mr-10"
                          disabled={statusUpdate === null}
                          onClick={() => modalAction === "changeStatus" ?  this.changeInvoiceStatus() : ( modalAction === "deleteInvoice" ? this.deleteInvoice() : "") }>
                            <span> { modalAction === "changeStatus" ?  "Update Status" : ( modalAction === "deleteInvoice" ? "Delete" : "unknown") } </span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger custom-mr-10"
                          onClick={() => this.setState({modal: false, modalMessage: "", modalAction: "", statusUpdate: null})}>
                            <span>Cancel</span>
                        </button>
                    </ReactModal>


                    {/* invoice details and edit */}
                    {(invoice != null && currentUser != null) ?
                    <div>

                        {/* invoice top bar */}
                        <div className="card">

                            <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex justify-content-between">

                                {/* status timeline */}
                                <div className = "d-inline-flex row d-flex align-items-center col-md-6 col-sm-12 mt-2">
                                    <div className="position-relative m-4">
                                        <div className="progress h-1">
                                            <div
                                                className={`progress-bar bg-success
                                                    ${invoice.status === "DRAFT" ? "progress-0" :
                                                    ( invoice.status === "PENDING" ? "progress-30" :
                                                    ( invoice.status === "APPROVED" ? "progress-60" :
                                                    ( invoice.status === "PAID" ? "progress-100" : "" ) ) )}
                                                `}
                                                role="progressbar" aria-valuenow={30} aria-valuemin={0} aria-valuemax={100}>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={`d-flex justify-content-center position-absolute top-0 l-0 translate-middle btn btn-sm rounded-pill time-point
                                                ${invoice.status === "DRAFT" || invoice.status === "PENDING" || invoice.status === "APPROVED" || invoice.status === "PAID" ? "btn-success p-3" : "btn-light"}
                                                ${invoice.status === "DRAFT" ? "p-4" : ""}
                                            `}
                                        >
                                            <i className="event-date bi bi-circle align-self-center"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className={`d-flex justify-content-center position-absolute top-0 l-30 translate-middle btn btn-sm rounded-pill time-point
                                                ${invoice.status === "PENDING" || invoice.status === "APPROVED" || invoice.status === "PAID" ? "btn-success" : "btn-light"}
                                                ${invoice.status === "PENDING" ? "p-4" : ""}
                                            `}
                                        >
                                            <i className="event-date bi bi-record-circle align-self-center"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className={`d-flex justify-content-center position-absolute top-0 l-60 translate-middle btn btn-sm rounded-pill time-point
                                                ${invoice.status === "APPROVED" || invoice.status === "PAID" ? "btn-success" : "btn-light"}
                                                ${invoice.status === "APPROVED" ? "p-4" : ""}
                                            `}
                                        >
                                            <i className="event-date bi bi-check-circle align-self-center"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className={`d-flex justify-content-center position-absolute top-0 l-100 translate-middle btn btn-sm rounded-pill time-point
                                            ${invoice.status === "PAID" ? "btn-success p-4" : "btn-light"}
                                            `}
                                        >
                                            <i className="event-date bi bi-check-circle-fill align-self-center"></i>
                                        </button>

                                        <div className="d-flex mt-4 pt-2">
                                            <span className="position-absolute l-0 translate-middle text-mini">DRAFT</span>
                                            <span className="position-absolute l-30 translate-middle text-mini">PENDING</span>
                                            <span className="position-absolute l-60 translate-middle text-mini">APPROVED</span>
                                            <span className="position-absolute l-100 translate-middle text-mini">PAID</span>
                                        </div>
                                    </div>

                                </div>

                                {/* buttons */}
                                <div className = "d-inline-flex row d-flex justify-content-end align-items-center col-md-5 col-sm-12 mt-2">

                                    {/* edit invoice status button */}
                                    <button
                                      type="button"
                                      id="invoice-delete-btn"
                                      className="btn btn-sm btn-outline-dark rounded-pill px-2 py-2 col-6 my-auto custom-mr-10"
                                      onClick={() => this.setState({modal: true, modalMessage: "Select a status", modalAction: "changeStatus"}) }
                                    >
                                        <i className="bi bi-exclamation-circle align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Change Status</span>
                                    </button>

                                    {/* delete invoice button */}
                                    <button
                                      type="button"
                                      id="invoice-delete-btn"
                                      className="btn btn-sm btn-outline-danger rounded-pill px-2 py-2 col-4 my-auto custom-mr-10"
                                      onClick={() => this.setState({modal: true, modalMessage: "Are you sure you want to delete this invoice?", modalAction: "deleteInvoice"}) }
                                    >
                                        <i className="bi bi-x-circle-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Delete</span>
                                    </button>

                                </div>
                            </div>
                        </div>

                        {/* edit invoice details */}
                        <div className="card">
                            <header className="jumbotron d-flex row mx-0 gx-1 px-2 align-items-center">

                                <div className="col-md-6 col-sm-12 px-0 border border-2 rounded-2">
                                    <table className="table table-bordered-dark mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th> INVOICE # </th>
                                                <th> DATE </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td> {invoiceNum} </td>
                                                <td> {invoiceDate} </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="col-md-6 col-sm-12">
                                    <span className="fs-5 badge bg-secondary"> {invoice.status} </span>
                                </div>

                            </header>

                            <hr className="mb-4 mx-4"/>

                            <div className="">
                                <Formik
                                  initialValues={initialValues}
                                  validationSchema={this.validationSchema}
                                  onSubmit={this.handleSubmit}  // onSubmit function executes if there are no errors
                                >
                                    {({ values, errors, touched, resetForm, isValid, dirty, handleChange, handleBlur, setFieldValue }) => (
                                        <Form>

                                            <div className="row m-0">
                                                <div className="row m-0 col-12">

                                                    {/* Bill to */}
                                                    <div className="row mx-0 gx-1 col-md-6 col-sm-12">

                                                        <div className="form-group col-md-12 pb-1">
                                                            <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                                <strong className=""> Bill to </strong>
                                                            </div>
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-sm">
                                                            <Field
                                                              name="nameTo"
                                                              type="text"
                                                              className={errors.nameTo && touched.nameTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Name"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.nameTo && touched.nameTo ? errors.nameTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-sm">
                                                            <Field
                                                              name="companyTo"
                                                              type="text"
                                                              className={errors.companyTo && touched.companyTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Company Name"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.companyTo && touched.companyTo ? errors.companyTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-sm">
                                                            <Field
                                                              name="streetTo"
                                                              type="text"
                                                              className={errors.streetTo && touched.streetTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Street Address"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.streetTo && touched.streetTo ? errors.streetTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-6 pb-1 input-group-sm">
                                                            <Field
                                                              name="cityTo"
                                                              type="text"
                                                              className={errors.cityTo && touched.cityTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="City"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.cityTo && touched.cityTo ? errors.cityTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-4 pb-1 input-group-sm">
                                                            <Field
                                                              name="stateTo"
                                                              type="text"
                                                              className={errors.stateTo && touched.stateTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="State"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.stateTo && touched.stateTo ? errors.stateTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-2 pb-1 input-group-sm">
                                                            <Field
                                                              name="zipTo"
                                                              type="text"
                                                              className={errors.zipTo && touched.zipTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Zip"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.zipTo && touched.zipTo ? errors.zipTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-6 pb-1 input-group-sm">
                                                            <Field
                                                              name="phoneTo"
                                                              type="text"
                                                              className={errors.phoneTo && touched.phoneTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Phone"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.phoneTo && touched.phoneTo ? errors.phoneTo : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-6 pb-1 input-group-sm">
                                                            <Field
                                                              name="emailTo"
                                                              type="text"
                                                              className={errors.emailTo && touched.emailTo ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Email"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.emailTo && touched.emailTo ? errors.emailTo : ''}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Bill from */}
                                                    <div className="row mx-0 gx-1 col-md-6 col-sm-12">

                                                        <div className="form-group col-md-12 pb-1">
                                                            <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                                <strong className=""> Bill from </strong>
                                                            </div>
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-lg">
                                                            <Field
                                                              name="companyFrom"
                                                              type="text"
                                                              className={errors.companyFrom && touched.companyFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Company Name"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.companyFrom && touched.companyFrom ? errors.companyFrom : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-sm">
                                                            <Field
                                                              name="streetFrom"
                                                              type="text"
                                                              className={errors.streetFrom && touched.streetFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Street Address"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.streetFrom && touched.streetFrom ? errors.streetFrom : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-6 pb-1 input-group-sm">
                                                            <Field
                                                              name="cityFrom"
                                                              type="text"
                                                              className={errors.cityFrom && touched.cityFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="City"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.cityFrom && touched.cityFrom ? errors.cityFrom : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-4 pb-1 input-group-sm">
                                                            <Field
                                                              name="stateFrom"
                                                              type="text"
                                                              className={errors.stateFrom && touched.stateFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="State"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.stateFrom && touched.stateFrom ? errors.stateFrom : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-2 pb-1 input-group-sm">
                                                            <Field
                                                              name="zipFrom"
                                                              type="text"
                                                              className={errors.zipFrom && touched.zipFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Zip"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.zipFrom && touched.zipFrom ? errors.zipFrom : ''}
                                                            />
                                                        </div>

                                                        <div className="form-group col-md-12 pb-1 input-group-sm">
                                                            <Field
                                                              name="phoneFrom"
                                                              type="text"
                                                              className={errors.phoneFrom && touched.phoneFrom ? 'form-control is-invalid' : 'form-control'}
                                                              placeholder="Phone"
                                                              data-bs-toggle="tooltip"
                                                              data-bs-placement="top"
                                                              title={errors.phoneFrom && touched.phoneFrom ? errors.phoneFrom : ''}
                                                            />
                                                        </div>

                                                    </div>

                                                    <FieldArray
                                                        name="formitems"
                                                        render={ ({ remove, push }) => (

                                                        <div className="px-0">

                                                            {/* Items */}
                                                            <div className = "row mx-0 px-0 gx-1 col-md-12">

                                                                <div className="form-group col-12 pb-1 mt-4">
                                                                    <div className="form-control col-md-12 border border-2 rounded-2 bg-light py-2 d-flex">
                                                                        <strong className="col-5"> Description </strong>
                                                                        <strong className="col-2"> Price </strong>
                                                                        <strong className="col-2"> Quantity </strong>
                                                                        <strong className="col-3"> Amount </strong>
                                                                    </div>
                                                                </div>

                                                                {/* {values.formitems && values.formitems.map( (item: InvoiceItem, index: number) => */}
                                                                {values.formitems && items && items.map( (item: InvoiceItemUnique, index: number) =>

                                                                    <div key={item.id} className="col-12 d-flex hover-shadow mb-1">
                                                                        <div className="input-group-sm col-5">
                                                                            <Field
                                                                              name={`formitems.${item.id}.description`}
                                                                              value={items[index].description}
                                                                              //value={items[ items.findIndex(x => x.id === item.id) ].description}
                                                                              type="text"
                                                                              className={errors.formitems && (errors.formitems[index] as InvoiceItem).description && touched.formitems && touched.formitems[index].description ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                              data-bs-toggle="tooltip"
                                                                              data-bs-placement="top"
                                                                              title={errors.formitems && (errors.formitems[index] as InvoiceItem).description && touched.formitems && touched.formitems[index].description ? (errors.formitems[index] as InvoiceItem).description : ''}
                                                                              onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                                handleChange(e);
                                                                                this.newDesc(e.currentTarget.value, items.findIndex(x => x.id === item.id));
                                                                                //setFieldValue(`formitems.${index}.description`, e.currentTarget.value);
                                                                                //console.log(values.formitems[index].description);
                                                                              }}
                                                                              //onBlur={handleBlur}
                                                                            />
                                                                        </div>
                                                                        <div className="input-group-sm col-2">
                                                                            <Field
                                                                              name={`formitems.${index}.price`}
                                                                              value={items[index].price}
                                                                              //value={items[ items.findIndex(x => x.id === item.id) ].price}
                                                                              type="text"
                                                                              className={errors.formitems && (errors.formitems[index] as InvoiceItem).price && touched.formitems && touched.formitems[index].price ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                              data-bs-toggle="tooltip"
                                                                              data-bs-placement="top"
                                                                              title={errors.formitems && (errors.formitems[index] as InvoiceItem).price && touched.formitems && touched.formitems[index].price ? (errors.formitems[index] as InvoiceItem).price : ''}
                                                                              onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                                handleChange(e);
                                                                                this.newPrice(e.currentTarget.value, items.findIndex(x => x.id === item.id));
                                                                              }}
                                                                            />
                                                                        </div>
                                                                        <div className="input-group-sm col-2">
                                                                            <Field
                                                                              name={`formitems.${index}.quantity`}
                                                                              value={items[index].quantity}
                                                                              //value={items[ items.findIndex(x => x.id === item.id) ].quantity}
                                                                              type="text"
                                                                              className={errors.formitems && (errors.formitems[index] as InvoiceItem).quantity && touched.formitems && touched.formitems[index].quantity ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                              data-bs-toggle="tooltip"
                                                                              data-bs-placement="top"
                                                                              title={errors.formitems && (errors.formitems[index] as InvoiceItem).quantity && touched.formitems && touched.formitems[index].quantity ? (errors.formitems[index] as InvoiceItem).quantity : ''}
                                                                              onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                                handleChange(e);
                                                                                this.newQty(e.currentTarget.value, items.findIndex(x => x.id === item.id));
                                                                              }}
                                                                            />
                                                                        </div>
                                                                        <div className="input-group-sm col-3">
                                                                            <Field
                                                                              name={`formitems.${index}.amount`}
                                                                              value={items[index].amount}
                                                                              //value={items[ items.findIndex(x => x.id === item.id) ].amount}
                                                                              type="text"
                                                                              className={errors.formitems && (errors.formitems[index] as InvoiceItem).amount && touched.formitems && touched.formitems[index].amount ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                              data-bs-toggle="tooltip"
                                                                              data-bs-placement="top"
                                                                              title={errors.formitems && (errors.formitems[index] as InvoiceItem).amount && touched.formitems && touched.formitems[index].amount ? (errors.formitems[index] as InvoiceItem).amount : ''}
                                                                            />
                                                                        </div>

                                                                        <button
                                                                          type="button"
                                                                          id="delete-item-btn"
                                                                          className="btn p-0"
                                                                          onClick={() => {
                                                                            values.formitems.length <= 1 ? console.log("") :  /*remove( index );*/ values.formitems = this.removeItem( items.findIndex(x => x.id === item.id) ); console.log(values.formitems);
                                                                          }}
                                                                        >
                                                                            <i className="bi bi-trash align-self-center fs-5"></i>
                                                                        </button>
                                                                    </div>
                                                                )}

                                                            </div>

                                                            <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex justify-content-between">

                                                                {/* comments */}
                                                                <div className = "row col-md-7 col-sm-12">
                                                                    <div className="form-control border border-2 rounded-2 bg-light">
                                                                        <span className=""> Comments </span>
                                                                    </div>
                                                                    <Field
                                                                        as="textarea"
                                                                        name="comments"
                                                                        className="form-control input-group-sm"
                                                                    />

                                                                </div>

                                                                {/* invoice summaries */}
                                                                <div className = "d-flex flex-column col-md-5 col-sm-12">

                                                                    <div className="row d-flex">
                                                                        <div className="col-6 text-start">
                                                                            <span className="text-uppercase"> subtotal </span>
                                                                        </div>
                                                                        <div className="col-6 text-end">
                                                                            <span> {subtotal} </span>
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

                                                            {/* add item button */}
                                                            <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex">

                                                                <div className = "row col-md-8 col-sm-6 flex-fill mt-2">
                                                                    <button
                                                                      type="button"
                                                                      id="invoice-add-item-btn"
                                                                      className="btn btn-sm btn-primary rounded-pill px-4 py-2 col-md-4 col-sm-8 my-auto"
                                                                      onClick={ () => {
                                                                        values.formitems = this.addItem();
                                                                        //push( newItem );
                                                                        console.log(values.formitems);
                                                                      }}
                                                                    >
                                                                        <i className="bi bi-plus-circle align-self-center"></i>
                                                                        <span className="mx-1"></span>
                                                                        <span className="align-self-center">Add Item</span>
                                                                    </button>
                                                                </div>

                                                            </div>

                                                        </div>
                                                      )}
                                                    />

                                                    {/* control buttons */}
                                                    <div className = "row mx-0 px-0 gx-1 col-12 pt-4 d-flex">

                                                        <div className="row col-md-6 col-sm-12 flex-fill">
                                                            <button
                                                              type="reset"
                                                              id="invoice-discard-btn"
                                                              className="btn btn-sm btn-outline-danger rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto me-auto"
                                                            >
                                                                <i className="bi bi-x-circle align-self-center"></i>
                                                                <span className="mx-1"></span>
                                                                <span className="align-self-center">Discard Changes</span>
                                                            </button>
                                                        </div>

                                                        <div className="row col-md-6 col-sm-12">

                                                            <button
                                                              type="submit"
                                                              id="invoice-save-btn"
                                                              className="btn btn-sm btn-success rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto mx-4 ms-auto"
                                                              disabled={!(isValid && dirty)}
                                                            >
                                                                <i className="bi bi-check-circle align-self-center"></i>
                                                                <span className="mx-1"></span>
                                                                <span className="align-self-center">Save Changes</span>
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>

                            </div>
                        </div>
                    </div>
                    : null}

                </LoadingOverlay>
            </div>
        );
    }
}

export default withRouter(EditInvoice)