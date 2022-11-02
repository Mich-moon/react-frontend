// Data service with methods for manipulating invoice data stored on the server

import axiosInstance from './MyAxios';

// types and interfaces
import { InvoiceItem } from '../types/invoice.type'
import { Invoice } from '../types/invoice.type'
import { IStatus } from '../types/invoice.type'


const INVOICES_REST_API_URL = 'http://localhost:8080/api/v1/';

class InvoiceService {

    createInvoice(invoice: Invoice) {
        return axiosInstance.post(INVOICES_REST_API_URL + "invoice", {
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
            items: invoice.items,
            comments: invoice.comments,
            createdBy: invoice.createdBy,
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            tax: invoice.tax,
            totalDue: invoice.totalDue
        });
    }

    getInvoices() {
        return axiosInstance.get(INVOICES_REST_API_URL + "invoices");
    }

    getUserInvoices(id: number) {
        return axiosInstance.get(INVOICES_REST_API_URL + "user/" + id +"/invoices");
    }

    getInvoice(id: number) {
        return axiosInstance.get(INVOICES_REST_API_URL + "invoice/" + id);
    }

    deleteInvoice(id: number) {
        return axiosInstance.delete(INVOICES_REST_API_URL + "invoice/" + id);
    }

    updateInvoice(id: number, invoice: Invoice) {
        return axiosInstance.put(INVOICES_REST_API_URL + "invoice/" + id, invoice);
    }

    updateInvoiceStatus(id: number, status: IStatus) {
        return axiosInstance.patch(INVOICES_REST_API_URL + "invoice/" + id + "/status",
            null,
            { params: {
                        status
            }}
        );
    }

}

export default new InvoiceService();
