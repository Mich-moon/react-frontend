import React from 'react';

import { InvoiceData, InvoiceItem } from '../types/invoice.type'

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
                            <header className="jumbotron d-flex justify-content-between align-items-center mx-4">
                                <img
                                  src="https://4m4you.com/wp-content/uploads/2020/06/logo-placeholder-300x120.png"
                                  alt="invoice-logo"
                                  className="invoice-logo mx-4"
                                />
                                <h3 className="mx-4"> Invoice </h3>
                            </header>
                            <hr className="mb-4 mx-4"/>
                            <div className="">

                                <form>
                                    <div className="row m-0">
                                        <div className="row m-0 col-12">
                                            <div className = "row mx-0 gx-1 col-md-6 col-sm-12">

                                                {/* Bill from */}
                                                <div className="form-group col-md-12 pb-1">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill from </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-lg">
                                                    <input
                                                      name="companyFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.companyFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneFrom"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneFrom}
                                                      readOnly
                                                    />
                                                </div>

                                                {/* Bill to */}
                                                <div className="form-group col-md-12 pb-1 mt-4">
                                                    <div className=" form-control col-md-12 border border-2 rounded-2 bg-light py-2">
                                                        <strong className=""> Bill to </strong>
                                                    </div>
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="nameTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.nameTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="companyTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.companyTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-12 pb-1 input-group-sm">
                                                    <input
                                                      name="streetTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.streetTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="cityTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.cityTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-4 pb-1 input-group-sm">
                                                    <input
                                                      name="stateTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.stateTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-2 pb-1 input-group-sm">
                                                    <input
                                                      name="zipTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.zipTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="phoneTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.phoneTo}
                                                      readOnly
                                                    />
                                                </div>

                                                <div className="form-group col-md-6 pb-1 input-group-sm">
                                                    <input
                                                      name="emailTo"
                                                      type="text"
                                                      className="form-control"
                                                      value={invoice.emailTo}
                                                      readOnly
                                                    />
                                                </div>

                                            </div>

                                            <div className = "col-md-6 col-sm-12 px-0 ">
                                                <div className="border border-2 rounded-2 mx-2">
                                                    <table className="table table-bordered-dark mb-0">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th> INVOICE # </th>
                                                                <th> DATE </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td> {invoice.id} </td>
                                                                <td> {invoice.date}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>


                                            <div className="px-0">

                                                {/* Items */}
                                                <div className = "row mx-0 px-0 gx-1 col-md-12">

                                                    <div className="form-group col-12 pb-1 mt-4">
                                                        <div className="form-control col-md-12 border border-2 rounded-2 bg-light py-2 d-flex">
                                                            <strong className="col-5"> Description </strong>
                                                            <strong className="col-2"> Price </strong>
                                                            <strong className="col-2"> Quantity </strong>
                                                            <strong className="col-3"> Amount </strong>
                                                        </div>
                                                    </div>

                                                    {invoice && invoice.items != null && invoice.items.map( (item: InvoiceItem, index: number) =>

                                                        <div key={index} className="col-12 d-flex mb-1">
                                                            <div className="input-group-sm col-5">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-star"
                                                                  value={item.description}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.price}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-2">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.quantity}
                                                                  readOnly
                                                                />
                                                            </div>
                                                            <div className="input-group-sm col-3">
                                                                <input
                                                                  type="text"
                                                                  className="form-control text-start"
                                                                  value={item.amount}
                                                                  readOnly
                                                                />
                                                            </div>

                                                        </div>
                                                    )}

                                                </div>

                                                <div className = "row mx-0 px-0 gx-1 col-12 pt-2 d-flex justify-content-between">

                                                    {/* comments */}
                                                    <div className = "row col-md-7 col-sm-12">
                                                        <div className="form-control border border-2 rounded-2 bg-light">
                                                            <span className=""> Comments </span>
                                                        </div>
                                                        <textarea
                                                            name="comments"
                                                            className="form-control input-group-sm"
                                                            value={invoice.comments}
                                                            readOnly
                                                        />
                                                    </div>

                                                    {/* invoice summaries */}
                                                    <div className = "d-flex flex-column col-md-5 col-sm-12">

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> subtotal </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> {invoice.subtotal} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase"> tax </span>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <span> {invoice.tax} </span>
                                                            </div>
                                                        </div>

                                                        <div className="row d-flex">
                                                            <div className="col-6 text-start">
                                                                <span className="text-uppercase fw-bold"> total due </span>
                                                            </div>
                                                            <div className="col-6 text-end fw-bold">
                                                                <span> {invoice.totalDue} </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                : null}
            </div>
        );
    }

}

export default Test
