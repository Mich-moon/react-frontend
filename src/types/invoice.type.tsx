// type for invoice

export type InvoiceItem = {
    description: string,
    price: string,
    quantity: string,
    amount: string
};

export type Invoice = {
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

export type InvoiceData = {
    id: number,
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