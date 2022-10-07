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
import { IStatus } from '../types/invoice.type'

import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'


// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    /* Details of user currently logged into the app */
    currentUser: IUser | null,

    /** Whether flash message should be displayed */
    flash: boolean,

    /** Message to be flashed */
    flashMessage: string,

    /** type of flash message */
    flashType: Color,

    /** A list with elements of type InvoiceData */
    invoices : InvoiceData[] | null,

    /** Whether modal should be displayed */
    modal: boolean,

    /** ID of invoice to be deleted */
    deleteID: number | null
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
            invoices: null,
            modal: false,
            deleteID: null
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.getInvoices = this.getInvoices.bind(this);
        this.downloadPDF = this.downloadPDF.bind(this);
        this.deleteInvoice = this.deleteInvoice.bind(this);
        this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount(){

        const { navigate } = this.props;  // params injected from HOC wrapper component

        const currentUser = AuthService.getCurrentUser();
        if (currentUser !== null) {
            this.setState({ currentUser: currentUser }, () => { this.getInvoices(); });
        } else {
            navigate("/home"); // redirect to home page
        }

    }
/*
    //  componentDidUpdate() - lifecycle method to execute code after the
    //      component is updated in the DOM (Document Object Model).
    componentDidUpdate(prevState: any) {
        if (this.state.invoices !== prevState.invoices) {
            this.getInvoices();
            console.log("updated");
        }
    }
*/
    getInvoices() {

        InvoiceService.getInvoices().then((response) => {
            this.setState({ invoices: response.data.invoices });
            //console.log(response.data.invoices)

        }).catch((error) => {
            const resMessage =
                (error.response &&
                error.response.data &&
                error.response.data.message) ||
                error.message ||
                error.toString();

            console.log(resMessage);
            this.setState({ invoices: null });

        });
    }

    downloadPDF(id: number) {
        console.log("PDF download coming soon");
    }

    deleteInvoice() {

        if (this.state.deleteID != null) {

            //console.log("delete"+this.state.deleteID);

            InvoiceService.deleteInvoice(this.state.deleteID).then(

                (response) => { // success

                    this.getInvoices();

                    // display flash message
                    this.setState({
                        flash: true,
                        flashMessage: response.data.message,
                        flashType: "success",
                    }, () => { this.getInvoices(); });

                },
                error => { // failure

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
                        deleteID: null
                    });
                }
            );

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);
        }
    }

    handleOpenDeleteModal(id: number) {
        // set id of invoice to be deleted and open modal
        this.setState({modal: true, deleteID: id});
    }


    //  render() - lifecycle method that outputs HTML to the DOM.
    render () {

        const { invoices, flash, flashMessage, flashType, modal } = this.state;

        return (
            <div>

                {/* flash message */}
                <Fade in={flash} timeout={{ enter: 300, exit: 1000 }}>
                    <Alert className={styles.alert} severity={flashType}> {flashMessage} </Alert>
                </Fade>

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

                <div className="card">

                    {/* top panel */}
                    <div className="d-flex justify-content-between">

                        <div> <h4> Invoices </h4> </div>

                        <div>
                            <span className="mx-4"> Filter by status </span>

                            <Link to={`/newinvoice`} className="btn btn-sm btn-info admin-action rounded-pill px-4 py-2">
                                <i className="bi bi-plus-circle-fill text-white align-self-center"></i>
                                <span className="mx-1"></span>
                                <span className="align-self-center"> New Invoice </span>
                            </Link>
                        </div>
                    </div>

                    <hr/>

                    {/* invoices */}
                    <div>
                    {(invoices != null) ?

                        <div className="mt-4">
                            {invoices.map( (invoice: InvoiceData) =>
                                <div key={invoice.id} className="card">
                                    <div className="d-flex row justify-content-between">

                                        {/* download PDF button */}
                                        <div className="d-inline-flex d-flex align-items-center mx-0 col-md-2 col-sm-12">
                                            <button
                                                type="button"
                                                id={`invoice-pdf-${invoice.id}`}
                                                className="btn btn-sm bg-light rounded-pill text-secondary"
                                                onClick={() => this.downloadPDF(invoice.id)}
                                            >
                                                <span className="custom-mr-10"> PDF </span>
                                                <i className="bi bi-download align-self-center"></i>
                                            </button>
                                        </div>

                                        {/* invoice data */}
                                        <div className="d-inline-flex d-flex align-items-center mx-0 col-md-7 col-sm-12">
                                            <div className="d-flex align-items-center flex-column col-3">
                                                <span className="text-mini"> {invoice.id} </span>
                                                <span className="fw-lighter text-mini text-muted"> ID </span>
                                            </div>
                                            <div className="d-flex align-items-center flex-column col-3">
                                                <span className="text-mini"> {invoice.date} </span>
                                                <span className="fw-lighter text-mini text-muted"> created at </span>
                                            </div>
                                            <div className="d-flex align-items-center flex-column col-3">
                                                <span className="text-mini"> {invoice.createdBy} </span>
                                                <span className="fw-lighter text-mini text-muted"> created by </span>
                                            </div>
                                            <div className="d-flex align-items-center flex-column col-3">
                                                <span className="text-mini rounded-pill bg-light px-2 py-1"> {invoice.status} </span>
                                            </div>
                                        </div>

                                        <div className="d-inline-flex d-flex justify-content-end align-items-center mx-0 col-md-3 col-sm-12">

                                            {/* edit button */}
                                            <Link to={`/userview/${0}`} className="btn btn-sm bg-light rounded-pill custom-mr-10 text-secondary">
                                                <i className="bi bi-pencil-fill align-self-center"></i>
                                            </Link>

                                            {/* delete button */}
                                            <button
                                                type="button"
                                                id={`invoice-pdf-${invoice.id}`}
                                                className="btn btn-sm bg-light rounded-pill custom-mr-10 text-secondary"
                                                onClick={() => this.handleOpenDeleteModal(invoice.id)}
                                            >
                                                <i className="bi bi-x-circle-fill align-self-center"></i>
                                            </button>

                                            {/* view button */}
                                            <Link to={`/invoiceview/${invoice.id}`} className="btn btn-sm bg-light rounded-pill custom-mr-10 text-secondary">
                                                <i className="bi bi-box-arrow-right align-self-center"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    :
                       <p className="mt-4 fst-italic text-warning"> No invoices found </p>
                    }
                    </div>
                </div>
            </div>

        )
    }
}

export default withRouter(Invoices)