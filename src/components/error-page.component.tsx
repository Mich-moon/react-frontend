/*
Error boundaries are React components that catch JavaScript errors anywhere in their child component tree,
log those errors, and display a fallback UI instead of the component tree that crashed.

Error boundaries catch errors during rendering, in lifecycle methods,
and in constructors of the whole tree below them.
*/

import React, { ErrorInfo, ReactNode } from "react";


// types for the component props
type Props = {
    children: ReactNode

};

type State = {
    hasError: boolean,
    error: null | Error,
    errorInfo: null | ErrorInfo
};


class ErrorBoundary extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    // getDerivedStateFromError() - to render a fallback UI after an error has been thrown.
    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    // componentDidCatch() - to log error information.
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {

        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo
        });


        // You can also log the error to an error reporting service
        //logErrorToMyService(error, errorInfo);
    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        if (this.state.hasError) {
            // Render any custom fallback UI

            return (
                <div>
                    <h2>Something went wrong.</h2>
                </div>
            );

        }

        // render the children
        return this.props.children;
    }
}

export default ErrorBoundary
