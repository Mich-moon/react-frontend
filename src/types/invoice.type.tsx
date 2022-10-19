// type for invoice

export type InvoiceItem = {
    /** words used to identify the item */
    description: string,

    /** the currency value of the item */
    price: string,

    /** how much of the item required */
    quantity: string,

    /** price multiplied by quantity */
    amount: string
};

export type InvoiceItemUnique = {
    /** unique identification */
    id: number,

    /** words used to identify the item */
    description: string,

    /** the currency value of the item */
    price: string,

    /** how much of the item required */
    quantity: string,

    /** price multiplied by quantity */
    amount: string
};

export type Invoice = {
    /** Name of company being billed */
    companyFrom: string,

    /** street address of company being billed*/
    streetFrom: string,

    /** city of company being billed*/
    cityFrom: string;

    /** state of company being billed*/
    stateFrom: string,

    /** zip code of company being billed*/
    zipFrom: string,

    /** phone number of company being billed*/
    phoneFrom: string,

    /** name of individual to be paid */
    nameTo: string,

    /** company name of individual to be paid */
    companyTo: string,

    /** street address of individual to be paid */
    streetTo: string,

    /** city of individual to be paid */
    cityTo: string,

    /** state of individual to be paid */
    stateTo: string,

    /** zip code of individual to be paid*/
    zipTo: string,

    /** phone number of individual to be paid */
    phoneTo: string,

    /** email address of individual to be paid */
    emailTo: string,

    /** list of items for the invoice */
    items: InvoiceItem[],

    /** additional words to be considered */
    comments: string,

    /** id number os user creating the invoice */
    createdBy: number,

    /** Sum of all invoice items amounts */
    subtotal: string,

    /** Rate of tax applied to subtotal */
    taxRate: string,

    /** Amount of tax to be added */
    tax: string,

    /** Subtotal plus tax */
    totalDue: string

};

export type IStatus = "draft" | "pending" | "approved" | "paid"; // possible status values for invoices

export type InvoiceData = {
    /** unique identification for the invoice */
    id: number,

    /** Name of company being billed */
    companyFrom: string,

    /** street address of company being billed*/
    streetFrom: string,

    /** city of company being billed*/
    cityFrom: string;

    /** state of company being billed*/
    stateFrom: string,

    /** zip code of company being billed*/
    zipFrom: string,

    /** phone number of company being billed*/
    phoneFrom: string,

    /** name of individual to be paid */
    nameTo: string,

    /** company name of individual to be paid */
    companyTo: string,

    /** street address of individual to be paid */
    streetTo: string,

    /** city of individual to be paid */
    cityTo: string,

    /** state of individual to be paid */
    stateTo: string,

    /** zip code of individual to be paid*/
    zipTo: string,

    /** phone number of individual to be paid */
    phoneTo: string,

    /** email address of individual to be paid */
    emailTo: string,

    /** list of items for the invoice */
    items: InvoiceItemUnique[],

    /** additional words to be considered */
    comments: string,

    /** id number os user creating the invoice */
    createdBy: number,

    /** Sum of all invoice items amounts */
    subtotal: string,

    /** Rate of tax applied to subtotal */
    taxRate: string,

    /** Amount of tax to be added */
    tax: string,

    /** Subtotal plus tax */
    totalDue: string,

    /** status of the invoice */
    status: IStatus,

    /** date the invoice was created */
    date: string
};
