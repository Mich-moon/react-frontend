
/**
 *  custom withRouter Higher Order Component
 *  HOC that gives access to route props history, location, match and navigate which are
 *  not available for class components
 *
 *  An HOC is a function that takes a component and returns a new component
 *  It wraps another component to provide additional props or functionality to the wrapped component
 */


import { useLocation, useNavigate, useParams } from 'react-router-dom';
import React, { useState, ComponentType } from 'react';

// interface typings for props of withRouter component
export interface WithRouterProps<T = ReturnType<typeof useParams>> {

    history: {
        back: () => void;
        goBack: () => void;
        location: ReturnType<typeof useLocation>;
        push: (url: string, state?: any) => void;
    };
    location: ReturnType<typeof useLocation>;
    match: {
        params: T;
    };
    navigate: ReturnType<typeof useNavigate>;
}

// functional component that serves as HOC
export const withRouter = <P extends object>(Component: ComponentType<P>) => {

    return (props: Omit<P, keyof WithRouterProps>) => {

        //NB - withRouter is typed such that it will pass in the props of its wrapped
        //  component except for the props which it injects (of type
        //  WithRouterProps) --> props: Omit<P, keyof WithRouterProps>

        // Inject props into the wrapped component.
        //  These are usually state values or instance methods.
        const location = useLocation();
        const match = { params: useParams() };
        const navigate = useNavigate();

        const history = {
            back: () => navigate(-1),
            goBack: () => navigate(-1),
            location,
            push: (url: string, state?: any) => navigate(url, { state }),
            replace: (url: string, state?: any) => navigate(url, {replace: true, state})
        };

        // Pass props to wrapped component
        return (
            <Component
              history={history}
              location={location}
              match={match}
              navigate={navigate}
              {...props as P} // pass through the props of wrapped component
            />
        );
    };
};