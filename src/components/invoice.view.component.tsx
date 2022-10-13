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
import { IUser } from '../types/user.type'
import { InvoiceData, InvoiceItem } from '../types/invoice.type'


// types for the component props
interface Params {
    /* invoice id passed as a url param */
    invoiceID: string
};

type Props = WithRouterProps<Params>; // type for the higher order component used

interface InvProps extends Props {
    invid: string;  // adding to HOC prop type
}

type State = {
    /* Details of user currently logged into the app */
    currentUser: IUser | null,

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
            invoice: null,
            modal: false
        };

        this.invref= React.createRef(); // create the reference

        // bind methods so that they are accessible from the state inside of the render() method.
        this.deleteInvoice = this.deleteInvoice.bind(this);
        this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { match, navigate, invid, ...rest } = this.props;  // props injected from HOC wrapper component
        //console.log(this.props);

        let invoiceID;
        if (this.props.invid != "#") { // id NOT provided in url
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

        const { navigate } = this.props;  // params injected from HOC wrapper component
        const { invoice } = this.state;

        if (invoice != null) {

            //console.log("delete"+this.state.invoice.id);

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

    handleOpenDeleteModal(id: number) {
        // open modal
        this.setState({modal: true});
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, invoice, modal } = this.state;

        return (
            <div {...this.props} className="container mb-4">

                {(currentUser != null && invoice && invoice != null) ?
                    <div>

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

                                <div className = "d-inline-flex row d-flex align-items-center col-6 mt-2">
                                    <span className="col-2 text-start"> Status: </span>
                                    <span className={`col-3 rounded-pill p-0
                                        ${invoice.status === "draft" ? "" : "bg-draft-outline"}
                                        ${invoice.status === "pending" ? "" : "bg-pending-outline"}
                                        ${invoice.status === "approved" ? "" : "bg-approved-outline"}
                                        ${invoice.status === "paid" ? "" : "bg-paid-outline"}`
                                    }>
                                        {invoice.status}
                                    </span>
                                </div>

                                <div className = "d-inline-flex row d-flex justify-content-end align-items-center col-6 mt-2">

                                    {/* edit invoice button */}
                                    <button
                                      type="button"
                                      id="invoice-edit-btn"
                                      className="btn btn-sm btn-secondary rounded-pill px-2 py-2 col-4 my-auto custom-mr-10"
                                    >
                                        <i className="bi bi-pencil-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Edit</span>
                                    </button>

                                    {/* delete invoice button */}
                                    <button
                                      type="button"
                                      id="invoice-delete-btn"
                                      className="btn btn-sm btn-danger rounded-pill px-2 py-2 col-4 my-auto custom-mr-10"
                                      onClick={() => this.handleOpenDeleteModal(invoice.id)}
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
                        <div ref={this.invref} className="card">
                            <header className="jumbotron d-flex justify-content-between align-items-center mx-4">
                                <img
                                  src="https://4m4you.com/wp-content/uploads/2020/06/logo-placeholder-300x120.png"
                                  alt="invoice-logo"
                                  className="invoice-logo mx-4"
                                />
                                <h3 className="mx-4"> Invoice </h3>
                            </header>
                            <hr className="mb-4 mx-4"/>
                            <div className="">


                                <form>
                                    <div className="row m-0">
                                        <div className="row m-0 col-12">
                                            <div className = "row mx-0 gx-1 col-md-6 col-sm-12">

                                                {/* Bill from */}
                                                <div className="form-group col-md-12 pb-1">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill from </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-lg">
                                                    <input
                                                      name="companyFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.companyFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                {/* Bill to */}
                                                <div className="form-group col-md-12 pb-1 mt-4">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="nameTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.nameTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="companyTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.companyTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="emailTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.emailTo}
                                                      readOnly
                                                    />
                                                </div>

                                            </div>

                                            <div className = "col-md-6 col-sm-12 px-0 ">
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
                                                                <td> {invoice.id} </td>
                                                                <td> {invoice.date}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>


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

                                                    {invoice && invoice.items != null && invoice.items.map( (item: InvoiceItem, index: number) =>

                                                        <div key={index} className="col-12 d-flex mb-1">
                                                            <div className="input-group-sm col-5">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-star"
                                                                  value={item.description}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.price}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.quantity}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-3">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.amount}
                                                                  readOnly
                                                                />
                                                            </div>

                                                        </div>
                                                    )}

                                                </div>

                                                <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex justify-content-between">

                                                    {/* comments */}
                                                    <div className = "row col-md-7 col-sm-12">
                                                        <div className="form-control border border-2 rounded-2 bg-light">
                                                            <span className=""> Comments </span>
                                                        </div>
                                                        <textarea
                                                            name="comments"
                                                            className="form-control input-group-sm"
                                                            value={invoice.comments}
                                                            readOnly
                                                        />
                                                    </div>

                                                    {/* invoice summaries */}
                                                    <div className = "d-flex flex-column col-md-5 col-sm-12">

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> subtotal </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> {invoice.subtotal} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> tax </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> {invoice.tax} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase fw-bold"> total due </span>
                                                            </div>
                                                            <div className="col-6 text-end fw-bold">
                                                                <span> {invoice.totalDue} </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(ViewInvoice)
