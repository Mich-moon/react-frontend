import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import ReactToPrint from "react-to-print";

import ReactModal from 'react-modal';  // for modal

import AuthService from "../services/AuthService";
import InvoiceService from "../services/InvoiceService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { Role } from '../types/role.type'
import { StoredUser } from '../types/user.type'
import { InvoiceData, InvoiceItemUnique } from '../types/invoice.type'


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
    /** Details of user currently logged into the app */
    currentUser: StoredUser | null,

    /** User roles available for the app */
    appRoles: Role[] | null,

    /** Details for the invoice being viewed */
    invoice: InvoiceData | null,

    /** Whether modal should be displayed */
    modal: boolean
};


class ViewInvoice extends React.Component<InvProps, State> {

    /** to store this component's ref to provide access to its DOM */
    private invref: React.RefObject<HTMLDivElement>;

    // constructor() - is invoked before the component is mounted.
    constructor(props: InvProps) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            appRoles: null,
            invoice: null,
            modal: false
        };

        this.invref= React.createRef(); // create the reference

        // bind methods so that they are accessible from the state inside of the render() method.
        this.deleteInvoice = this.deleteInvoice.bind(this);
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { match, navigate, invid, ...rest } = this.props;  // props injected from HOC wrapper component
        //console.log(this.props);

        let invoiceID;
        if (this.props.invid !== "#") { // id NOT provided in url
            invoiceID = parseInt(invid); // get id from props

        } else { // id provided in the url
            invoiceID = parseInt(match.params.invoiceID); // get id from url param
        }

        const currentUser = AuthService.getCurrentUser();

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser });
        }

        // get the user roles available on the app
        AuthService.getRoles().then((response) => {
            this.setState({ appRoles: response.data.roles })
            //console.log(response.data.roles);
        });

        // get invoice data
        InvoiceService.getInvoice(invoiceID).then((response) => {
            this.setState({ invoice: response.data.invoice });
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

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, invoice, modal, appRoles } = this.state;

        const { navigate } = this.props;

        return (
            <div {...this.props} className="container mb-4">

                {/* back button */}
                <button
                    type="button"
                    className="btn btn-lg rounded-circle"
                    onClick={() => navigate(-1)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Go back"
                >
                    <i className="bi bi-arrow-left-circle-fill align-self-center fs-3"></i>
                </button>

                {(currentUser != null && invoice && invoice != null) ?
                    <div className="mt-4">

                        {/* Modal */}
                        <ReactModal
                            isOpen={modal}
                            onRequestClose={() => this.setState({modal: false})}
                            ariaHideApp={false}
                            style={{content: {width: '400px', height: '150px', inset: '35%'},
                                    overlay: {backgroundColor: 'rgba(44, 44, 45, 0.35)'}
                                  }}
                        >
                            <div className="my-4"> Are you sure you want to delete this invoice?</div>

                            <button
                                type="button"
                                className="btn btn-sm btn-danger custom-mr-10"
                                onClick={() => { this.setState({modal: false}, () => { this.deleteInvoice() } ); } }
                            >
                                <span>Delete</span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-danger custom-mr-10"
                                onClick={() => this.setState({modal: false})}
                            >
                                <span>Cancel</span>
                            </button>
                        </ReactModal>


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

                                    {/* edit invoice button */}
                                    <Link
                                        to={`/invoiceedit/${invoice.id}`}
                                        className={`btn btn-sm btn-outline-dark rounded-pill px-2 py-2 col-4 my-auto custom-mr-10
                                            ${appRoles != null && !currentUser.roles.includes(appRoles[1].name) && (invoice.status == "APPROVED" || invoice.status == "PAID") ? "disabled" : ""}
                                        `}
                                    >
                                        <i className="bi bi-pencil-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Edit</span>
                                    </Link>

                                    {/* delete invoice button */}
                                    <button
                                        type="button"
                                        id="invoice-delete-btn"
                                        className="btn btn-sm btn-outline-danger rounded-pill px-2 py-2 col-4 my-auto custom-mr-10"
                                        onClick={() => this.setState({modal: true}) }
                                    >
                                        <i className="bi bi-x-circle-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Delete</span>
                                    </button>

                                    {/* PDF button */}
                                    <ReactToPrint
                                        content={() => this.invref.current}
                                        trigger={() =>

                                            <button
                                                type="button"
                                                id="invoice-pdf-btn"
                                                className="btn btn-sm btn-secondary-outline px-2 py-0 col-2 my-auto"
                                                >
                                                    <i className="bi bi-filetype-pdf align-self-center fs-2"></i>
                                            </button>

                                        }
                                    />

                                </div>
                            </div>
                        </div>


                        {/* invoice details */}
                        <div ref={this.invref} className="card p-0">

                            <header className="d-flex d-print-flex align-items-center my-5">
                                <div className="bg-dark text-light col-md-6 col-sm-12 px-0 py-4 me-auto">
                                    <h3 className="fs-1 mx-4"> INVOICE </h3>
                                </div>

                                <div className="d-flex d-print-flex justify-content-end col-md-6 col-sm-12">

                                    <div className="fw-bold d-inline d-print-inline col-sm-6 d-flex d-print-flex flex-column px-3">
                                        <div className="d-flex d-print-flex col-12 ms-auto">
                                            <span className="col-6 text-start"> INVOICE #: </span>
                                            <span className="col-6 text-end"> {invoice.id} </span>
                                        </div>
                                        <div className="d-flex d-print-flex col-12 ms-auto">
                                            <span className="col-6 text-start"> DATE: </span>
                                            <span className="col-6 text-end"> {invoice.date} </span>
                                        </div>
                                    </div>

                                    <div className="bg-dark d-inline d-print-inline col-sm-3">
                                        <div className="px-4"></div><div className="px-4"></div>
                                    </div>

                                </div>
                            </header>

                            <div className="px-4 mb-2">

                                <form>
                                    <div className="row m-0">
                                        <div className="row m-0 col-12 d-flex d-print-flex justify-content-between">

                                            {/* Bill to */}
                                            <div className="text-start d-flex d-print-flex flex-column mx-0 gx-1 col-md-6 col-sm-12">

                                                <div className="col-md-12 pb-1">
                                                    <div className="col-md-12 border border-2 bg-light p-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.nameTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.companyTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.streetTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.cityTo}, {invoice.stateTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.zipTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.phoneTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.emailTo}
                                                    </span>
                                                </div>

                                            </div>

                                            {/* Bill from */}
                                            <div className="text-start d-flex d-print-flex flex-column mx-0 gx-1 col-md-5 col-sm-8">

                                                <div className="col-md-12 pb-1 px-4 border-start border-2 fs-5">
                                                    <span className="fw-bold">
                                                        {invoice.companyFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.streetFrom}, {invoice.cityFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.stateFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.zipFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.phoneFrom}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="px-0">

                                                {/* Items */}
                                                <div className="row mx-0 px-0 gx-1 col-md-12">

                                                    <div className="bg-dark text-light col-md-12 pb-1 mt-4 py-2 d-flex d-print-flex">
                                                        <strong className="col-5"> Description </strong>
                                                        <strong className="col-2"> Price </strong>
                                                        <strong className="col-2"> Quantity </strong>
                                                        <strong className="col-3"> Amount </strong>
                                                    </div>

                                                    {invoice && invoice.items != null && invoice.items.map( (item: InvoiceItemUnique) =>

                                                        <div key={item.id} className="col-12 d-flex d-print-flex py-2 border-bottom border-2">
                                                            <div className="col-5">
                                                                <span className="text-start">
                                                                    {item.description}
                                                                </span>
                                                            </div>
                                                            <div className="col-2">
                                                                <span className="text-start">
                                                                    $ {item.price}
                                                                </span>
                                                            </div>
                                                            <div className="col-2">
                                                                <span className="text-start">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="col-3">
                                                                <span className="text-start">
                                                                    $ {item.amount}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>

                                                <div className="row mx-0 px-0 gx-1 col-12 pt-2 mt-4 d-flex d-print-flex justify-content-between">

                                                    {/* comments */}
                                                    <div className="row col-md-7 col-sm-12">
                                                        <div className="border border-2 bg-light">
                                                            <span className="fw-bold"> Comments </span>
                                                        </div>
                                                        <span className="text-start text-wrap">
                                                            {invoice.comments}
                                                        </span>
                                                    </div>

                                                    {/* invoice summaries */}
                                                    <div className = "d-flex d-print-flex flex-column col-md-5 col-sm-12">

                                                        <div className="row d-flex d-print-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> subtotal </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> $ {invoice.subtotal} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> tax </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> $ {invoice.tax} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex d-print-flex fs-5">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase fw-bold"> total due </span>
                                                            </div>
                                                            <div className="col-6 text-end fw-bold">
                                                                <span> $ {invoice.totalDue} </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-dark py-4 mt-4 w-100">
                                <div className="my-3"></div>
                                <span className="text-muted fst-italic">Thank You for your business</span>
                                <div className="my-3"></div>
                            </div>

                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(ViewInvoice)
