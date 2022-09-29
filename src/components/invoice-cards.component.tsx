import React from 'react';

import AuthService from "../services/AuthService";

import { withRouter, WithRouterProps } from './withRouter';

// types and interfaces
import { RoleEnum } from '../types/role.type'
import { StoredUser } from '../types/user.type'

// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    content: string | null
};


class InvoiceCards extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            content: null
        };
    }

    //  componentDidMount() - lifecycle method to execute code when the
    //      component is already placed in the DOM (Document Object Model).
    componentDidMount() {

        this.setState({ content: "something" });
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { content } = this.state;

        return (
            <div className="container p-0">
                {(content != null) ?

                    <div className="d-flex justify-content-between">

                        <div className="card mx-0 col-3">
                            <span className="fw-bold mb-1">Pending</span>
                            <div className="border-start border-2 bg-light"><span className="fs-2">###</span></div>
                        </div>
                        <div className="card mx-0 col-3">
                            <span className="fw-bold mb-1">Approved</span>
                            <div className="border-start border-2 bg-light"><span className="fs-2">###</span></div>
                        </div>
                        <div className="card mx-0 col-3">
                            <span className="fw-bold mb-1">Paid</span>
                            <div className="border-start border-2 bg-light"><span className="fs-2">###</span></div>
                        </div>
                    </div>

                : null}
            </div>
        );
    }
}

export default withRouter(InvoiceCards)