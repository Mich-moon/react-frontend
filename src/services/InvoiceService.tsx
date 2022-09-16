// Data service with methods for manipulating invoice data stored on the server

import axiosInstance from './MyAxios';

// types and interfaces
import { InvoiceItem } from '../types/invoice.type'
import { Invoice } from '../types/invoice.type'

type IStatus = "draft" | "pending" | "approved" | "paid"

const INVOICES_REST_API_URL = 'http://localhost:8080/api/invoices/';

class InvoiceService {

    createInvoice(invoice: Invoice) {
        return axiosInstance.post(INVOICES_REST_API_URL, {
            companyFrom: invoice.companyFrom,
            streetFrom: invoice.streetFrom,
            cityFrom: invoice.cityFrom,
            stateFrom: invoice.stateFrom,
            zipFrom: invoice.zipFrom,
            phoneFrom: invoice.phoneFrom,
            nameTo: invoice.nameTo,
            companyTo: invoice.companyTo,
            streetTo: invoice.streetTo,
            cityTo: invoice.cityTo,
            stateTo: invoice.stateTo,
            zipTo: invoice.zipTo,
            phoneTo: invoice.phoneTo,
            emailTo: invoice.emailTo,
            items: invoice.invoiceItems,
            comments: invoice.comments,
            createdBy: invoice.createdBy
        });
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
