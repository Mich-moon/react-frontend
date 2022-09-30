import React from 'react';

import { Navigate, Link } from "react-router-dom";

import Alert, { Color } from '@material-ui/lab/Alert';  // for flash message
import Fade from '@material-ui/core/Fade';   // for flash message fade

import ReactModal from 'react-modal';  // for modal

import UserService from '../services/UserService';
import styles from "../css/alert.module.css";

import { withRouter, WithRouterProps } from './withRouter';


// types and interfaces
import { Role } from '../types/role.type'
import { IUser } from '../types/user.type'


// explicitly define the typings for the componentDidMounts state
interface Params {};

type Props = WithRouterProps<Params>;

interface State {

    /** A list with elements of type User */
    users: IUser[] | null,

    /** Whether flash message should be displayed */
    flash: boolean,

    /** Message to be flashed */
    flashMessage: string,

    /** type of flash message */
    flashType: Color,

    /** Whether modal should be displayed */
    modal: boolean,

    /** ID of user to be deleted */
    deleteID: number | null
};

class Users extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
     constructor(props: Props) {

         // declare state variables
         super(props)
         this.state = {
             users: null,
             flash: false,
             flashMessage: "",
             flashType: "info",
             modal: false,
             deleteID: null
         };

         // bind methods so that they are accessible from the state inside of the render() method.
         this.getUsers = this.getUsers.bind(this);
         this.deleteUser = this.deleteUser.bind(this);
         this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);

     }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
     componentDidMount(){

         UserService.getUsers().then((response) => {
             this.setState({ users: response.data.users });
             //console.log(response.data.users)

         }).catch((error) => {

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

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);

         });
     }

    //  componentDidUpdate() - lifecycle method to execute code after the
    //      component is updated in the DOM (Document Object Model).
    componentDidUpdate() {
        this.getUsers();
    }

    getUsers() {

        UserService.getUsers().then((response) => {
            this.setState({ users: response.data.users });
        }).catch((error) => {

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

            // set timer on flash message
            setTimeout(() => {
                this.setState({ flash: false, flashMessage: "" });
            }, 5000);
        });
    }

    deleteUser() {

        this.setState({modal: false}); // close the modal

        if (this.state.deleteID != null) {

            //console.log("delete"+this.state.deleteID);

            UserService.deleteUser(this.state.deleteID).then(

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
        // set id of user to be deleted and open modal
        this.setState({modal: true, deleteID: id});
    }


    //  render() - lifecycle method that outputs HTML to the DOM.
     render () {

        const { users, flash, flashMessage, flashType, modal } = this.state;

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
                     <div className="my-4"> Are you sure you want to delete this user?</div>

                     <button
                      type="button"
                      className="btn btn-sm btn-danger custom-mr-10"
                      onClick={() => this.deleteUser()}
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
                     <h4 className="text-center"> Users </h4>

                     <div className="table-responsive-xxl">
                         <table className="table table-hover caption-top w-100 mt-4">
                             <caption>List of users</caption>

                             <thead className="table-light">
                                 <tr>
                                     <th className="text-start" scope="col"> Id </th>
                                     <th className="text-start" scope="col"> First Name </th>
                                     <th className="text-start" scope="col"> Last Name </th>
                                     <th className="text-start" scope="col"> Email </th>
                                     <th className="text-start" scope="col"> Actions </th>
                                 </tr>
                             </thead>

                             {(users != null) ?
                                 <tbody>
                                     {users.map(user =>

                                         <tr key = {user.id}>
                                             <th className="text-start" scope="row"> {user.id}</th>
                                             <td className="text-start"> {user.firstName}</td>
                                             <td className="text-start"> {user.lastName}</td>
                                             <td className="text-start"> {user.email}</td>
                                             <td>
                                                 <button
                                                   type="button"
                                                   id={`delete-user-btn-${user.id}`}
                                                   className="btn btn-sm btn-danger custom-mr-10"
                                                   onClick={() => this.handleOpenDeleteModal(user.id)}
                                                 >
                                                     <span>Delete</span>
                                                 </button>

                                                 <Link to={`/userview/${user.id}`} className="btn btn-sm btn-info custom-mr-10">View</Link>
                                             </td>

                                         </tr>
                                     )}
                                 </tbody>
                             :
                                <p className="mt-4 fst-italic text-warning"> No users found </p>
                             }

                         </table>
                    </div>
                 </div>
             </div>

         )
     }
}

export default withRouter(Users)