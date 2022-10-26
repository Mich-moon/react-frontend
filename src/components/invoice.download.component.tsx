import React from 'react';

import { InvoiceData, InvoiceItemUnique } from '../types/invoice.type'

// types for the component props
type Props = {
    invoice: InvoiceData;
};

type State = {};

class Test extends React.Component <Props, State>{

    /** to store this component's ref to provide access to its DOM */
    private invref: React.RefObject<HTMLDivElement>;

    // constructor() - is invoked before the component is mounted.
    constructor(props: Props) {

        // declare state variables
        super(props);
        this.state = {};

        this.invref= React.createRef(); // create the reference

    }

    //  render() - lifecycle method that outputs HTML to the DOM.
    render() {
        const { invoice } = this.props;

        return (
            <div ref={this.invref} className="container">

                {(invoice && invoice != null) ?
                    <div>

                        {/* invoice details */}
                        <div className="card">

                            <header className="d-flex d-print-flex align-items-center my-5">
                                <div className="bg-dark text-light col-md-6 col-sm-12 px-0 py-4 me-auto">
                                    <h3 className="fs-1 mx-4"> INVOICE </h3>
                                </div>

                                <div className="d-flex d-print-flex justify-content-end col-md-6 col-sm-12">

                                    <div className="fw-bold d-inline d-print-inline col-sm-6 d-flex d-print-flex flex-column px-3">
                                        <div className="d-flex d-print-flex col-12 ms-auto">
                                            <span className="col-6 text-start"> INVOICE #: </span>
                                            <span className="col-6 text-end"> {invoice.id} </span>
                                        </div>
                                        <div className="d-flex d-print-flex col-12 ms-auto">
                                            <span className="col-6 text-start"> DATE: </span>
                                            <span className="col-6 text-end"> {invoice.date} </span>
                                        </div>
                                    </div>

                                    <div className="bg-dark d-inline d-print-inline col-sm-3">
                                        <div className="px-4"></div><div className="px-4"></div>
                                    </div>

                                </div>
                            </header>

                            <div className="px-4 mb-2">

                                <form>
                                    <div className="row m-0">
                                        <div className="row m-0 col-12 d-flex d-print-flex justify-content-between">

                                            {/* Bill to */}
                                            <div className="text-start d-flex d-print-flex flex-column mx-0 gx-1 col-md-6 col-sm-12">

                                                <div className="col-md-12 pb-1">
                                                    <div className="col-md-12 border border-2 bg-light p-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.nameTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.companyTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.streetTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.cityTo}, {invoice.stateTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.zipTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.phoneTo}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4">
                                                    <span className="">
                                                        {invoice.emailTo}
                                                    </span>
                                                </div>

                                            </div>

                                            {/* Bill from */}
                                            <div className="text-start d-flex d-print-flex flex-column mx-0 gx-1 col-md-5 col-sm-8">

                                                <div className="col-md-12 pb-1 px-4 border-start border-2 fs-5">
                                                    <span className="fw-bold">
                                                        {invoice.companyFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.streetFrom}, {invoice.cityFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.stateFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.zipFrom}
                                                    </span>
                                                </div>

                                                <div className="col-md-12 pb-1 px-4 border-start border-2">
                                                    <span className="">
                                                        {invoice.phoneFrom}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="px-0">

                                                {/* Items */}
                                                <div className="row mx-0 px-0 gx-1 col-md-12">

                                                    <div className="bg-dark text-light col-md-12 pb-1 mt-4 py-2 d-flex d-print-flex">
                                                        <strong className="col-5"> Description </strong>
                                                        <strong className="col-2"> Price </strong>
                                                        <strong className="col-2"> Quantity </strong>
                                                        <strong className="col-3"> Amount </strong>
                                                    </div>

                                                    {invoice && invoice.items != null && invoice.items.map( (item: InvoiceItemUnique) =>

                                                        <div key={item.id} className="col-12 d-flex d-print-flex py-2 border-bottom border-2">
                                                            <div className="col-5">
                                                                <span className="text-start">
                                                                    {item.description}
                                                                </span>
                                                            </div>
                                                            <div className="col-2">
                                                                <span className="text-start">
                                                                    $ {item.price}
                                                                </span>
                                                            </div>
                                                            <div className="col-2">
                                                                <span className="text-start">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="col-3">
                                                                <span className="text-start">
                                                                    $ {item.amount}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>

                                                <div className="row mx-0 px-0 gx-1 col-12 pt-2 mt-4 d-flex d-print-flex justify-content-between">

                                                    {/* comments */}
                                                    <div className="row col-md-7 col-sm-12">
                                                        <div className="border border-2 bg-light">
                                                            <span className="fw-bold"> Comments </span>
                                                        </div>
                                                        <span className="text-start text-wrap">
                                                            {invoice.comments}
                                                        </span>
                                                    </div>

                                                    {/* invoice summaries */}
                                                    <div className = "d-flex d-print-flex flex-column col-md-5 col-sm-12">

                                                        <div className="row d-flex d-print-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> subtotal </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> $ {invoice.subtotal} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> tax </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> $ {invoice.tax} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex d-print-flex fs-5">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase fw-bold"> total due </span>
                                                            </div>
                                                            <div className="col-6 text-end fw-bold">
                                                                <span> $ {invoice.totalDue} </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-dark py-4 mt-4 w-100">
                                <div className="my-3"></div>
                                <span className="text-muted fst-italic">Thank You for your business</span>
                                <div className="my-3"></div>
                            </div>

                        </div>
                    </div>
                : null}
            </div>
        );
    }

}

export default Test
