import React from 'react';

import { Routes, Route, Link } from "react-router-dom";


// types for the component props
type Props =  {};

type State = {};

class Footer extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {};

    }

    // componentDidMount() - lifecycle method to execute code when the
    // component is already placed in the DOM (Document Object Model).
    // This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered
    componentDidMount() {

    }


    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        return (

            <div className="bg-dark d-flex justify-content-around py-4 w-100">
                <div className="col-3 d-flex flex-column">
                    <span className="text-muted fw-bold fst-italic mb-2">We make invoices</span>
                    <span className="text-muted">Currently V1.00</span>
                </div>
                <div className="col-3 d-flex flex-column">
                    <span className="text-muted fw-bold">Community</span>
                    <a href="https://github.com/Mich-moon/spring-react/issues" className="text-muted link-no-style">
                        <span className="ml-3"> Issues </span>
                        <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                </div>
                <div className="col-3 d-flex flex-column">
                    <span className="text-muted fw-bold">Links</span>
                    <Link to={`/`} className="text-muted link-no-style">
                        <span className="ml-3"> Home </span>
                    </Link>
                    <a href="#" className="text-muted link-no-style">
                        <span className="ml-3"> Docs </span>
                        <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                </div>

            </div>
        );

    }
}

export default Footer;