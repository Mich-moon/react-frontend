import React from 'react';

import UserService from "../services/UserService";


// types for the component props
type Props = {};

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
                    content: response.data
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
            <div className="container">
                <header className="jumbotron">
                    <h3>{this.state.content}</h3>
                </header>
            </div>
        );
    }

}

export default Home
