// Data service with methods for manipulating invoice data stored on the server

import axiosInstance from './MyAxios';

const INVOICES_REST_API_URL = 'http://localhost:8080/api/invoices/';

// types and interfaces
type InvoiceItem = {
    description: string,
    price: string,
    quantity: string,
    amount: string
};

type Invoice = {
    companyFrom: string,
    streetFrom: string,
    cityFrom: string;
    stateFrom: string,
    zipFrom: string,
    phoneFrom: string,
    nameTo: string,
    companyTo: string,
    streetTo: string,
    cityTo: string,
    stateTo: string,
    zipTo: string,
    phoneTo: string,
    emailTo: string,
    invoiceItems: InvoiceItem[],
    comments: string,
    createdBy: number
};

type IStatus = "draft" | "pending" | "approved" | "paid"

class InvoiceService {

    createInvoice(invoice: Invoice) {
        return axiosInstance.post(INVOICES_REST_API_URL, invoice);
    }

    getInvoices() {
        return axiosInstance.get(INVOICES_REST_API_URL);
    }

    getInvoice(id: number) {
        return axiosInstance.get(INVOICES_REST_API_URL + id);
    }

    deleteInvoice(id: number) {
        return axiosInstance.delete(INVOICES_REST_API_URL + id);
    }

    updateInvoice(invoice: Invoice, id: number) {
        return axiosInstance.put(INVOICES_REST_API_URL + id, invoice);
    }

    updateInvoiceStatus(id: number, status: IStatus) {
        return axiosInstance.put(INVOICES_REST_API_URL + id + "/update-status", null, { params: {
            status
        }}

        );
    }

}

export default new InvoiceService();
