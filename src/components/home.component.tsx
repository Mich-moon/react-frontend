import React from 'react';

import { Link } from "react-router-dom";

import UserService from "../services/UserService";

import { withRouter, WithRouterProps } from './withRouter';


// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    content: string
};

class Home extends React.Component <Props, State>{

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            content: ""
        }
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        UserService.getPublicContent().then(
            response => {
                this.setState({
                    //content: response.data
                    content: "Making your life a bit less harder"
                });
            },
            error => {
                this.setState({
                    content:
                        (error.response && error.response.data) ||
                        error.message ||
                        error.toString()
                });
            }
        );
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {
        return (
            <div className="container py-4">

                <div className="card py-4 bg-image bg-home">

                    <p className="fs-1 fw-bold mt-4"> Online Invoice App </p>
                    <span className="fw-bold"> {this.state.content} </span>

                    <div className="d-flex justify-content-center my-4">
                        <Link to={`/login`} className="btn btn-sm btn-info custom-mr-10 rounded-pill px-4 py-2">
                            <span className="align-self-center"> Login </span>
                        </Link>

                        <Link to={`/register`} className="btn btn-sm btn-info custom-mr-10 rounded-pill px-4 py-2">
                            <span className="align-self-center"> Signup </span>
                        </Link>
                    </div>

                </div>
            </div>
        );
    }

}

export default withRouter(Home)
