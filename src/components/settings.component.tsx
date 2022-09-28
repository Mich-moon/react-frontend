import React from 'react';

import { Navigate, Link } from "react-router-dom";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import ReactModal from 'react-modal';  // for modal

import AuthService from "../services/AuthService";
import UserService from "../services/UserService";

import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { RoleEnum } from '../types/role.type'
import { StoredUser } from '../types/user.type'

// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    /** Details of currently logged in user */
    currentUser: StoredUser | null

    /** Whether flash message should be displayed */
    flash: boolean,

    /** Message to be flashed */
    flashMessage: string, // message to be flashed

    /** type of flash message */
    flashType: Color,

    /** Whether modal should be displayed */
    modal: boolean
};

class Settings extends React.Component <Props, State>{

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            currentUser: null,
            flash: false,
            flashMessage: "",
            flashType: "info",
            modal: false
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.deleteUser = this.deleteUser.bind(this);

    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        const currentUser = AuthService.getCurrentUser();
        const { navigate } = this.props;  // params injected from HOC wrapper component

        if (currentUser === null) {
            navigate("/home"); // redirect to home page
        } else {
            this.setState({ currentUser: currentUser });
            console.log(currentUser);
        }
    }

    deleteUser() {

        const { currentUser } = this.state;
        const { navigate } = this.props;  // params injected from HOC wrapper component

        this.setState({modal: false}); // close the modal

        if (currentUser != null) {

            //console.log(currentUser.id);
            UserService.deleteUser(currentUser.id).then(

                (response) => { // success

                    // display flash message
                    this.setState({
                        flash: true,
                        flashMessage: response.data.message,
                        flashType: "success"
                    });

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
                        flashType: "error"
                    });
                }
            );

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);

            AuthService.logout(); // remove user information from Local Storage and remove refresh token from database
            window.location.href="/";  // redirect page and refresh browser

        }
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { currentUser, flash, flashMessage, flashType, modal } = this.state;

        return (
            <div className="container">

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
                    <div className="my-4"> Are you sure you want to deactivate your account?</div>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger admin-action"
                      onClick={() => this.deleteUser()}>
                        <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger admin-action"
                      onClick={() => this.setState({modal: false})}>
                        <span>Cancel</span>
                    </button>
                </ReactModal>


                <h3> Settings page </h3>

                <hr className="pb-2"/>

                <button
                  type="button"
                  id="delete-user-btn-admin"
                  className="btn btn-sm btn-danger admin-action"
                  onClick={() => this.setState({modal: true})}
                >
                    <span>Deactivate My Account</span>
                </button>

            </div>
        );
    }

}

export default withRouter(Settings)
