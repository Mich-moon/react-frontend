import React from 'react';

import { Navigate, useParams, Link } from "react-router-dom";

import ErrorBoundary from './error-page.component';

import UserService from "../services/UserService";

import { withRouter, WithRouterProps } from './withRouter';


// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    content: string
};


class BoardModerator extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            content: ""
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        UserService.getModeratorBoard().then(
            response => {
                this.setState({
                    content: response.data
                });
            },
            error => {
                this.setState({
                    content:
                        (error.response && error.response.data && error.response.data.message) ||
                        error.message ||
                        error.toString()
                });
            }
        );
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {
        return (
            <div className="container">
                <ErrorBoundary>
                    <header className="jumbotron">
                        <h3>{this.state.content}</h3>
                    </header>

                    <hr/>

                    <div className="d-flex justify-content-between">
                        <div>
                            <h4> Invoices </h4>
                        </div>
                        <div>
                            <span className="mx-4"> Filter by status </span>

                            <Link to={`/newinvoice`} className="btn btn-sm btn-info admin-action rounded-pill px-4 py-2">
                                <i className="bi bi-plus-circle-fill align-middle mr-2"></i>
                                <span className="align-middle"> New Invoice </span>
                            </Link>

                        </div>
                    </div>

                </ErrorBoundary>
            </div>
        );
    }

}

export default withRouter(BoardModerator)
