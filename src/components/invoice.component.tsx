import React from 'react';

import { Navigate, Link } from "react-router-dom";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import ReactModal from 'react-modal';  // for modal

import AuthService from "../services/AuthService";
import InvoiceService from "../services/InvoiceService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { InvoiceItem } from '../types/invoice.type'
import { InvoiceData } from '../types/invoice.type'

type IStatus = "draft" | "pending" | "approved" | "paid"

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
    currentUser: IUser | null,
    flash: boolean,
    flashMessage: string,
    flashType: Color,
    invoices : InvoiceData[] | null
};

class Invoices extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props)
        this.state = {
            currentUser: null,
            flash: false,
            flashMessage: "",
            flashType: "info",
            invoices: null
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount(){

        const { navigate } = this.props;  // params injected from HOC wrapper component

        const currentUser = AuthService.getCurrentUser();
        if (currentUser !== null) {
            this.setState({ currentUser: currentUser });
        }

        InvoiceService.getInvoices().then((response) => {
            this.setState({ invoices: response.data.invoices });
            console.log(response.data.invoices)
        });
    }


    //  render() - lifecycle method that outputs HTML to the DOM.
    render () {

        const { invoices, flash, flashMessage, flashType } = this.state;

        return (
            <div>

                {/* flash message */}
                <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                    <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                </Fade>

                {/* top panel */}
                <div className="d-flex justify-content-between">

                    <div>
                        <h4> Invoices </h4>
                    </div>

                    <div>
                        <span className="mx-4"> Filter by status </span>

                        <Link to={`/newinvoice`} className="btn btn-sm btn-info admin-action rounded-pill px-4 py-2">
                            <i className="bi bi-plus-circle-fill text-white align-self-center"></i>
                            <span className="mx-1"></span>
                            <span className="align-self-center"> New Invoice </span>
                        </Link>

                    </div>

                </div>

                {/* invoices */}
                <div>
                {invoices && invoices.map( (invoice: InvoiceData) =>

                    <span> {invoice.id} </span>

                )}
                </div>
            </div>

        )
    }
}

export default withRouter(Invoices)