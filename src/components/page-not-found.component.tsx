import React from 'react';


// types for the component props
type Props = {};

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
                <header className="jumbotron">
                    <h3> Page not found </h3>
                </header>
            </div>
        );
    }

}

export default NotFound
