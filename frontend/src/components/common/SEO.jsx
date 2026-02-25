import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type }) => {
    return (
        <Helmet>
            <title>{title ? `${title} | Premium Sales Manage` : 'Premium Sales Manage ERP'}</title>
            <meta name="description" content={description || "Premium sales management ERP for your business."} />
            <meta name="keywords" content="ERP, Sales Management, Inventory, POS" />
            <meta property="og:type" content={type || "website"} />
            <meta property="og:title" content={title || "Premium Sales Manage ERP"} />
            <meta property="og:description" content={description || "Premium sales management ERP for your business."} />
            <meta name="twitter:creator" content={name || "SalesManage"} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || "Premium Sales Manage ERP"} />
            <meta name="twitter:description" content={description || "Premium sales management ERP for your business."} />
        </Helmet>
    );
};

export default SEO;
