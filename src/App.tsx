import React from 'react';
import $ from 'jquery';

import { Routes, Route } from "react-router-dom";
//import { Helmet } from "react-helmet"
import Sidebar from "react-sidebar";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import NotFound from "./components/page-not-found.component";
import Settings from "./components/settings.component";

import ViewUser from "./components/view-user.component";
import EditUser from "./components/edit-user.component";
import ViewInvoice from "./components/invoice.view.component";


import CreateInvoice from './components/new-invoice.component';

import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";

import Navbar from "./components/navbar.component";
import SidebarContent from "./components/sidebar-content.component"


// types for the component props
type Props = {};

type State = {
    /** */
    content: string,

    /** whether or not the sidebar is open */
    sidebarOpen: boolean,

    /** whether or not the sidebar should be docked on page */
    sidebarDocked: boolean
};

/** media query for when the sidebar should be docked on page
    Viewport is less or equal to 900 pixels wide
*/
const mql = window.matchMedia(`(min-width: 900px)`);


class App extends React.Component<Props, State> {

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {
            content: "",
            sidebarDocked: mql.matches,  // check viewport size against mql media query...
            sidebarOpen: true
        };

        // bind methods so that they are accessible from the state inside of the render() method.
        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);

    }

    // componentWillUnmount() - lifecycle method to execute code when the component gets destroyed or unmounted from the DOM (Document Object Model).
    componentWillUnmount() {
        mql.removeListener(this.mediaQueryChanged);
    }

    // componentDidMount() - lifecycle method to execute code when the
    // component is already placed in the DOM (Document Object Model).
    // This method is called during the Mounting phase of the React Life-cycle i.e after the component is rendered
    componentDidMount() {
        mql.addListener(this.mediaQueryChanged);

        // jquery code
        this.JQueryCode()
    }

    // jquery
    JQueryCode = () => {
        $('#sidebarCollapse').on('click', function () {
            //console.log('sidebar toggle pressed');
        });
    }

    onSetSidebarOpen() {
        // sidebar state is set to open
        this.setState({ sidebarOpen: true });
    }

    toggle() {
        // toggle sidebar state between open & docked and closed & not docked
        if (this.state.sidebarOpen) {
            this.setState({ sidebarOpen: false });
            this.setState({ sidebarDocked: false });
            //console.log("changed to false");
        } else {
            this.setState({ sidebarOpen: true });
            this.setState({ sidebarDocked: true });
            //console.log("changed to true");
        }
    }

    mediaQueryChanged() {
        this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
    }


    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {

        const { sidebarOpen, sidebarDocked } = this.state;

        return (

            <div className="App">

                {/* SIDEBAR COMPONENT */}
                <Sidebar
                  sidebar={<SidebarContent />}
                  open={sidebarOpen}
                  docked={sidebarDocked}
                  onSetOpen={this.onSetSidebarOpen}
                >

                    {/* TOP NAVIGATION BAR */}
                    <Navbar/>

                    {/* toggle sidebar button */}
                    <button
                      type="button"
                      id="sidebarCollapse"
                      className="btn btn-primary sidebar-toggle"
                      onClick={() => this.toggle()}
                    >
                        { sidebarOpen ?
                            <i className="bi bi-arrow-bar-left align-self-center"></i>
                        :
                            <i className="bi bi-arrow-bar-right align-self-center"></i>
                        }
                        <span className="mx-1"></span>
                        <span>Toggle Sidebar</span>
                    </button>


                    {/* Defining all routes for app */}
                    <div className="container mt-3">

                        <Routes>
                            { /* You don't need to use an exact prop... all paths match exactly by default. */}
                            <Route path="/" element={ <Home/> } />
                            <Route path="/home" element={ <Home/> } />

                            <Route path="/login" element={ <Login/> } />
                            <Route path="/register" element={ <Register/> } />

                            <Route path="/profile" element={ <Profile/> } />
                            <Route path="/user" element={ <BoardUser/> } />
                            <Route path="/mod" element={ <BoardModerator/> } />
                            <Route path="/admin" element={ <BoardAdmin/> } />
                            <Route path="/settings" element={ <Settings/> } />

                            <Route path="*" element={ <NotFound/> } />     {/* fallback for unmatched route */}

                            <Route path="/userview/:userID" element={ <ViewUser/> } />
                            <Route path="/edituser/:userID" element={ <EditUser/> } />

                            <Route path="/newinvoice" element={ <CreateInvoice/> } />
                            <Route path="/invoiceview/:invoiceID" element={ <ViewInvoice/> } />

                        </Routes>
                    </div>


                    {/* script tags */}
                    {/*<Helmet> */}

                        {/* Bootstrap JS */}
                        {/*<script
                            src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"
                            integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
                            crossOrigin="anonymous"
                        ></script>

                    </Helmet>*/}

                </Sidebar>

            </div>
        );

    }
}

export default App;
