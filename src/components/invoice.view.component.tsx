import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
//import { Formik, Field, Form } from "formik";

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
    invoiceID: string
};

type Props = WithRouterProps<Params>;

type State = {
    currentUser: IUser | null,
    invoice: InvoiceData | null
};

class ViewInvoice extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            invoice: null
        };

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const { match, navigate } = this.props;  // params injected from HOC wrapper component
        const invoiceID = parseInt(match.params.invoiceID);

        const currentUser = AuthService.getCurrentUser();

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser });
        }

        // get invoice data
        InvoiceService.getInvoice(invoiceID).then((response) => {
            this.setState({ invoice: response.data.invoice });
            console.log(response.data.invoice)

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

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, invoice } = this.state;

        const initialValues = { invoice };

        return (
            <div className="container mb-4">

                {(currentUser != null && invoice && invoice != null) ?
                    <div>

                        {/* invoice top bar */}
                        <div className="card">

                            <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex">

                                <div className = "d-inline-flex row d-flex align-items-center col-6 mt-2">
                                    <span className="text-start"> Status:  {invoice.status} </span>
                                </div>

                                <div className = "d-inline-flex row d-flex justify-content-end align-items-center col-6 mt-2">

                                    {/* edit invoice button */}
                                    <button
                                      type="button"
                                      id="invoice-edit-btn"
                                      className="btn btn-sm btn-secondary rounded-pill px-2 py-2 col-md-4 col-sm-8 my-auto custom-mr-10"
                                    >
                                        <i className="bi bi-pencil-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Edit</span>
                                    </button>

                                    {/* delete invoice button */}
                                    <button
                                      type="button"
                                      id="invoice-edit-btn"
                                      className="btn btn-sm btn-danger rounded-pill px-2 py-2 col-md-4 col-sm-8 my-auto"
                                    >
                                        <i className="bi bi-x-circle-fill align-self-center"></i>
                                        <span className="mx-1"></span>
                                        <span className="align-self-center">Delete</span>
                                    </button>
                                </div>

                            </div>

                        </div>

                        {/* invoice details */}
                        <div className="card">
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
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetFrom}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityFrom}
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateFrom}
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipFrom}
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneFrom}
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
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="companyTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.companyTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneTo}
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="emailTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.emailTo}
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

                                                        <div key={index} className="col-12 d-flex">
                                                            <div className="input-group-sm col-5">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-star"
                                                                  value={item.description}
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.price}
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.quantity}
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-3">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.amount}
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

