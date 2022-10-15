import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import AuthService from "../services/AuthService";
import InvoiceService from "../services/InvoiceService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'
import { InvoiceItem } from '../types/invoice.type'


// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    userReady: boolean,
    currentUser: IUser | null,
    loading: boolean,
    flash: boolean,
    flashMessage: string,
    flashType: Color,
    items: InvoiceItem[],
    subtotal: string,
    tax: string,
    taxRate: string,
    totalDue: string,
    invoiceNum: string,
    invoiceDate: string,

    /* Indicates whether invoice data should be saved as pending (not a draft) */
    save: boolean
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
            items: [{
                description: "desc",
                price: "0.00",
                quantity: "0",
                amount: "0.00"
            }],
            subtotal: "0.00",
            tax: "0.00",
            taxRate: "0.00",
            totalDue: "0.00",
            invoiceNum: "0000",
            invoiceDate: "00-00-0000",
            save: false
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.newDesc = this.newDesc.bind(this);
        this.newPrice = this.newPrice.bind(this);
        this.newQty = this.newQty.bind(this);
        this.calculateSubtotal = this.calculateSubtotal.bind(this);
        this.handleItemChange = this.handleItemChange.bind(this);
        this.calculateAmountDue = this.calculateAmountDue.bind(this);
        this.invoiceStatusToPending = this.invoiceStatusToPending.bind(this);
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
        this.setState({ invoiceNum: "#####" });

        // get tax rate
        // ...
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

        const { items, currentUser, save,
               subtotal, tax, taxRate, totalDue } = this.state;

        this.setState({ loading: true });

        if (currentUser != null) {
            let createdBy = currentUser.id;

            InvoiceService.createInvoice({companyFrom, streetFrom, cityFrom, stateFrom, zipFrom, phoneFrom,
                                         nameTo, companyTo, streetTo, cityTo, stateTo, zipTo,
                                         phoneTo, emailTo, items, comments, createdBy,
                                         subtotal, taxRate, tax, totalDue})
            .then(
                response => { // creation successful

                    this.setState({
                        flash: true,
                        //flashMessage: response.data.message,
                        flashMessage: "Invoice saved successfully!",
                        flashType: "success",
                        loading: false,
                        invoiceNum: (response.data.invoice.id).toString().padStart(4, "0")
                    });

                    if (save) {
                        this.invoiceStatusToPending();
                    }
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
                    console.log(resMessage);
                }
            );
            //console.log("created by id: "+ createdBy);

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: ""});
            }, 5000);
        }
    }

    invoiceStatusToPending() {
        // change the invoice's status to invoiceStatusToPending

        const { invoiceNum } = this.state;
        let id = parseInt(invoiceNum);

        if (!Number.isNaN( id )) {

            InvoiceService.updateInvoiceStatus(id, "pending")
            .then(
                response => { // status update successful

                    this.setState({
                        flash: true,
                        //flashMessage: response.data.message,
                        flashMessage: "Invoice created successfully!",
                        flashType: "success",
                        loading: false,
                        save: false
                    });
                },
                error => { // update not successful

                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();

                    console.log("Failed - " + resMessage);
                    this.setState({ save: false })
                    /*this.setState({
                        flash: true,
                        flashMessage: resMessage,
                        flashType: "error",
                        loading: false
                    });*/
                }
            );

        } else {
            this.setState({
                flash: true,
                flashMessage: "Oops! something went wrong",
                flashType: "error",
                loading: false
            });
        }

        // set timer on flash message
        setTimeout(() => {
            this.setState({ flash: false, flashMessage: ""});
        }, 5000);

    }

    addItem() {
        // add a new item to the invoice

        const { items } = this.state;
        const newList = items.concat({
            description: "desc",
            price: "0.00",
            quantity: "0",
            amount: "0.00"
        });

        this.setState({ items: newList });
        console.log("new list");
        console.log(newList);
    }

    removeItem(index: number) {
        // remove an item from the invoice

        const { items } = this.state;

        if (items.length !== 1) {
            const newList = items.filter((item, j) => index !== j);
            console.log("new list");
            console.log(newList);

            this.setState({ items: newList }, () => {
                //  NB - setState works in an asynchronous way...this.state variable is not immediately changed.
                //  use a callback when an action should be performed immediately after setting state.

                let subTotal = this.calculateSubtotal(newList);
                if (subTotal !== "CALC_FAILED") {
                    this.calculateAmountDue(subTotal); // recalculate amount due
                }

            });
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

    handleItemChange(newList: InvoiceItem[]) {
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

        const { userReady, currentUser, loading, flash, flashMessage, flashType,
                items, subtotal, tax, totalDue, invoiceNum, invoiceDate } = this.state;

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
            formitems: [{
                description: "desc",
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

                                                            {values.formitems && values.formitems.map( (item: InvoiceItem, index: number) =>

                                                                <div key={index} className="col-12 d-flex hover-shadow mb-1">
                                                                    <div className="input-group-sm col-5">
                                                                        <Field
                                                                          name={`formitems.${index}.description`}
                                                                          type="text"
                                                                          className={errors.formitems && (errors.formitems[index] as InvoiceItem).description && touched.formitems && touched.formitems[index].description ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                          data-bs-toggle="tooltip"
                                                                          data-bs-placement="top"
                                                                          title={errors.formitems && (errors.formitems[index] as InvoiceItem).description && touched.formitems && touched.formitems[index].description ? (errors.formitems[index] as InvoiceItem).description : ''}
                                                                          onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                            handleChange(e);
                                                                            this.newDesc(e.currentTarget.value, index);
                                                                            //setFieldValue(`formitems.${index}.description`, e.currentTarget.value);
                                                                            //console.log(values.formitems[index].description);
                                                                          }}
                                                                          //onBlur={handleBlur}
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-2">
                                                                        <Field
                                                                          name={`formitems.${index}.price`}
                                                                          type="text"
                                                                          className={errors.formitems && (errors.formitems[index] as InvoiceItem).price && touched.formitems && touched.formitems[index].price ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                          data-bs-toggle="tooltip"
                                                                          data-bs-placement="top"
                                                                          title={errors.formitems && (errors.formitems[index] as InvoiceItem).price && touched.formitems && touched.formitems[index].price ? (errors.formitems[index] as InvoiceItem).price : ''}
                                                                          onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                            handleChange(e);
                                                                            this.newPrice(e.currentTarget.value, index);
                                                                          }}
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-2">
                                                                        <Field
                                                                          name={`formitems.${index}.quantity`}
                                                                          type="text"
                                                                          className={errors.formitems && (errors.formitems[index] as InvoiceItem).quantity && touched.formitems && touched.formitems[index].quantity ? 'form-control text-start is-invalid' : 'form-control text-start'}
                                                                          data-bs-toggle="tooltip"
                                                                          data-bs-placement="top"
                                                                          title={errors.formitems && (errors.formitems[index] as InvoiceItem).quantity && touched.formitems && touched.formitems[index].quantity ? (errors.formitems[index] as InvoiceItem).quantity : ''}
                                                                          onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                                                                            handleChange(e);
                                                                            this.newQty(e.currentTarget.value, index);
                                                                          }}
                                                                        />
                                                                    </div>
                                                                    <div className="input-group-sm col-3">
                                                                        <Field
                                                                          name={`formitems.${index}.amount`}
                                                                          type="text"
                                                                          className="form-control text-start"
                                                                          value={items[index].amount}
                                                                        />
                                                                    </div>

                                                                    <button
                                                                      type="button"
                                                                      id="delete-item-btn"
                                                                      className="btn p-0"
                                                                      onClick={() => {
                                                                        values.formitems.length <= 1 ? console.log("") :  remove(index); this.removeItem(index)
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
                                                                  onClick={() => {
                                                                    this.addItem();
                                                                    //push( { description: "desc", price: "0.00", quantity: "0", amount: "0.00"} as InvoiceItem );
                                                                    push( { description: "desc", price: "0.00", quantity: "0", amount: "0.00"} as InvoiceItem );
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
                                                            <span className="align-self-center">Discard</span>
                                                        </button>
                                                    </div>

                                                    <div className="row col-md-6 col-sm-12">

                                                        <button
                                                          type="submit"
                                                          id="invoice-draft-btn"
                                                          className="btn btn-sm btn-outline-secondary rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto mx-4 ms-auto"
                                                          disabled={!(isValid && dirty)}
                                                        >
                                                            <i className="bi bi-check align-self-center"></i>
                                                            <span className="mx-1"></span>
                                                            <span className="align-self-center">Draft</span>
                                                        </button>

                                                        <button
                                                          type="button"
                                                          id="invoice-save-btn"
                                                          onClick={() => { this.setState({ save: true  }, () => { this.handleSubmit(values) } ); }}
                                                          className="btn btn-sm btn-success rounded-pill p-2 mt-2 col-md-4 col-sm-4 my-auto"
                                                          disabled={!(isValid && dirty)}
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

