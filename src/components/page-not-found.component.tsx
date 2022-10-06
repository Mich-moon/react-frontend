import React from 'react';

import { Link } from "react-router-dom";

import { withRouter, WithRouterProps } from './withRouter';

// types for the component props
interface Params {};

type Props = WithRouterProps<Params>;

type State = {
    content: string
};

class NotFound extends React.Component <Props, State>{

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            content: ""
        }

    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {
        return (
            <div className="container">

                <img
                  src="https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png"
                  alt="not-found-img"
                  className="img-big"
                />

                <span className="d-block mt-2 fw-bold"> Sorry, we can't find what you're looking for </span>

                <Link to={`/`} className="btn btn-sm btn-info admin-action mt-4">Go back home</Link>

            </div>
        );
    }

}

export default withRouter(NotFound)
