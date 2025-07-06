// src/components/FormLayout.jsx
import React from 'react';

function FormLayout({ children }) {
    return (
        <div className="form-layout container-fluid py-4">
            <div className="row">
                {/* Left side for form fields */}
                <div className="col-lg-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default FormLayout;
