import React from 'react';

import ErrorBoundary from './error-page.component';
import UserService from "../services/UserService";


// types for the component props
type Props = {};

type State = {
    content: string
};


class BoardUser extends React.Component<Props, State> {

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

        UserService.getUserBoard().then(
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
                </ErrorBoundary>

            </div>
        );
    }

}

export default BoardUser
