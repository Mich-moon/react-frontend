import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import AuthService from "../services/AuthService";
import InvoiceService from "../services/InvoiceService";

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
    price: string,
    quantity: string,
    amount: string
};

type State = {
    userReady: boolean,
    currentUser: IUser | null,
    loading: boolean,
    flash: boolean,
    flashMessage: string,
    flashType: Color,
    invoiceItems: InvoiceItem[],
    subtotal: string,
    tax: string,
    taxRate: string,
    totalDue: string,
    lastInvoiceNum: string,
    invoiceDate: string
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
                price: "0.00",
                quantity: "0",
                amount: "0.00"
            }],
            subtotal: "0.00",
            tax: "0.00",
            taxRate: "0.00",
            totalDue: "0.00",
            lastInvoiceNum: "0000",
            invoiceDate: "00-00-0000"
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.calculateSubtotal = this.calculateSubtotal.bind(this);
        this.handleItemChange = this.handleItemChange.bind(this);
        this.calculateAmountDue = this.calculateAmountDue.bind(this);
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

        // get date and format it
        const today = new Date();
        const yyyy = String( today.getFullYear() );
        const mm = (today.getMonth() + 1) > 10 ? String( today.getMonth() + 1 ) : "0" + String( (today.getMonth() + 1) ); // Months start at 0!
        const dd = today.getDate() > 10 ? String( today.getDate() ) : "0" + String( today.getDate() );
        const formattedToday = dd + "/" + mm + "/" + yyyy;

        this.setState({ invoiceDate: formattedToday });

        // get id number of last invoice in database
        //
        this.setState({ lastInvoiceNum: "00001" });

        // get tax rate
        //
        this.setState({ taxRate: "0.01" });
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
            formInvoiceItems: Yup.array()
                .of(
                    Yup.object().shape({
                        description: Yup.string().required("Description is required"),
                        price: Yup.number().required("Price is required"),
                        quantity: Yup.number().required("Quantity is required"),
                        amount: Yup.number().required("Amount is required"),
                    })
                )
                .required("Invalid invoice item(s)"),
        });
    }

    handleSubmit(formValue: { companyFrom: string; streetFrom: string; cityFrom: string; stateFrom: string; zipFrom: string; phoneFrom: string;
                               nameTo: string; companyTo: string; streetTo: string; cityTo: string; stateTo: string;
                               zipTo: string; phoneTo: string; emailTo: string; comments: string }) {

        // handle data from form submission
        const { companyFrom, streetFrom, cityFrom, stateFrom, zipFrom, phoneFrom,
                nameTo, companyTo, streetTo, cityTo, stateTo, zipTo, phoneTo, emailTo,
                comments } = formValue; // get data from form

        const { invoiceItems, currentUser } = this.state;

        this.setState({ loading: true });

        if (currentUser != null) {
            let createdBy = currentUser.id;

            InvoiceService.createInvoice({companyFrom, streetFrom, cityFrom, stateFrom, zipFrom, phoneFrom,
                                         nameTo, companyTo, streetTo, cityTo, stateTo, zipTo,
                                         phoneTo, emailTo, invoiceItems, comments, createdBy})
            .then(
                response => { // creation successful

                    this.setState({
                        flash: true,
                        flashMessage: response.data.message,
                        flashType: "success",
                        loading: false
                    });
                },
                error => { // creation not successful

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
                }
            );
            console.log("created by id: "+ createdBy);
        }
    }

    addItem() {
        // add a new item to the invoice

        const { invoiceItems } = this.state;
        const newList = invoiceItems.concat({
            description: "",
            price: "0.00",
            quantity: "0",
            amount: "0.00"
        });

        this.setState({ invoiceItems: newList });
    }

    removeItem(index: number) {
        // remove an item from the invoice

        const { invoiceItems } = this.state;

        if (invoiceItems.length !== 1) {
            const newList = invoiceItems.filter((item, j) => index !== j);
            this.setState({ invoiceItems: newList });
            this.calculateSubtotal(); // recalculate subtotal
            this.calculateAmountDue(); // recalculate amount due

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
        }
    }

    calculateSubtotal() {

        const { invoiceItems } = this.state;
        let total = 0.00;

        try {

            invoiceItems.forEach(element => {
                total += parseFloat(element.price) * parseInt(element.quantity);
            });

            this.setState({subtotal: String( total.toFixed(2) )});

        } catch {}
    }

    handleItemChange(newList: InvoiceItem[]) {
        // update invoice items maintained in state - for calculation purposes

        //const { invoiceItems } = this.state;

        for (let i in newList) {
            try {
                let item = newList[i];
                item.amount = String( ( parseFloat(item.price) * parseInt(item.quantity) ).toFixed(2) );
            } catch {}
        }

/*        const newList = invoiceItems.map((item, j) => {

            if (j === index) {

                try {
                    if (field == "d") { // edit description
                        item.description = value;

                    } else if (field == "p") { // edit price
                        if (!Number.isNaN( parseFloat(value) )) {
                            item.price = value;
                        }

                    } else if (field == "q") { // edit quantity
                        if (!Number.isNaN( parseInt(value) )) {
                            item.quantity = value;
                        }
                    }

                    // recalculate amount
                    item.amount = String( ( parseFloat(item.price) * parseInt(item.quantity) ).toFixed(2) );

                } catch {}

                return item;
            } else {
                return item;
            }
        });
*/
        //console.log(newList);
        this.setState({ invoiceItems: newList });
        this.calculateSubtotal(); // recalculate subtotal
        this.calculateAmountDue(); // recalculate amount due
    }

    calculateAmountDue() {

        const { invoiceItems, taxRate } = this.state;
        let total = 0.00;
        let tax = 0.00;

        try {

            invoiceItems.forEach(element => {
                total += parseFloat(element.amount);
            });

            console.log(total);
            tax = total * ( parseFloat(taxRate) );
            total += tax;
            this.setState({totalDue: String( total.toFixed(2) )});
            this.setState({tax: String( tax.toFixed(2) )});

        } catch {}
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { userReady, currentUser, loading, flash, flashMessage, flashType,
                invoiceItems, subtotal, tax, totalDue, lastInvoiceNum, invoiceDate } = this.state;

        const initialValues = {
            companyFrom: "",
            streetFrom: "",
            cityFrom: "",
            stateFrom: "",
            zipFrom: "",
            phoneFrom: "",
            nameTo: "",
            companyTo: "",
            streetTo: "",
            cityTo: "",
            stateTo: "",
            zipTo: "",
            phoneTo: "",
            emailTo: "",
            formInvoiceItems: [{
                description: "",
                price: "0.00",
                quantity: "0",
                amount: "0.00"
            }],
            comments: ""
        };

        return (
            <div className="container mb-4">

                {/* flash message */}
                 <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                     <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                 </Fade>

                {(userReady && currentUser != null) ?
                    <div>
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

                            <Formik
                              initialValues={initialValues}
                              validationSchema={this.validationSchema}
                              onSubmit={this.handleSubmit}  // onSubmit function executes if there are no errors
                            >
                                {({ values, errors, touched, handleReset }) => (
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
                                                          className={errors.companyFrom && touched.companyFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Company Name"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-12 pb-1 input-group-sm">
                                                        <Field
                                                          name="streetFrom"
                                                          type="text"
                                                          className={errors.streetFrom && touched.streetFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Street Address"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-6 pb-1 input-group-sm">
                                                        <Field
                                                          name="cityFrom"
                                                          type="text"
                                                          className={errors.cityFrom && touched.cityFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="City"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-4 pb-1 input-group-sm">
                                                        <Field
                                                          name="stateFrom"
                                                          type="text"
                                                          className={errors.stateFrom && touched.stateFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="State"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-2 pb-1 input-group-sm">
                                                        <Field
                                                          name="zipFrom"
                                                          type="text"
                                                          className={errors.zipFrom && touched.zipFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Zip"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-12 pb-1 input-group-sm">
                                                        <Field
                                                          name="phoneFrom"
                                                          type="text"
                                                          className={errors.phoneFrom && touched.phoneFrom ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Phone"
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
                                                          className={errors.nameTo && touched.nameTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Name"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-12 pb-1 input-group-sm">
                                                        <Field
                                                          name="companyTo"
                                                          type="text"
                                                          className={errors.companyTo && touched.companyTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Company Name"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-12 pb-1 input-group-sm">
                                                        <Field
                                                          name="streetTo"
                                                          type="text"
                                                          className={errors.streetTo && touched.streetTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Street Address"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-6 pb-1 input-group-sm">
                                                        <Field
                                                          name="cityTo"
                                                          type="text"
                                                          className={errors.cityTo && touched.cityTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="City"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-4 pb-1 input-group-sm">
                                                        <Field
                                                          name="stateTo"
                                                          type="text"
                                                          className={errors.stateTo && touched.stateTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="State"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-2 pb-1 input-group-sm">
                                                        <Field
                                                          name="zipTo"
                                                          type="text"
                                                          className={errors.zipTo && touched.zipTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Zip"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-6 pb-1 input-group-sm">
                                                        <Field
                                                          name="phoneTo"
                                                          type="text"
                                                          className={errors.phoneTo && touched.phoneTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Phone"
                                                        />
                                                    </div>

                                                    <div className="form-group col-md-6 pb-1 input-group-sm">
                                                        <Field
                                                          name="emailTo"
                                                          type="text"
                                                          className={errors.emailTo && touched.emailTo ? 'form-control is-invalid' : 'form-control'}
                                                          placeholder="Email"
                                                        />
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
                                                                    <td> {lastInvoiceNum} </td>
                                                                    <td> {invoiceDate} </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>


                                                <FieldArray
                                                  name="formInvoiceItems"
                                                  render={ ({ remove, push }) => (

                                                    <div>

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

                                                            {values.formInvoiceItems && values.formInvoiceItems.map( (item: InvoiceItem, index: number) =>

                                                                <div key={index} className="col-12 d-flex">
                                                                    <div className="input-group-sm col-5">
                                                                        <Field
                                                                          name={`formInvoiceItems.[${index}].description`}
                                                                          type="text"
                                                                          //className={errors.formInvoiceItems && errors.formInvoiceItems[index].description && touched ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                          onBlur={ (e: React.FormEvent<HTMLInputElement>) =>
                                                                            this.handleItemChange(values.formInvoiceItems)
                                                                          }
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-2">
                                                                        <Field
                                                                          name={`formInvoiceItems.[${index}].price`}
                                                                          type="text"
                                                                          className="form-control text-start"
                                                                          onBlur={ (e: React.FormEvent<HTMLInputElement>) =>
                                                                            this.handleItemChange(values.formInvoiceItems)
                                                                          }
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-2">
                                                                        <Field
                                                                          name={`formInvoiceItems.[${index}].quantity`}
                                                                          type="text"
                                                                          className="form-control text-start"
                                                                          onBlur={ (e: React.FormEvent<HTMLInputElement>) =>
                                                                            this.handleItemChange(values.formInvoiceItems)
                                                                          }
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-3">
                                                                        <Field
                                                                          name={`formInvoiceItems.[${index}].amount`}
                                                                          type="text"
                                                                          className="form-control text-start"
                                                                          value={invoiceItems[index].amount}
                                                                        />
                                                                    </div>

                                                                    <button
                                                                      type="button"
                                                                      id="delete-item-btn"
                                                                      className="btn p-0"
                                                                      onClick={() => {  values.formInvoiceItems.length <= 1 ? console.log("") :  remove(index); this.removeItem(index) } }
                                                                    >
                                                                        <i className="bi bi-trash align-self-center fs-5"></i>
                                                                    </button>
                                                                </div>
                                                            )}


                                                            {/* Error message for invoice items */}
                                                            {/* <ErrorMessage name="formInvoiceItems" component="div" className="alert alert-danger"/> */}

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

                                                        {/* add item button */}
                                                        <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex">

                                                            <div className = "row col-md-8 col-sm-6 flex-fill mt-2">
                                                                <button
                                                                  type="button"
                                                                  id="invoice-add-item-btn"
                                                                  className="btn btn-sm btn-primary rounded-pill px-4 py-2 col-md-4 col-sm-8 my-auto"
                                                                  onClick={() => { this.addItem(); push( { description: "", price: "0.00", quantity: "0", amount: "0.00"} ) } }
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
                                )}
                            </Formik>

                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default withRouter(CreateInvoice)

