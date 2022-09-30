import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";

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
    invoice: InvoiceData | null,
    subtotal: string,
    tax: string,
    taxRate: string,
    totalDue: string,
};

class ViewInvoice extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            subtotal: "0.00",
            tax: "0.00",
            taxRate: "0.00",
            totalDue: "0.00",
            invoice: null,
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.calculate = this.calculate.bind(this);
        this.calculateSubtotal = this.calculateSubtotal.bind(this);
        this.calculateAmountDue = this.calculateAmountDue.bind(this);
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

    calculateSubtotal() {
        // sum the amounts of all invoice items

        const { invoice} = this.state;
        let total = 0.00;
        if (invoice != null) {
            try {
                invoice.invoiceItems.forEach(element => {
                    total += parseFloat(element.price) * parseInt(element.quantity);
                });

                this.setState({subtotal: String( total.toFixed(2) )});

            } catch {}  }
    }

    calculate() {
        // update invoice items maintained in state - for calculation purposes
/*
        for (let i in newList) {
            try {
                let item = newList[i];
                item.amount = String( ( parseFloat(item.price) * parseInt(item.quantity) ).toFixed(2) );
            } catch {}
        }

        //console.log(newList);
        this.setState({ invoiceItems: newList }, () => {
            //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
            //  use a callback when an action should be performed immediately after setting state.
            this.calculateSubtotal(); // recalculate subtotal
            this.calculateAmountDue(); // recalculate amount due
        });
*/
    }

    calculateAmountDue() {
        // calculate total amount due by adding tax to the subtotal

        const { invoice, taxRate } = this.state;
        let total = 0.00;
        let tax = 0.00;
/*
        try {

            invoiceItems.forEach(element => {
                total += parseFloat(element.amount);
            });

            tax = total * ( parseFloat(taxRate) );
            total += tax;
            this.setState({totalDue: String( total.toFixed(2) )});
            this.setState({tax: String( tax.toFixed(2) )});

        } catch {}
*/
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, invoice, subtotal, tax, totalDue } = this.state;

        const initialValues = { invoice };

        return (
            <div className="container mb-4">

               {(currentUser != null && invoice && invoice != null) ?
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


                            <Form>
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
                                                <Field
                                                  name="companyFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-12 pb-1 input-group-sm">
                                                <Field
                                                  name="streetFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-6 pb-1 input-group-sm">
                                                <Field
                                                  name="cityFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-4 pb-1 input-group-sm">
                                                <Field
                                                  name="stateFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-2 pb-1 input-group-sm">
                                                <Field
                                                  name="zipFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-12 pb-1 input-group-sm">
                                                <Field
                                                  name="phoneFrom"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            {/* Bill to */}
                                            <div className="form-group col-md-12 pb-1 mt-4">
                                                <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                    <strong className=""> Bill to </strong>
                                                </div>
                                            </div>

                                            <div className="form-group col-md-12 pb-1 input-group-sm">
                                                <Field
                                                  name="nameTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-12 pb-1 input-group-sm">
                                                <Field
                                                  name="companyTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-12 pb-1 input-group-sm">
                                                <Field
                                                  name="streetTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-6 pb-1 input-group-sm">
                                                <Field
                                                  name="cityTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-4 pb-1 input-group-sm">
                                                <Field
                                                  name="stateTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-2 pb-1 input-group-sm">
                                                <Field
                                                  name="zipTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-6 pb-1 input-group-sm">
                                                <Field
                                                  name="phoneTo"
                                                  type="text"
                                                  className="form-control"
                                                />
                                            </div>

                                            <div className="form-group col-md-6 pb-1 input-group-sm">
                                                <Field
                                                  name="emailTo"
                                                  type="text"
                                                  className="form-control"
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

{invoice && invoice.invoiceItems != null &&     invoice.invoiceItems.map( (item: InvoiceItem, index: number) =>

                                                    <div key={index} className="col-12 d-flex">
                                                        <div className="input-group-sm col-5">
                                                            <Field
                                                              type="text"
                                                              className="form-control text-star"
                                                            />
                                                        </div>
                                                        <div className="input-group-sm col-2">
                                                            <Field
                                                              type="text"
                                                              className="form-control text-start"
                                                            />
                                                        </div>
                                                        <div className="input-group-sm col-2">
                                                            <Field
                                                              type="text"
                                                              className="form-control text-start"
                                                            />
                                                        </div>
                                                        <div className="input-group-sm col-3">
                                                            <Field
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
                                                    <textarea name="comments" className="form-control input-group-sm"/>
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

                                        </div>

                                    </div>
                                </div>
                            </Form>

                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(ViewInvoice)

